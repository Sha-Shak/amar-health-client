import { api } from "@/lib/api-client";
import type {
  FamilyGroup,
  FamilyMember,
  InvitationContext,
  MyFamilyGroup,
  MyInvite,
} from "./types";

export const familyApi = {
  createGroup: () => api.post<FamilyGroup>("/patient/family-groups"),

  getMyGroup: () => api.get<MyFamilyGroup | null>("/patient/family-groups/me"),

  // Invites addressed to the current user (as invitee) — independent of whether
  // they own or belong to a group, so this is what the family page shows for
  // someone who hasn't decided whether to accept yet.
  getMyInvites: () => api.get<MyInvite[]>("/patient/family-groups/invitations"),

  invite: (phoneOrEmail: string) =>
    api.post<FamilyMember>("/patient/family-groups/invite", { phoneOrEmail }),

  getInvitationContext: (token: string) =>
    api.get<InvitationContext>(`/patient/family-groups/invitations/${token}`, { auth: false }),

  acceptInvitation: (token: string) =>
    api.post<FamilyMember>(`/patient/family-groups/invitations/${token}/accept`),

  declineInvitation: (token: string) =>
    api.post<FamilyMember>(`/patient/family-groups/invitations/${token}/decline`),

  removeMember: (memberId: string) =>
    api.delete<FamilyMember>(`/patient/family-groups/members/${memberId}`),

  leaveGroup: () =>
    api.post<{ wasOwner: boolean; groupDeleted: boolean }>("/patient/family-groups/leave"),
};
