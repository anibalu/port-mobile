import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Chat from '../screens/Chat/Chat';
import ConnectionCentre from '../screens/ConnectionCentre/ConnectionCentre';
import ContactProfile from '../screens/ContactProfile/ContactProfile';
import ViewFiles from '../screens/ContactProfile/ViewFiles';
import ViewPhotosVideos from '../screens/ContactProfile/ViewPhotosVideos';
import AddMembers from '../screens/GroupScreens/AddMembers';
import GroupOnboarding from '../screens/GroupScreens/GroupOnboarding';

import ManageMembers from '../screens/GroupScreens/ManageMembers';
import NewGroup from '../screens/GroupScreens/NewGroup/NewGroup';
import SetupGroup from '../screens/GroupScreens/SetupGroup/SetupGroup';
import ShareGroup from '../screens/GroupScreens/ShareGroup/ShareGroup';
import Home from '../screens/Home/Home';
import ImageView from '../screens/MediaView/ImageView';
import MyProfile from '../screens/MyProfile/MyProfile';
import NewContact from '../screens/NewContact/NewContact';
import Placeholder from '../screens/Placeholder/Placeholder';
import Scanner from '../screens/Scanner/Scanner';
import {AppStackParamList} from './AppStackTypes';
import GroupProfile from '../screens/GroupScreens/GroupProfile/GroupProfile';

const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="ConnectionCentre" component={ConnectionCentre} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
      <Stack.Screen name="GroupProfile" component={GroupProfile} />
      <Stack.Screen name="ManageMembers" component={ManageMembers} />
      <Stack.Screen name="AddMembers" component={AddMembers} />
      <Stack.Screen name="NewContact" component={NewContact} />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="DirectChat" component={Chat} />
      <Stack.Screen name="ContactProfile" component={ContactProfile} />
      <Stack.Screen name="Placeholder" component={Placeholder} />
      <Stack.Screen name="ImageView" component={ImageView} />
      <Stack.Screen name="GroupOnboarding" component={GroupOnboarding} />
      <Stack.Screen name="NewGroup" component={NewGroup} />
      <Stack.Screen name="SetupGroup" component={SetupGroup} />
      <Stack.Screen name="ShareGroup" component={ShareGroup} />
      <Stack.Screen name="ViewPhotosVideos" component={ViewPhotosVideos} />
      <Stack.Screen name="ViewFiles" component={ViewFiles} />
    </Stack.Navigator>
  );
}

export default AppStack;
