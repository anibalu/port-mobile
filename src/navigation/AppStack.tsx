/**
 * Primary navigation stack of the app.
 * User is navigated here if onboarding is done or if profile is already setup.
 */
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DirectChat from '@screens/DirectChat/Chat';
import ContactProfile from '@screens/ContactProfile/ContactProfile';
import ForwardToContact from '@screens/ForwardToContact/ForwardToContact';
import AddMembers from '@screens/GroupScreens/AddMembers';
import GroupProfile from '@screens/GroupScreens/GroupProfile/GroupProfile';
import ManageMembers from '@screens/GroupScreens/ManageMembers';
import ShareGroup from '@screens/GroupScreens/ShareGroup/ShareGroup';
import MyProfile from '@screens/MyProfile/Profile';
import PendingRequests from '@screens/PendingRequests/PendingRequests';
import ShareContact from '@screens/ShareContact/ShareContact';
import GalleryConfirmation from '@screens/ShareImage/GalleryConfirmation';
import SelectShareContacts from '@screens/ShareImage/SelectShareContacts';
import SharedMedia from '@screens/SharedMedia/SharedMedia';
import React from 'react';
import {ConnectionModalProvider} from 'src/context/ConnectionModalContext';
import {AppStackParamList} from './AppStackTypes';
import Home from '@screens/Home/Home';
import CaptureMedia from '@screens/ShareImage/CaptureMedia';
import Isolation from '@screens/Isolations/Isolation';
import NewPortScreen from '@screens/NewPort/NewPort';
import Superports from '@screens/Superport/Superports';
import SuperportScreen from '@screens/Superport/SuperportScreen';
import CreateFolder from '@screens/Folder/CreateFolder';
import EditFolder from '@screens/Folder/EditFolder';
import MoveToFolder from '@screens/Folder/MoveToFolder';
import CreateNewGroup from '@screens/GroupsV2/CreateNewGroup';
import NewGroupPort from '@screens/GroupsV2/NewGroupPort';
import GiveUsFeedbackScreen from '@screens/Feedback/GiveUsFeedbackScreen';
import MediaViewer from '@screens/MediaViewer/MediaViewer';
import QRScanner from '@screens/Scanner/QRScanner';
import BlockedContacts from '@screens/BlockedContacts/BlockedContacts';
import PreviewShareablePort from '@screens/Superport/PreviewSharablePort';
import HelpScreen from '@screens/Help/HelpScreen';

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
          <Stack.Screen name="GroupProfile" component={GroupProfile} />
          <Stack.Screen name="ManageMembers" component={ManageMembers} />
          <Stack.Screen name="AddMembers" component={AddMembers} />
          <Stack.Screen name="DirectChat" component={DirectChat} />
          <Stack.Screen name="ContactProfile" component={ContactProfile} />
          <Stack.Screen name="ShareGroup" component={ShareGroup} />

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

          <Stack.Screen name="CreateNewGroup" component={CreateNewGroup} />
          <Stack.Screen name="NewGroupPort" component={NewGroupPort} />
          <Stack.Screen
            name="GiveUsFeedbackScreen"
            component={GiveUsFeedbackScreen}
          />
          <Stack.Screen name="MediaViewer" component={MediaViewer} />
          <Stack.Screen name="Scan" component={QRScanner} />
          <Stack.Screen name="BlockedContacts" component={BlockedContacts} />
          <Stack.Screen name="HelpScreen" component={HelpScreen} />
          <Stack.Screen
            name="PreviewShareablePort"
            component={PreviewShareablePort}
          />
        </Stack.Navigator>
      </ConnectionModalProvider>
    </>
  );
}

export default AppStack;
