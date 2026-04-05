import {clerkClient} from "@clerk/express";
import prisma from "../configs/prisma.js";

export const workspaceInclude = {
  members: {include: {user: true}},
  projects: {
    include: {
      tasks: {include: {assignee: true}},
      members: {include: {user: true}},
    },
  },
  owner: true,
};

export const normalizeWorkspaceRole = (role) => {
  const normalizedRole = String(role ?? "org:member")
    .replace(/^org:/i, "")
    .toUpperCase();

  return normalizedRole === "ADMIN" ? "ADMIN" : "MEMBER";
};

const getPrimaryEmail = (user) => {
  return (
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    ""
  );
};

const getUserName = (user) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || getPrimaryEmail(user) || "Unknown User";
};

const ensureUser = async ({id, email, name, image}) => {
  return prisma.user.upsert({
    where: {id},
    create: {
      id,
      email,
      name,
      image,
    },
    update: {
      email,
      name,
      image,
    },
  });
};

const getAllPaginatedResults = async (fetchPage) => {
  const results = [];
  const limit = 100;
  let offset = 0;
  let totalCount = 0;

  do {
    const response = await fetchPage({limit, offset});
    results.push(...response.data);
    totalCount = response.totalCount ?? response.data.length;
    offset += response.data.length;
    if (response.data.length === 0) {
      break;
    }
  } while (results.length < totalCount);

  return results;
};

export const upsertUserFromClerk = async (clerkUserId) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  return ensureUser({
    id: clerkUser.id,
    email: getPrimaryEmail(clerkUser),
    name: getUserName(clerkUser),
    image: clerkUser.imageUrl,
  });
};

export const upsertUserFromWebhookData = async (data) => {
  const primaryEmailAddressId = data?.primary_email_address_id;
  const email =
    data?.email_addresses?.find((emailAddress) => emailAddress.id === primaryEmailAddressId)
      ?.email_address ||
    data?.email_addresses?.[0]?.email_address ||
    "";
  const name = [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim() || email;

  return ensureUser({
    id: data.id,
    email,
    name: name || "Unknown User",
    image: data?.image_url ?? "",
  });
};

const resolveOrganizationOwnerId = async (organizationId, fallbackOwnerId) => {
  const organization = await clerkClient.organizations.getOrganization({organizationId});
  return organization.createdBy || fallbackOwnerId;
};

export const upsertWorkspaceFromClerkOrganization = async (organization, fallbackOwnerId) => {
  const ownerId = await resolveOrganizationOwnerId(organization.id, fallbackOwnerId);

  if (ownerId) {
    await upsertUserFromClerk(ownerId);
  }

  return prisma.workspace.upsert({
    where: {id: organization.id},
    create: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.publicMetadata?.description ?? null,
      ownerId,
      image_url: organization.imageUrl ?? "",
    },
    update: {
      name: organization.name,
      slug: organization.slug,
      description: organization.publicMetadata?.description ?? null,
      ownerId,
      image_url: organization.imageUrl ?? "",
    },
  });
};

export const upsertWorkspaceFromWebhookData = async (data) => {
  const ownerId = data.created_by || (await resolveOrganizationOwnerId(data.id));

  if (ownerId) {
    await upsertUserFromClerk(ownerId);
  }

  await prisma.workspace.upsert({
    where: {id: data.id},
    create: {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data?.description ?? null,
      ownerId,
      image_url: data?.image_url ?? "",
    },
    update: {
      name: data.name,
      slug: data.slug,
      description: data?.description ?? null,
      ownerId,
      image_url: data?.image_url ?? "",
    },
  });

  if (!ownerId) {
    return;
  }

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: ownerId,
        workspaceId: data.id,
      },
    },
    update: {
      role: "ADMIN",
    },
    create: {
      userId: ownerId,
      workspaceId: data.id,
      role: "ADMIN",
    },
  });
};

export const syncOrganizationMembershipFromClerk = async ({
  organizationId,
  userId,
  role,
  organization,
  fallbackOwnerId,
  skipWorkspaceSync = false,
}) => {
  if (!skipWorkspaceSync) {
    if (organization) {
      await upsertWorkspaceFromClerkOrganization(organization, fallbackOwnerId ?? userId);
    } else if (organizationId) {
      const fetchedOrganization = await clerkClient.organizations.getOrganization({organizationId});
      await upsertWorkspaceFromClerkOrganization(fetchedOrganization, fallbackOwnerId ?? userId);
    }
  }

  await upsertUserFromClerk(userId);

  return prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: organizationId ?? organization.id,
      },
    },
    create: {
      userId,
      workspaceId: organizationId ?? organization.id,
      role: normalizeWorkspaceRole(role),
    },
    update: {
      role: normalizeWorkspaceRole(role),
    },
  });
};

export const syncOrganizationMembershipFromWebhookData = async (data) => {
  const organizationId = data.organization?.id || data.organization_id;
  const userId = data.public_user_data?.user_id || data.user_id;

  if (!organizationId || !userId) {
    throw new Error("Missing organization or user identifiers in Clerk membership payload.");
  }

  await syncOrganizationMembershipFromClerk({
    organizationId,
    userId,
    role: data.role ?? data.role_name,
    organization: data.organization
      ? {
          id: data.organization.id,
          name: data.organization.name,
          slug: data.organization.slug,
          imageUrl: data.organization.image_url ?? "",
          publicMetadata: data.organization.public_metadata ?? {},
        }
      : undefined,
    fallbackOwnerId: data.organization?.created_by ?? userId,
  });
};

export const deleteOrganizationMembershipFromWebhookData = async (data) => {
  const organizationId = data.organization?.id || data.organization_id;
  const userId = data.public_user_data?.user_id || data.user_id;

  if (!organizationId || !userId) {
    return;
  }

  await prisma.workspaceMember.deleteMany({
    where: {
      workspaceId: organizationId,
      userId,
    },
  });
};

export const syncOrganizationMembersFromClerk = async (organizationId, fallbackOwnerId) => {
  const memberships = await getAllPaginatedResults(({limit, offset}) =>
    clerkClient.organizations.getOrganizationMembershipList({
      organizationId,
      limit,
      offset,
    }),
  );

  if (memberships.length === 0) {
    return [];
  }

  await upsertWorkspaceFromClerkOrganization(
    memberships[0].organization,
    fallbackOwnerId ?? memberships[0].publicUserData?.userId,
  );

  const syncedUserIds = await Promise.all(
    memberships.map(async (membership) => {
      const memberUserId = membership.publicUserData?.userId;

      if (!memberUserId) {
        return null;
      }

      await syncOrganizationMembershipFromClerk({
        organizationId,
        userId: memberUserId,
        role: membership.role,
        organization: membership.organization,
        fallbackOwnerId,
        skipWorkspaceSync: true,
      });

      return memberUserId;
    }),
  );

  const activeUserIds = syncedUserIds.filter(Boolean);

  if (activeUserIds.length > 0) {
    await prisma.workspaceMember.deleteMany({
      where: {
        workspaceId: organizationId,
        userId: {
          notIn: activeUserIds,
        },
      },
    });
  }

  return memberships;
};

export const syncUserWorkspacesFromClerk = async (userId) => {
  await upsertUserFromClerk(userId);

  const memberships = await getAllPaginatedResults(({limit, offset}) =>
    clerkClient.users.getOrganizationMembershipList({
      userId,
      limit,
      offset,
    }),
  );

  const organizationIds = [];

  for (const membership of memberships) {
    organizationIds.push(membership.organization.id);
    await syncOrganizationMembersFromClerk(membership.organization.id, userId);
  }

  await prisma.workspaceMember.deleteMany({
    where: {
      userId,
      ...(organizationIds.length > 0
        ? {
            workspaceId: {
              notIn: organizationIds,
            },
          }
        : {}),
    },
  });

  return memberships;
};
