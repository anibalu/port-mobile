import {FileAttributes} from '@utils/Storage/interfaces';

export type OnboardingStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  SetupUser: {name: string; avatar: FileAttributes};
  RequestPermissions: undefined;
  NameScreen: undefined;
  PermissionsScreen: {name: string; avatar: FileAttributes};
};
