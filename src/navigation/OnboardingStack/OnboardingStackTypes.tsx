export type OnboardingStackParamList = {
  Welcome: undefined;
  CreateConnection: {type: 'link' | 'QR'};
  RestoreAccount: undefined;
  OnboardingSetupScreen: {portUrl?: string | null};
  OnboardingQRScanner: undefined;
  OnboardingLinkInput: undefined;
};
