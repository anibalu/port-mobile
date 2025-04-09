/**
 * Primary navigation stack of the app.
 * User is navigated here if onboarding is done or if profile is already setup.
 */
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DirectChat from '@screens/DirectChat/Chat';
import GroupChat from '@screens/GroupChat/Chat';
import ChatProfile from '@screens/ChatProfile/ChatProfile';
import ForwardToContact from '@screens/ForwardToContact/ForwardToContact';
import ShareContact from '@screens/ShareContact/ShareContact';
import GalleryConfirmation from '@screens/ShareImage/GalleryConfirmation';
import SelectShareContacts from '@screens/ShareImage/SelectShareContacts';
import SharedMedia from '@screens/SharedMedia/SharedMedia';
import React from 'react';
import {ConnectionModalProvider} from 'src/context/ConnectionModalContext';
import {AppStackParamList} from './AppStackTypes';
import CreateNewGroup from '@screens/GroupsV2/CreateNewGroup';
import NewGroupPort from '@screens/GroupsV2/NewGroupPort';
import GiveUsFeedbackScreen from '@screens/Feedback/GiveUsFeedbackScreen';
import MediaViewer from '@screens/MediaViewer/MediaViewer';
import QRScanner from '@screens/Scanner/QRScanner';
import BlockedContacts from '@screens/BlockedContacts/BlockedContacts';
import HelpScreen from '@screens/Help/HelpScreen';
import Templates from '@screens/Templates/Templates';
import PhoneContactList from '@screens/ContactList/PhoneContactList';
import BottomNavStack from './BottomNavStack/BottomNavStack';
import ContactProfile from '@screens/ContactProfile/ContactProfile';
import GroupProfile from '@screens/GroupsV2/GroupProfile';
import AddNewContacts from '@screens/GroupsV2/AddNewContacts';
import AllMembers from '@screens/GroupsV2/AllMembers';
import GroupTemplates from '@screens/Templates/GroupTemplates';
import IncomingCall from '@screens/Calls/IncomingCall';
import {CallContextProvider} from '@screens/Calls/CallContext';
import OngoingCall from '@screens/Calls/OngoingCall';
import AccountSettings from '@screens/MyAccount';
import DeleteAccount from '@screens/DeleteAccount';
import NewPortScreen from '@screens/NewPortScreen/NewPortScreen';
import ContactsScreen from '@screens/ContactsScreen/ContactsScreen';
import NewSuperPortStack from './NewSuperPortStack/NewSuperPortStack';
import NewPortStack from './NewPortStack/NewPortStack';
import DefaultPermissionsScreen from '@screens/DefaultPermissions/DefaultPermissionsScreen';

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
            screenOptions={{headerShown: false, orientation: 'portrait'}}>
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
          </Stack.Navigator>
        </CallContextProvider>
      </ConnectionModalProvider>
    </>
  );
}

export default AppStack;
