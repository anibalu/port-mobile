/**
 * Numberless Inc's messaging client app Port
 */

import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Linking, StatusBar} from 'react-native';

// Screens in the app
import Welcome from './src/screens/Welcome/Welcome';
import Placeholder from './src/screens/Placeholder/Placeholder';
import Onboarding from './src/screens/Onboarding/Onboarding';
import Home from './src/screens/Home/Home';
import SetupUser from './src/screens/SetupUser/SetupUser';
import RequestPermissions from './src/screens/RequestPermissions/RequestPermissions';
import ConnectionCentre from './src/screens/ConnectionCentre/ConnectionCentre';
import Scanner from './src/screens/Scanner/Scanner';
import NewContact from './src/screens/NewContact/NewContact';
import ImageView from './src/screens/MediaView/ImageView';
import ContactProfile from './src/screens/ContactProfile/ContactProfile';
import Chat from './src/screens/Chat/Chat';
import MyProfile from './src/screens/MyProfile/MyProfile';

import store from './src/store/appStore';
import {Provider} from 'react-redux';
import {handleDeepLink} from './src/utils/DeepLinking';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {checkProfile} from './src/utils/Profile';
import {ProfileStatus} from './src/utils/Profile/interfaces';
import {loadConnectionsToStore} from './src/utils/Connections';
import {loadReadDirectConnectionBundlesToStore} from './src/utils/Bundles/direct';
import {
  foregroundMessageHandler,
  registerBackgroundMessaging,
} from './src/utils/Messaging/fcm';
import {loadJournalToStore} from './src/utils/Messaging/journal';
import GroupProfile from './src/screens/GroupScreens/GroupProfile/GroupProfile';
import ManageMembers from './src/screens/GroupScreens/ManageMembers';
import AddMembers from './src/screens/GroupScreens/AddMembers';
import GroupOnboarding from './src/screens/GroupScreens/GroupOnboarding';
import NewGroup from './src/screens/GroupScreens/NewGroup/NewGroup';
import SetupGroup from './src/screens/GroupScreens/SetupGroup/SetupGroup';
import ShareGroup from './src/screens/GroupScreens/ShareGroup/ShareGroup';
import ViewPhotosVideos from './src/screens/ContactProfile/ViewPhotosVideos';
import ViewFiles from './src/screens/ContactProfile/ViewFiles';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  //check if initial setup is done
  const [profileExists, setProfileExists] = useState(false);
  useEffect(() => {
    const checkProfileCreated = async () => {
      try {
        const result = await checkProfile();
        if (result === ProfileStatus.created) {
          setProfileExists(true);
          //load up to store
          //load connections to store
          await loadConnectionsToStore();
          //load read bundles to store
          await loadReadDirectConnectionBundlesToStore();
          //load journaled messages to store
          await loadJournalToStore();
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };
    checkProfileCreated();
    // default way to handle new messages in the foreground
    foregroundMessageHandler();
    // handle any potential inital deep links
    (async () => {
      handleDeepLink({url: await Linking.getInitialURL()});
    })();
  }, []);

  const initialRouteName = profileExists ? 'Home' : 'Welcome';
  //set up background message handler here
  registerBackgroundMessaging();
  // Handle any potential deeplinks while foregrounded/backgrounded
  Linking.addEventListener('url', handleDeepLink);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen
              name="RequestPermissions"
              component={RequestPermissions}
            />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="SetupUser" component={SetupUser} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen
              name="ConnectionCentre"
              component={ConnectionCentre}
            />
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
            <Stack.Screen name="Groups" component={GroupOnboarding} />
            <Stack.Screen name="NewGroup" component={NewGroup} />
            <Stack.Screen name="SetupGroup" component={SetupGroup} />
            <Stack.Screen name="ShareGroup" component={ShareGroup} />
            <Stack.Screen
              name="ViewPhotosVideos"
              component={ViewPhotosVideos}
            />
            <Stack.Screen name="ViewFiles" component={ViewFiles} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
