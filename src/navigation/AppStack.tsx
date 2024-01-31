import {PortColors} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
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
import EditAvatar from '@screens/MyProfile/EditAvatar';
import MyProfile from '@screens/MyProfile/MyProfile';
import PendingRequests from '@screens/PendingRequests/PendingRequests';
import Placeholder from '@screens/Placeholder/Placeholder';
import ScannerModal from '@screens/Scanner/ScannerModal';
import ShareContact from '@screens/ShareContact/ShareContact';
import GalleryConfirmation from '@screens/ShareImage/GalleryConfirmation';
import SelectShareContacts from '@screens/ShareImage/SelectShareContacts';
import SharedMedia from '@screens/SharedMedia/SharedMedia';
import React from 'react';
import {ConnectionModalProvider} from 'src/context/ConnectionModalContext';
import {AppStackParamList} from './AppStackTypes';
import BottomNavStack from './BottomNavStack';
import Presets from '@screens/Presets/Presets';

const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <ConnectionModalProvider>
        <Stack.Navigator
          initialRouteName="HomeTab"
          screenOptions={{headerShown: false, orientation: 'portrait'}}>
          <Stack.Screen name="HomeTab" component={BottomNavStack} />
          <Stack.Screen name="MyProfile" component={MyProfile} />
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
          <Stack.Screen name="EditAvatar" component={EditAvatar} />
          <Stack.Screen name="ShareContact" component={ShareContact} />
          <Stack.Screen
            name="SelectShareContacts"
            component={SelectShareContacts}
          />
          <Stack.Screen
            name="GalleryConfirmation"
            component={GalleryConfirmation}
          />
          <Stack.Screen name="PendingRequests" component={PendingRequests} />
          <Stack.Screen name="SharedMedia" component={SharedMedia} />
          <Stack.Screen name="Presets" component={Presets} />
        </Stack.Navigator>
        <ScannerModal />
      </ConnectionModalProvider>
    </>
  );
}

export default AppStack;
