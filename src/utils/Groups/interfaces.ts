export interface GroupMember {
  profilePicture?: string;
  name?: string;
  memberId: string;
  joinedAt: string;
  chatId?: string;
  isAdmin?: boolean;
}

export interface GroupInfo {
  //Id assigned by the server to group.
  groupId: string;
  //name given to group
  name: string;
  joinedAt?: string;
  description?: string;
  pathToGroupProfilePic?: string;
  amAdmin: boolean;
  members: GroupMember[];
}

export interface GroupInfoUpdate {
  //Id assigned by the server to group.
  groupId: string;
  //name given to group
  name?: string;
  pathToGroupProfilePic?: string;
  description?: string;
  amAdmin?: boolean;
  members?: GroupMember[];
}
