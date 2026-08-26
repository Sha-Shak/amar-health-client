import { ApiRequestError } from "./api-client";

const MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: "An account with this email already exists.",
  PHONE_TAKEN: "An account with this phone number already exists.",
  PHONE_ALREADY_SET: "A phone number is already on this account.",
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
  TARGET_HAS_PENDING_INVITE: "This person already has a pending invitation to another family group.",
  INVITATION_NOT_FOUND: "This invitation is invalid or has expired.",
  NOT_YOUR_INVITATION: "This invitation was sent to a different account.",
  NOT_IN_GROUP: "You don't belong to a family group.",
  REQUEST_NOT_FOUND: "This blood request no longer exists.",
  NOT_REQUEST_OWNER: "Only the person who posted this request can do that.",
  CANNOT_RESPOND_TO_OWN_REQUEST: "You can't respond to your own request.",
  DONOR_NOT_FOUND: "That donor account could not be found.",
  CANNOT_CONFIRM_SELF: "You can't confirm yourself as the donor.",
  DONOR_NOT_INTERESTED: "That person hasn't expressed interest in this request.",
  // DONATION_GAP_NOT_MET deliberately omitted — the backend's own message
  // already includes the exact eligible-again date, which is more useful
  // than any fixed string here (see errorMessage()'s fallback to err.message).
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    return MESSAGES[err.code] ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong — please try again.";
}
