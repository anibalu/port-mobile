import React from 'react';
import ConnectionCentre from '@screens/ConnectionCentre/ConnectionCentre';

import HomeIconActive from '@assets/icons/BottomNavHomeActive.svg';
import HomeIconInactive from '@assets/icons/BottomNavHomeInactive.svg';
import NewIconActive from '@assets/icons/BottomNavNewActive.svg';
import NewIconInactive from '@assets/icons/BottomNavNewInactive.svg';
import ScanIconActive from '@assets/icons/BottomNavScanActive.svg';
import ScanIconInactive from '@assets/icons/BottomNavScanInactive.svg';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '@screens/Home/Home';
import Scanner from '@screens/Scanner/Scanner';

import {FontSizes} from '@components/ComponentUtils';
import {StyleSheet} from 'react-native';

const Tab = createBottomTabNavigator();

// const tabHiddenRoutes = [
//   'MyProfile',
//   'DirectChat',
//   'ContactProfile',
//   'GroupProfile',
//   'ManageMembers',
//   'AddMembers',
//   'ViewFiles',
//   'ImageView',
//   'ViewPhotosVideos',
//   'Scanner',
//   'ConnectionCentre',
//   'GroupOnboarding',
//   'NewGroup',
//   'NewSuperport',
//   'NewContact',
//   'ShareGroup',
//   'SetupGroup',
// ];

function BottomNavStack() {
  return (
    <Tab.Navigator
      initialRouteName="ChatTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {paddingBottom: 10, height: 94},
      }}>
      <Tab.Screen
        name="ChatTab"
        options={{
          title: 'Chats',
          tabBarLabelStyle: styles.tabbarLabel,
          tabBarIcon: ({focused}) =>
            focused ? <HomeIconActive /> : <HomeIconInactive />,
        }}
        component={Home}
      />
      <Tab.Screen
        name="NewTab"
        options={{
          title: 'New',
          tabBarLabelStyle: styles.tabbarLabel,
          tabBarIcon: ({focused}) =>
            focused ? <NewIconActive /> : <NewIconInactive />,
        }}
        component={ConnectionCentre}
      />
      <Tab.Screen
        name="ScanTab"
        options={{
          title: 'Scan',
          tabBarLabelStyle: styles.tabbarLabel,
          tabBarIcon: ({focused}) =>
            focused ? <ScanIconActive /> : <ScanIconInactive />,
        }}
        component={Scanner}
      />
    </Tab.Navigator>
  );
}

export default BottomNavStack;

const styles = StyleSheet.create({
  tabbarLabel: {
    ...FontSizes[12].regular,
    bottom: 10,
  },
});
