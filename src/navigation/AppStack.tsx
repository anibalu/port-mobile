/**
 * Primary navigation stack of the app.
 * User is navigated here if onboarding is done or if profile is already setup.
 */
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AddCategoryScreen from '@screens/BugReporting/AddCategoryScreen';
import ReportIssueScreen from '@screens/BugReporting/ReportIssueScreen';
import SuggestAFeature from '@screens/BugReporting/SuggestAFeature';
import Chat from '@screens/Chat/Chat';
import ContactProfile from '@screens/ContactProfile/ContactProfile';
import ForwardToContact from '@screens/ForwardToContact/ForwardToContact';
import AddMembers from '@screens/GroupScreens/AddMembers';
import GroupOnboarding from '@screens/GroupScreens/GroupOnboarding';
import GroupProfile from '@screens/GroupScreens/GroupProfile/GroupProfile';
import ManageMembers from '@screens/GroupScreens/ManageMembers';
import NewGroup from '@screens/GroupScreens/NewGroup/NewGroup';
import ShareGroup from '@screens/GroupScreens/ShareGroup/ShareGroup';
import ImageView from '@screens/MediaView/ImageView';
import MyProfile from '@screens/MyProfile/Profile';
import PendingRequests from '@screens/PendingRequests/PendingRequests';
import Placeholder from '@screens/Placeholder/Placeholder';
import ShareContact from '@screens/ShareContact/ShareContact';
import GalleryConfirmation from '@screens/ShareImage/GalleryConfirmation';
import SelectShareContacts from '@screens/ShareImage/SelectShareContacts';
import SharedMedia from '@screens/SharedMedia/SharedMedia';
import React from 'react';
import {ConnectionModalProvider} from 'src/context/ConnectionModalContext';
import {AppStackParamList} from './AppStackTypes';
import Home from '@screens/Home/Home';
import QRscanner from '@screens/Scanner/QRscanner';
import CaptureMedia from '@screens/ShareImage/CaptureMedia';
import Isolation from '@screens/Isolations/Isolation';
import NewPortScreen from '@screens/NewPort/NewPort';
import Superports from '@screens/Superport/Superports';
import SuperportScreen from '@screens/Superport/SuperportScreen';
import CreateFolder from '@screens/Folder/CreateFolder';
import EditFolder from '@screens/Folder/EditFolder';
import PreviewShareablePort from '@screens/Superport/PreviewSharablePort';
import MoveToFolder from '@screens/Folder/MoveToFolder';
import CreateNewGroup from '@screens/GroupsV2/CreateNewGroup';

const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
    <>
      <ConnectionModalProvider>
        <Stack.Navigator
          initialRouteName="HomeTab"
          screenOptions={{headerShown: false, orientation: 'portrait'}}>
          <Stack.Screen name="HomeTab" component={Home} />
          <Stack.Screen name="CreateFolder" component={CreateFolder} />
          <Stack.Screen name="EditFolder" component={EditFolder} />
          <Stack.Screen name="MoveToFolder" component={MoveToFolder} />
          <Stack.Screen name="MyProfile" component={MyProfile} />
          <Stack.Screen name="Scan" component={QRscanner} />
          <Stack.Screen name="GroupProfile" component={GroupProfile} />
          <Stack.Screen name="ManageMembers" component={ManageMembers} />
          <Stack.Screen name="AddMembers" component={AddMembers} />
          <Stack.Screen name="DirectChat" component={Chat} />
          <Stack.Screen name="ContactProfile" component={ContactProfile} />
          <Stack.Screen name="Placeholder" component={Placeholder} />
          <Stack.Screen name="ImageView" component={ImageView} />
          <Stack.Screen name="GroupOnboarding" component={GroupOnboarding} />
          <Stack.Screen name="NewGroup" component={NewGroup} />
          <Stack.Screen name="ShareGroup" component={ShareGroup} />
          <Stack.Screen
            name="AddCategoryScreen"
            component={AddCategoryScreen}
          />
          <Stack.Screen
            name="ReportIssueScreen"
            component={ReportIssueScreen}
          />
          <Stack.Screen name="SuggestAFeature" component={SuggestAFeature} />
          <Stack.Screen name="ForwardToContact" component={ForwardToContact} />
          <Stack.Screen name="ShareContact" component={ShareContact} />
          <Stack.Screen
            name="SelectShareContacts"
            component={SelectShareContacts}
          />
          <Stack.Screen
            name="GalleryConfirmation"
            component={GalleryConfirmation}
          />
          <Stack.Screen name="Superports" component={Superports} />
          <Stack.Screen name="SuperportScreen" component={SuperportScreen} />
          <Stack.Screen name="PendingRequests" component={PendingRequests} />
          <Stack.Screen name="CaptureMedia" component={CaptureMedia} />
          <Stack.Screen name="SharedMedia" component={SharedMedia} />
          <Stack.Screen name="Isolation" component={Isolation} />
          <Stack.Screen name="NewPortScreen" component={NewPortScreen} />
          <Stack.Screen
            name="PreviewShareablePort"
            component={PreviewShareablePort}
          />
          <Stack.Screen name="CreateNewGroup" component={CreateNewGroup} />
        </Stack.Navigator>
      </ConnectionModalProvider>
    </>
  );
}

export default AppStack;
