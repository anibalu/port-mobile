import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '@screens/Home/Home';
import {BottomNavStackParamList} from './BottomNavStackTypes';
import NewProfileScreen from '@screens/NewProfileScreen/NewProfileScreen';
import AllPortsScreen from '@screens/AllPorts/AllPortsScreen';
import useSVG from '@components/svgGuide';
import {useColors} from '@components/colorGuide';
import {Height} from '@components/spacingGuide';
import {FontSizeType, FontWeight} from '@components/NumberlessText';
import {View} from 'react-native';

const Tab = createBottomTabNavigator<BottomNavStackParamList>();

function BottomNavStack() {
  const Colors = useColors();
  const svgArray = [
    {
      assetName: 'Home',
      light: require('@assets/light/icons/BottomTab/Chats.svg').default,
      dark: require('@assets/dark/icons/BottomTab/Chats.svg').default,
    },
    {
      assetName: 'HomeFilled',
      light: require('@assets/light/icons/BottomTab/ChatsFilled.svg').default,
      dark: require('@assets/dark/icons/BottomTab/ChatsFilled.svg').default,
    },
    {
      assetName: 'Ports',
      light: require('@assets/light/icons/BottomTab/Ports.svg').default,
      dark: require('@assets/dark/icons/BottomTab/Ports.svg').default,
    },
    {
      assetName: 'PortsFilled',
      light: require('@assets/light/icons/BottomTab/PortsFilled.svg').default,
      dark: require('@assets/dark/icons/BottomTab/PortsFilled.svg').default,
    },
    {
      assetName: 'Settings',
      light: require('@assets/light/icons/BottomTab/Settings.svg').default,
      dark: require('@assets/dark/icons/BottomTab/Settings.svg').default,
    },
    {
      assetName: 'SettingsFilled',
      light: require('@assets/light/icons/BottomTab/SettingsFilled.svg')
        .default,
      dark: require('@assets/dark/icons/BottomTab/SettingsFilled.svg').default,
    },
  ];
  const results = useSVG(svgArray, Colors.theme);
  const HomeIcon = results.Home;
  const HomeFilledIcon = results.HomeFilled;
  const PortsIcon = results.Ports;
  const PortsFilledIcon = results.PortsFilled;
  const SettingsIcon = results.Settings;
  const SettingsFilledIcon = results.SettingsFilled;

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({route}: {route: any}) => ({
          headerShown: false,
          orientation: 'portrait',
          tabBarIcon: ({focused, size}: {focused: boolean; size: number}) => {
            // Use the SVG icons you've set up based on the route name
            if (route.name === 'Home') {
              return focused ? (
                <SelectedWrapper color={Colors.surface3}>
                  <HomeFilledIcon width={size} height={size} />
                </SelectedWrapper>
              ) : (
                <HomeIcon width={size} height={size} />
              );
            } else if (route.name === 'Ports') {
              return focused ? (
                <SelectedWrapper color={Colors.surface3}>
                  <PortsFilledIcon width={size} height={size} />
                </SelectedWrapper>
              ) : (
                <PortsIcon width={size} height={size} />
              );
            } else if (route.name === 'Settings') {
              return focused ? (
                <SelectedWrapper color={Colors.surface3}>
                  <SettingsFilledIcon width={size} height={size} />
                </SelectedWrapper>
              ) : (
                <SettingsIcon width={size} height={size} />
              );
            }
            // Fallback just in case
            return null;
          },
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: 0.5,
            borderTopColor: Colors.stroke,
            height: Height.bottombar,
            shadowColor: 'transparent',
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: FontSizeType.s,
            fontWeight: FontWeight.sb,
            color: Colors.text.title,
            marginTop: 4,
          },
          tabBarAllowFontScaling: false,
        })}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Ports" component={AllPortsScreen} />
        <Tab.Screen name="Settings" component={NewProfileScreen} />
      </Tab.Navigator>
    </>
  );
}

function SelectedWrapper({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: 16,
        width: 52,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {children}
    </View>
  );
}

export default BottomNavStack;
