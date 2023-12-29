import React from 'react';

import HomeIconActive from '@assets/icons/BottomNavHomeActive.svg';
import HomeIconInactive from '@assets/icons/BottomNavHomeInactive.svg';
import NewIconActive from '@assets/icons/BottomNavNewActive.svg';
import NewIconInactive from '@assets/icons/BottomNavNewInactive.svg';
import ScanIconActive from '@assets/icons/BottomNavScanActive.svg';
import ScanIconInactive from '@assets/icons/BottomNavScanInactive.svg';
import {PortColors} from '@components/ComponentUtils';
import CreateSuperportModal from '@components/ConnectionModal/CreateSuperportModal';
import NewPortModal from '@components/ConnectionModal/NewPortModal';
import SuperportModal from '@components/ConnectionModal/SuperportModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {BOTTOMBAR_HEIGHT, BOTTOMBAR_ICON_SIZE} from '@configs/constants';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '@screens/Home/Home';
import Scanner from '@screens/Scanner/Scanner';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useConnectionModal} from 'src/context/ConnectionModalContext';

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

function NumberlessTabbar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  return (
    <View style={styles.tabbarContainerStyle}>
      {state.routes.map(
        (route: {key: string | number; name: any; params: any}, index: any) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabbarButtonStyle}>
              {getIcon(label, isFocused)}
              <NumberlessText
                style={{marginTop: 10}}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={
                  isFocused ? PortColors.text.title : PortColors.text.labels
                }>
                {label}
              </NumberlessText>
            </TouchableOpacity>
          );
        },
      )}
    </View>
  );
}

function getIcon(label: string, isFocused: boolean) {
  switch (label) {
    case 'Chats':
      return isFocused ? (
        <HomeIconActive
          height={BOTTOMBAR_ICON_SIZE}
          width={BOTTOMBAR_ICON_SIZE}
        />
      ) : (
        <HomeIconInactive
          height={BOTTOMBAR_ICON_SIZE}
          width={BOTTOMBAR_ICON_SIZE}
        />
      );
    case 'New':
      return isFocused ? (
        <NewIconActive
          height={BOTTOMBAR_ICON_SIZE}
          width={BOTTOMBAR_ICON_SIZE}
        />
      ) : (
        <NewIconInactive
          height={BOTTOMBAR_ICON_SIZE}
          width={BOTTOMBAR_ICON_SIZE}
        />
      );
    case 'Scan':
      return isFocused ? (
        <ScanIconActive
          height={BOTTOMBAR_ICON_SIZE}
          width={BOTTOMBAR_ICON_SIZE}
        />
      ) : (
        <ScanIconInactive
          height={BOTTOMBAR_ICON_SIZE}
          width={BOTTOMBAR_ICON_SIZE}
        />
      );
  }
}

function BottomNavStack() {
  const {showNewPortModal: showModal} = useConnectionModal();
  return (
    <>
      <Tab.Navigator
        initialRouteName="ChatTab"
        tabBar={props => <NumberlessTabbar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {height: 75},
        }}>
        <Tab.Screen
          name="ChatTab"
          options={{
            title: 'Chats',
          }}
          component={Home}
        />
        <Tab.Screen
          name="NewTab"
          options={{
            title: 'New',
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
  tabbarButtonStyle: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  tabbarContainerStyle: {
    height: BOTTOMBAR_HEIGHT,
    backgroundColor: PortColors.primary.white,
    flexDirection: 'row',
  },
});
