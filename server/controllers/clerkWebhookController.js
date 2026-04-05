import {verifyWebhook} from "@clerk/express/webhooks";
import {inngest} from "../inngest/index.js";

const supportedClerkEventTypes = new Set([
  "user.created",
  "user.updated",
  "user.deleted",
  "organization.created",
  "organization.updated",
  "organization.deleted",
  "organizationMembership.created",
  "organizationMembership.updated",
  "organizationMembership.deleted",
  "organizationInvitation.accepted",
]);

const getWebhookSigningSecret = () =>
  process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET;

export const handleClerkWebhook = async (req, res) => {
  try {
    const evt = await verifyWebhook(req, {
      signingSecret: getWebhookSigningSecret(),
    });

    if (!supportedClerkEventTypes.has(evt.type)) {
      return res.status(200).json({received: true, skipped: true});
    }

    const svixIdHeader = req.headers["svix-id"];
    const eventId = Array.isArray(svixIdHeader) ? svixIdHeader[0] : svixIdHeader;

    await inngest.send({
      ...(eventId ? {id: eventId} : {}),
      name: `clerk/${evt.type}`,
      data: evt.data,
    });

    res.status(200).json({received: true});
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    res.status(400).json({message: "Invalid Clerk webhook request."});
  }
};
