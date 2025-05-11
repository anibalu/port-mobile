export type OnboardingStackParamList = {
  Welcome: undefined;
  CreateConnection: {type: 'link' | 'QR'};
  RestoreAccount: undefined;
  RestoreBackup: undefined;
  RestoreFromCloud: {backupFilePath: string, localBackup?: boolean};
  OnboardingSetupScreen: {portUrl?: string | null};
  RestoreConfirmation: undefined;
};
