import { ApiRequestError } from "./api-client";

const MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: "An account with this email already exists.",
  PHONE_TAKEN: "An account with this phone number already exists.",
  INVALID_CREDENTIALS: "Incorrect phone/email or password.",
  ACCOUNT_NOT_ACTIVE: "This account is not active.",
  INVALID_RESET_TOKEN: "This reset link is invalid or expired.",
  VALIDATION_ERROR: "Please check the highlighted fields.",
  GOOGLE_AUTH_UNAVAILABLE: "Google sign-in isn't available right now.",
  INVALID_GOOGLE_TOKEN: "Couldn't verify that Google sign-in — please try again.",
  ALREADY_IN_GROUP: "You already own or belong to a family group.",
  NOT_A_GROUP_OWNER: "You must own a family group to invite members.",
  USER_NOT_FOUND: "No account found for that phone number or email — they need to sign up first.",
  CANNOT_INVITE_SELF: "You can't invite yourself.",
  ALREADY_INVITED: "This person is already invited or a member.",
  TARGET_ALREADY_IN_GROUP: "This person already belongs to another family group.",
  INVITATION_NOT_FOUND: "This invitation is invalid or has expired.",
  NOT_YOUR_INVITATION: "This invitation was sent to a different account.",
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    return MESSAGES[err.code] ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong — please try again.";
}
