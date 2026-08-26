import { api } from "@/lib/api-client";
import type {
  FamilyGroup,
  FamilyMember,
  InvitationContext,
  MyFamilyGroup,
} from "./types";

export const familyApi = {
  createGroup: () => api.post<FamilyGroup>("/patient/family-groups"),

  getMyGroup: () => api.get<MyFamilyGroup | null>("/patient/family-groups/me"),

  invite: (phoneOrEmail: string) =>
    api.post<FamilyMember>("/patient/family-groups/invite", { phoneOrEmail }),

  getInvitationContext: (token: string) =>
    api.get<InvitationContext>(`/patient/family-groups/invitations/${token}`, { auth: false }),

  acceptInvitation: (token: string) =>
    api.post<FamilyMember>(`/patient/family-groups/invitations/${token}/accept`),

  removeMember: (memberId: string) =>
    api.delete<FamilyMember>(`/patient/family-groups/members/${memberId}`),

  leaveGroup: () =>
    api.post<{ wasOwner: boolean; groupDeleted: boolean }>("/patient/family-groups/leave"),
};
