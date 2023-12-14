import React from 'react';

import HomeIconActive from '@assets/icons/BottomNavHomeActive.svg';
import HomeIconInactive from '@assets/icons/BottomNavHomeInactive.svg';
import NewIconActive from '@assets/icons/BottomNavNewActive.svg';
import NewIconInactive from '@assets/icons/BottomNavNewInactive.svg';
import ScanIconActive from '@assets/icons/BottomNavScanActive.svg';
import ScanIconInactive from '@assets/icons/BottomNavScanInactive.svg';
import {FontSizes} from '@components/ComponentUtils';
import NewPortModal from '@components/ConnectionModal/NewPortModal';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '@screens/Home/Home';
import Scanner from '@screens/Scanner/Scanner';
import {StyleSheet} from 'react-native';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import SuperportModal from '@components/ConnectionModal/SuperportModal';
import CreateSuperportModal from '@components/ConnectionModal/CreateSuperportModal';

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
  const {showNewPortModal: showModal} = useConnectionModal();
  return (
    <>
      <Tab.Navigator
        initialRouteName="ChatTab"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {paddingBottom: 5, height: 80},
        }}>
        <Tab.Screen
          name="ChatTab"
          options={{
            title: 'Chats',
            tabBarLabelStyle: styles.tabbarLabel,
            tabBarIcon: ({focused}) =>
              focused ? (
                <HomeIconActive height={23} width={23} />
              ) : (
                <HomeIconInactive height={23} width={23} />
              ),
          }}
          component={Home}
        />
        <Tab.Screen
          name="NewTab"
          options={{
            title: 'New',
            tabBarLabelStyle: styles.tabbarLabel,
            tabBarIcon: ({focused}) =>
              focused ? (
                <NewIconActive height={23} width={23} />
              ) : (
                <NewIconInactive height={23} width={23} />
              ),
          }}
          component={Home}
          listeners={() => ({
            tabPress: e => {
              // Prevent default behavior and open the modal instead
              e.preventDefault();
              showModal();
            },

            focus: () => {
              //When navigated to, autonav to the component.
              showModal();
            },
          })}
        />
        <Tab.Screen
          name="ScanTab"
          options={{
            title: 'Scan',
            tabBarLabelStyle: styles.tabbarLabel,
            tabBarIcon: ({focused}) =>
              focused ? (
                <ScanIconActive height={23} width={23} />
              ) : (
                <ScanIconInactive height={23} width={23} />
              ),
          }}
          component={Scanner}
        />
      </Tab.Navigator>
      <NewPortModal />
      <SuperportModal />
      <CreateSuperportModal />
    </>
  );
}

export default BottomNavStack;

const styles = StyleSheet.create({
  tabbarLabel: {
    ...FontSizes[12].regular,
    bottom: 10,
  },
});
