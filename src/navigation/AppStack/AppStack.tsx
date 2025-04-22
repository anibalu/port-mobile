/**
 * Primary navigation stack of the app.
 * User is navigated here if onboarding is done or if profile is already setup.
 */
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AcceptedDirectChat from '@screens/AcceptDirectChat/AcceptDirectChat';
import BlockedContacts from '@screens/BlockedContacts/BlockedContacts';
import { CallContextProvider } from '@screens/Calls/CallContext';
import IncomingCall from '@screens/Calls/IncomingCall';
import OngoingCall from '@screens/Calls/OngoingCall';
import ChatProfile from '@screens/ChatProfile/ChatProfile';
import PhoneContactList from '@screens/ContactList/PhoneContactList';
import ContactProfile from '@screens/ContactProfile/ContactProfile';
import ContactsScreen from '@screens/ContactsScreen/ContactsScreen';
import DefaultPermissionsScreen from '@screens/DefaultPermissions/DefaultPermissionsScreen';
import DeleteAccount from '@screens/DeleteAccount';
import DirectChat from '@screens/DirectChat/Chat';
import GiveUsFeedbackScreen from '@screens/Feedback/GiveUsFeedbackScreen';
import ForwardToContact from '@screens/ForwardToContact/ForwardToContact';
import GroupChat from '@screens/GroupChat/Chat';
import AddNewContacts from '@screens/GroupsV2/AddNewContacts';
import AddNewGroupMembers from '@screens/GroupsV2/AddNewGroupMembers';
import AllMembers from '@screens/GroupsV2/AllMembers';
import CreateNewGroup from '@screens/GroupsV2/CreateNewGroup';
import GroupProfile from '@screens/GroupsV2/GroupProfile';
import NewGroupPort from '@screens/GroupsV2/NewGroupPort';
import NewGroupSuperPort from '@screens/GroupsV2/NewGroupSuperPort';
import HelpScreen from '@screens/Help/HelpScreen';
import MediaViewer from '@screens/MediaViewer/MediaViewer';
import AccountSettings from '@screens/MyAccount';
import NewPortScreen from '@screens/NewPortScreen/NewPortScreen';
import QRScanner from '@screens/Scanner/QRScanner';
import ShareContact from '@screens/ShareContact/ShareContact';
import ContactPortQRScreen from '@screens/ShareContactScreen/ContactPortQRScreen';
import SharedMedia from '@screens/SharedMedia/SharedMedia';
import GalleryConfirmation from '@screens/ShareImage/GalleryConfirmation';
import SelectShareContacts from '@screens/ShareImage/SelectShareContacts';
import GroupTemplates from '@screens/Templates/GroupTemplates';
import Templates from '@screens/Templates/Templates';

import { ConnectionModalProvider } from 'src/context/ConnectionModalContext';

import { AppStackParamList } from './AppStackTypes';
import BottomNavStack from './BottomNavStack/BottomNavStack';
import NewPortStack from './NewPortStack/NewPortStack';
import NewSuperPortStack from './NewSuperPortStack/NewSuperPortStack';


const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
    <>
      <ConnectionModalProvider>
        {/* The call context provider helps screens related to calling communicate with
        one another */}
        <CallContextProvider>
          <Stack.Navigator
            initialRouteName={'HomeTab'}
            screenOptions={{ headerShown: false, orientation: 'portrait' }}>
            <Stack.Screen
              name="DefaultPermissionsScreen"
              component={DefaultPermissionsScreen}
            />
            <Stack.Screen
              name="PhoneContactList"
              component={PhoneContactList}
            />
            <Stack.Screen name="HomeTab" component={BottomNavStack} />
            <Stack.Screen name="DirectChat" component={DirectChat} />
            <Stack.Screen name="ChatProfile" component={ChatProfile} />
            <Stack.Screen name="ContactProfile" component={ContactProfile} />
            <Stack.Screen name="GroupChat" component={GroupChat} />
            <Stack.Screen name="GroupProfile" component={GroupProfile} />
            <Stack.Screen name="AccountSettings" component={AccountSettings} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
            <Stack.Screen
              name="ForwardToContact"
              component={ForwardToContact}
            />
            <Stack.Screen name="ShareContact" component={ShareContact} />
            <Stack.Screen
              name="SelectShareContacts"
              component={SelectShareContacts}
            />
            <Stack.Screen
              name="GalleryConfirmation"
              component={GalleryConfirmation}
            />
            <Stack.Screen name="SharedMedia" component={SharedMedia} />
            {/* <Stack.Screen name="Isolation" component={Isolation} /> */}
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
            <Stack.Screen name="AddNewContacts" component={AddNewContacts} />
            <Stack.Screen name="AllMembers" component={AllMembers} />
            <Stack.Screen name="GroupTemplates" component={GroupTemplates} />
            <Stack.Screen
              name="NewGroupSuperPort"
              component={NewGroupSuperPort}
            />
            <Stack.Screen
              name="AddNewGroupMembers"
              component={AddNewGroupMembers}
            />
            <Stack.Screen name="NewPortScreen" component={NewPortScreen} />
            <Stack.Screen name="NewPortStack" component={NewPortStack} />
            <Stack.Screen
              name="NewSuperPortStack"
              component={NewSuperPortStack}
            />
            <Stack.Screen name="IncomingCall" component={IncomingCall} />

            <Stack.Screen
              name="OngoingCall"
              component={OngoingCall}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
            <Stack.Screen name="ContactPortQRScreen" component={ContactPortQRScreen} />
            <Stack.Screen name="AcceptDirectChat" component={AcceptedDirectChat} />
          </Stack.Navigator>
        </CallContextProvider>
      </ConnectionModalProvider>
    </>
  );
}

export default AppStack;
