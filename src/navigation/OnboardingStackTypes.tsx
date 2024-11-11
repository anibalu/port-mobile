import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';

export type OnboardingStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  PhoneContactList: {fromOnboardingStack?: boolean; onLinkShare: () => void};
  CreateConnection: {type: 'link' | 'QR'};
  SetupUser: {name: string; avatar: FileAttributes};
  RequestPermissions: undefined;
  NameScreen: undefined;
  PermissionsScreen: {name: string; avatar: FileAttributes};
  RestoreAccount: undefined;
  OnboardingSetupScreen: {portUrl?: string | null};
};
