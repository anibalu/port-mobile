export interface GroupData {
  name?: string;
  joinedAt?: string;
  description?: string | null;
  groupPicture?: string | null;
  amAdmin?: boolean;
  selfCryptoId?: string;
}
export interface GroupDataStrict extends GroupData {
  name: string;
  joinedAt: string;
  description?: string | null;
  groupPicture?: string | null;
  amAdmin: boolean;
}

export interface GroupMemberUpdate {
  name?: string | null;
  joinedAt?: string | null;
  cryptoId?: string | null;
  isAdmin?: boolean | null;
}

export interface GroupMember extends GroupMemberUpdate {
  memberId?: string;
}
export interface GroupMemberStrict extends GroupMember {
  memberId: string;
  name: string | null;
  joinedAt: string | null;
  cryptoId: string | null;
  isAdmin: boolean | null;
}

export interface GroupCryptoPair {
  memberId: string;
  cryptoId: string | null;
}
