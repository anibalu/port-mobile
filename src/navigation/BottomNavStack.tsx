import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import PlusButtonBlack from 'assets/icons/PlusButtonBlack.svg';
import PlusButtonAccent from 'assets/icons/PlusButtonAccent.svg';
import {PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {BOTTOMBAR_HEIGHT, BOTTOMBAR_ICON_SIZE} from '@configs/constants';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '@screens/Home/Home';
import MyProfile from '@screens/MyProfile/Profile';
import Superports from '@screens/Superport/Superports';
import Folders from '@screens/Folders/Folders';
import {
  BottomNavStackParamList,
  FolderNavStackParamList,
} from './BottomNavStackTypes';
import ConnectionOptions from '@screens/Home/ConnectionOptions';
import DynamicColors from '@components/DynamicColors';
import {useTheme} from 'src/context/ThemeContext';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {
  BottomNavProvider,
  useBottomNavContext,
} from 'src/context/BottomNavContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChatActionsBar} from '@screens/Home/ChatActionsBar';
import FolderChats from '@screens/Folders/FolderChats';
import NoConnectionsScreen from '@screens/NoConnectionsScreen/NoConnectionsScreen';
import {useInsetChecks} from '@components/DeviceUtils';

const Tab = createBottomTabNavigator<BottomNavStackParamList>();

const FolderStack = createNativeStackNavigator<FolderNavStackParamList>();

//component for bottom tab bar with all navigation tabs visible in UI
function NumberlessTabbar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  // Get current theme value and colors
  const {themeValue} = useTheme();
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const insets = useSafeAreaInsets();

  // Define array of SVG icons with both light and dark mode assets
  const svgArray = [
    {
      assetName: 'Folders',
      light: require('@assets/light/icons/PrimaryFolder.svg').default,
      dark: require('@assets/dark/icons/PrimaryFolder.svg').default,
    },
    {
      assetName: 'FoldersFilled',
      light: require('@assets/light/icons/PrimaryFolderFilled.svg').default,
      dark: require('@assets/dark/icons/PrimaryFolderFilled.svg').default,
    },
    {
      assetName: 'Superports',
      light: require('@assets/light/icons/NewSuperport.svg').default,
      dark: require('@assets/dark/icons/NewSuperport.svg').default,
    },
    {
      assetName: 'SuperportsFilled',
      light: require('@assets/light/icons/NewSuperportFilled.svg').default,
      dark: require('@assets/dark/icons/NewSuperportFilled.svg').default,
    },
    {
      assetName: 'Profile',
      light: require('@assets/light/icons/Profile.svg').default,
      dark: require('@assets/dark/icons/Profile.svg').default,
    },
    {
      assetName: 'ProfileFilled',
      light: require('@assets/light/icons/ProfileFilled.svg').default,
      dark: require('@assets/dark/icons/ProfileFilled.svg').default,
    },
    {
      assetName: 'Home',
      light: require('@assets/light/icons/Home.svg').default,
      dark: require('@assets/dark/icons/Home.svg').default,
    },
    {
      assetName: 'HomeFilled',
      light: require('@assets/light/icons/HomeFilled.svg').default,
      dark: require('@assets/dark/icons/HomeFilled.svg').default,
    },
  ];

  // Get dynamically created SVG components based on theme
  const results = useDynamicSVG(svgArray);

  // Mapping of icons based on labels
  const icons: {[key: string]: React.FC<{height: number; width: number}>} = {
    Folders: results.Folders,
    FoldersFilled: results.FoldersFilled,
    Superports: results.Superports,
    SuperportsFilled: results.SuperportsFilled,
    Profile: results.Profile,
    ProfileFilled: results.ProfileFilled,
    Home: results.Home,
    HomeFilled: results.HomeFilled,
  };
  // Create a memoized array of focused states
  const focusedStates = useMemo(
    () => state.routes.map((_: any, index: number) => state.index === index),
    [state.routes, state.index],
  );

  const {isChatActionBarVisible, isConnectionOptionsModalOpen} =
    useBottomNavContext();
  const {hasIosBottomNotch} = useInsetChecks();

  return (
    <View style={{backgroundColor: Colors.primary.surface}}>
      <View
        style={StyleSheet.compose(styles.tabbarContainerStyle, {
          marginBottom: hasIosBottomNotch
            ? PortSpacing.secondary.bottom
            : insets.bottom,
        })}>
        {isChatActionBarVisible ? (
          <ChatActionsBar />
        ) : (
          <>
            {isConnectionOptionsModalOpen && (
              <ConnectionOptions selectedTab={state.routes[state.index].name} />
            )}
            {state.routes.map((route: any, index: number) => {
              const {options} = descriptors[route.key];
              const label = options.tabBarLabel ?? options.title ?? route.name;
              const isFocused = focusedStates[index];

              // Handle tab press
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

              // Get the appropriate icon component based on focus state
              const IconComponent = isFocused
                ? icons[`${label}Filled`]
                : icons[label];
              return (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? {selected: true} : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  key={label}
                  style={styles.tabbarButtonStyle}>
                  <View
                    style={
                      label !== 'New' &&
                      StyleSheet.compose(styles.iconWrapper, {
                        backgroundColor: isFocused
                          ? Colors.primary.surface2
                          : 'transparent',
                      })
                    }>
                    {label === 'New' ? (
                      themeValue === 'dark' ? (
                        <PlusButtonAccent height={42} width={42} />
                      ) : (
                        <PlusButtonBlack height={42} width={42} />
                      )
                    ) : (
                      IconComponent && (
                        <IconComponent
                          height={BOTTOMBAR_ICON_SIZE}
                          width={BOTTOMBAR_ICON_SIZE}
                        />
                      )
                    )}
                  </View>
                  {label !== 'New' && (
                    <NumberlessText
                      style={{marginTop: 4}}
                      fontSizeType={FontSizeType.s}
                      fontType={FontType.sb}
                      allowFontScaling={false}
                      textColor={
                        themeValue === 'light'
                          ? Colors.primary.defaultdark
                          : Colors.primary.white
                      }>
                      {label}
                    </NumberlessText>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    </View>
  );
}

function FolderStackScreens() {
  return (
    <FolderStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'Folders'}>
      <FolderStack.Screen name="Folders" component={Folders} />
      <FolderStack.Screen name="FolderChats" component={FolderChats} />
      <FolderStack.Screen
        name="NoConnectionsScreen"
        component={NoConnectionsScreen}
      />
    </FolderStack.Navigator>
  );
}

function BottomNavStack() {
  return (
    <BottomNavProvider>
      <BottomNavStackTabs />
    </BottomNavProvider>
  );
}

function BottomNavStackTabs() {
  const {setIsConnectionOptionsModalOpen} = useBottomNavContext();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <NumberlessTabbar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: BOTTOMBAR_HEIGHT,
        },
      }}>
      <Tab.Screen name="Home" options={{title: 'Home'}} component={Home} />
      <Tab.Screen
        name="FolderStack"
        options={{title: 'Folders'}}
        component={FolderStackScreens}
      />
      <Tab.Screen
        name="New"
        component={ConnectionOptions}
        listeners={() => ({
          tabPress: e => {
            // Prevent default behavior and toggle the modal
            e.preventDefault();
            setIsConnectionOptionsModalOpen(p => !p);
          },
        })}
      />
      <Tab.Screen
        name="Superports"
        options={{title: 'Superports'}}
        component={Superports}
      />
      <Tab.Screen
        name="MyProfile"
        options={{title: 'Profile'}}
        component={MyProfile}
      />
    </Tab.Navigator>
  );
}

export default BottomNavStack;

const styling = (colors: any) =>
  StyleSheet.create({
    tabbarButtonStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabbarContainerStyle: {
      width: screen.width,
      height: BOTTOMBAR_HEIGHT,
      backgroundColor: colors.primary.surface,
      flexDirection: 'row',
      borderTopColor: colors.primary.stroke,
      borderTopWidth: 0.5,
    },
    actionsContainerStyle: {
      width: screen.width,
      height: BOTTOMBAR_HEIGHT,
      backgroundColor: colors.primary.surface,
      flexDirection: 'row',
    },
    iconWrapper: {
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: PortSpacing.secondary.uniform,
    },
  });
