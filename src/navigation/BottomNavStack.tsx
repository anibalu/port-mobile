import React from 'react';

import HomeIconActive from '@assets/icons/BottomNavHomeActive.svg';
import HomeIconInactive from '@assets/icons/BottomNavHomeInactive.svg';
import NewIconActive from '@assets/icons/BottomNavNewActive.svg';
import NewIconInactive from '@assets/icons/BottomNavNewInactive.svg';
import ScanIconActive from '@assets/icons/BottomNavScanActive.svg';
import ScanIconInactive from '@assets/icons/BottomNavScanInactive.svg';
import {FontSizes, isIOS} from '@components/ComponentUtils';
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
          tabBarStyle: {height: 75},
        }}>
        <Tab.Screen
          name="ChatTab"
          options={{
            title: 'Chats',
            tabBarLabelStyle: styles.tabbarLabel,
            tabBarIcon: ({focused}) =>
              focused ? (
                <HomeIconActive
                  style={styles.iconStyle}
                  height={24}
                  width={24}
                />
              ) : (
                <HomeIconInactive
                  style={styles.iconStyle}
                  height={24}
                  width={24}
                />
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
                <NewIconActive
                  style={styles.iconStyle}
                  height={24}
                  width={24}
                />
              ) : (
                <NewIconInactive
                  style={styles.iconStyle}
                  height={24}
                  width={24}
                />
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
                <ScanIconActive
                  style={styles.iconStyle}
                  height={24}
                  width={24}
                />
              ) : (
                <ScanIconInactive
                  style={styles.iconStyle}
                  height={24}
                  width={24}
                />
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
  iconStyle: {
    top: isIOS ? 10 : 0,
  },
  tabbarLabel: {
    ...FontSizes[12].regular,
    bottom: isIOS ? -10 : 10,
  },
});
