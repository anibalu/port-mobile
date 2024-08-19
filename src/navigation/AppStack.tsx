/**
 * Primary navigation stack of the app.
 * User is navigated here if onboarding is done or if profile is already setup.
 */
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DirectChat from '@screens/DirectChat/Chat';
import ChatProfile from '@screens/ChatProfile/ChatProfile';
import ForwardToContact from '@screens/ForwardToContact/ForwardToContact';
import PendingRequests from '@screens/PendingRequests/PendingRequests';
import ShareContact from '@screens/ShareContact/ShareContact';
import GalleryConfirmation from '@screens/ShareImage/GalleryConfirmation';
import SelectShareContacts from '@screens/ShareImage/SelectShareContacts';
import SharedMedia from '@screens/SharedMedia/SharedMedia';
import React from 'react';
import {ConnectionModalProvider} from 'src/context/ConnectionModalContext';
import {AppStackParamList} from './AppStackTypes';
import CaptureMedia from '@screens/ShareImage/CaptureMedia';
import Isolation from '@screens/Isolations/Isolation';
import NewPortScreen from '@screens/NewPort/NewPort';
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
import Templates from '@screens/Templates/Templates';
import PortContactList from '@screens/ContactList/PortContactList';
import PhoneContactList from '@screens/ContactList/PhoneContactList';
import BottomNavStack from './BottomNavStack';
import ContactProfile from '@screens/ContactProfile/ContactProfile';

const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
    <>
      <ConnectionModalProvider>
        <Stack.Navigator
          initialRouteName="HomeTab"
          screenOptions={{headerShown: false, orientation: 'portrait'}}>
          <Stack.Screen name="PortContactList" component={PortContactList} />
          <Stack.Screen name="PhoneContactList" component={PhoneContactList} />
          <Stack.Screen name="HomeTab" component={BottomNavStack} />
          <Stack.Screen name="CreateFolder" component={CreateFolder} />
          <Stack.Screen name="EditFolder" component={EditFolder} />
          <Stack.Screen name="MoveToFolder" component={MoveToFolder} />
          <Stack.Screen name="DirectChat" component={DirectChat} />
          <Stack.Screen name="ChatProfile" component={ChatProfile} />
          <Stack.Screen name="ContactProfile" component={ContactProfile} />
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
          <Stack.Screen name="Templates" component={Templates} />
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
