type ClerkErrorLike = {
  errors?: Array<{
    longMessage?: string;
    message?: string;
  }>;
};

export const getClerkErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "object" && error !== null && "errors" in error) {
    const clerkError = error as ClerkErrorLike;
    const message = clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message;

    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
