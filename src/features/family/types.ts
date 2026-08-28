export type FamilyMemberUser = {
  _id: string;
  name?: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
};

export type FamilyGroup = {
  _id: string;
  ownerId: string;
  createdAt: string;
};

export type FamilyMember = {
  _id: string;
  familyGroupId: string;
  userId: FamilyMemberUser;
  status: "invited" | "accepted" | "left";
  createdAt: string;
};

export type MyFamilyGroup = {
  group: FamilyGroup;
  owner: FamilyMemberUser | null;
  members: FamilyMember[];
  pendingInvites: FamilyMember[];
  isOwner: boolean;
};

export type InvitationContext = {
  owner: FamilyMemberUser | null;
  expiresAt: string;
};
