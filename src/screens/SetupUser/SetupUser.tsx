/**
 * This screen sets up a user account
 * screen id: 4
 */
import {NumberlessRegularText} from '@components/NumberlessText';
import ProgressBar from '@components/ProgressBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {AVATAR_ARRAY, DEFAULT_NAME} from '@configs/constants';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getInitialDirectConnectionLinks} from '@utils/ConnectionLinks/direct';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {setupNewProfile} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {PortColors} from '@components/ComponentUtils';
import {initialiseFCM} from '@utils/Messaging/fcm';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {GenericAvatar} from '@components/GenericAvatar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SetupUser'>;

function SetupUser({route, navigation}: Props) {
  const {onboardingFailureError} = useErrorModal();
  const [profileUri, setProfileUri] = useState(AVATAR_ARRAY[0]);
  const {name} = route.params;
  const processedName: string = name || DEFAULT_NAME;
  //state of progress
  const [progress, setProgress] = useState(10);
  const [loaderText, setLoaderText] = useState('Initializing...');
  //actions attached to progress
  type ThunkAction = () => Promise<boolean>;
  const setupActions: ThunkAction[] = [
    async () => {
      //setup profile
      setLoaderText("We're setting up a safe place");
      setProfileUri(AVATAR_ARRAY[1]);

      const response = await setupNewProfile(processedName);
      if (response === ProfileStatus.created) {
        return true;
      }
      return false;
    },
    async () => {
      //get initial set of connection links
      setLoaderText('Getting you ready to connect with others');
      setProfileUri(AVATAR_ARRAY[2]);

      return await getInitialDirectConnectionLinks();
    },
    async () => {
      //initialise FCM
      setLoaderText("We're almost there");
      setProfileUri('avatar://4');
      return await initialiseFCM();
    },
  ];
  const runActions = async () => {
    for (let i = 0; i < setupActions.length; i++) {
      const thunk = setupActions[i];
      const result = await thunk();
      if (!result) {
        return false;
      }
      setProgress(prevProgress => prevProgress + 90 / setupActions.length);
    }
    setProgress(100);
    return true;
  };
  useEffect(() => {
    runActions().then(ret => {
      if (!ret) {
        onboardingFailureError();
        navigation.navigate('OnboardingStack', {screen: 'NameScreen'});
      } else {
        //ts-ignore
        navigation.navigate('InformationScreen1');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.basicContainer}>
        <View style={styles.container}>
          <View style={styles.avatar}>
            <GenericAvatar avatarSize="large" profileUri={profileUri} />
          </View>
          <ProgressBar progress={progress} />
          <NumberlessRegularText style={styles.loaderText}>
            {loaderText}
          </NumberlessRegularText>
        </View>
        <View style={styles.absoluteContainer}>
          <NumberlessRegularText>
            This may take a few seconds. Please ensure you have an active
            internet connection.
          </NumberlessRegularText>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  basicContainer: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: '15%',
  },
  absoluteContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingBottom: 25,
    paddingLeft: 20,
    paddingRight: 20,
  },
  avatar: {
    overflow: 'hidden',
    marginBottom: 30,
  },
  loaderText: {
    marginTop: '5%',
  },
});

export default SetupUser;
