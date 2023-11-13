export type AppStackParamList = {
  Home: undefined;
  ConnectionCentre: undefined;
  MyProfile: undefined;
  ManageMembers: {groupId: string};
  AddMembers: {groupId: string};
  Scanner: undefined;
  DirectChat: {chatId: string};
  ContactProfile: {chatId: string};
  Placeholder: undefined;
  ShareGroup: {groupId: string};
  ImageView: {imageURI: string; title: string};
  GroupOnboarding: undefined;
  NewGroup: {errorMessage: string};
  GroupProfile: {groupId: string};
  NewContact: {groupId: string};
  NewSuperport: {superportId: string};
  SetupGroup: {
    groupName: string;
    groupDescription: string;
    displayPicPath: string | undefined;
  };
  ViewPhotosVideos: {};
  ViewFiles: {};
};
