/**
 * This screen sets up a user account
 * screen id: 4
 */
import {PortColors} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import ProgressBar from '@components/ProgressBar';
import {AVATAR_ARRAY, DEFAULT_NAME} from '@configs/constants';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getInitialDirectConnectionLinks} from '@utils/ConnectionLinks/direct';
import {initialiseFCM} from '@utils/Messaging/fcm';
import {setupNewProfile} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useErrorModal} from 'src/context/ErrorModalContext';
import store from '@store/appStore';

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
    async (): Promise<boolean> => {
      //setup profile
      setLoaderText("We're setting up a safe place");
      setProfileUri(AVATAR_ARRAY[1]);

      const response = await setupNewProfile(processedName);
      if (response === ProfileStatus.created) {
        return true;
      }
      return false;
    },
    async (): Promise<boolean> => {
      //get initial set of connection links
      setLoaderText('Getting you ready to connect with others');
      setProfileUri(AVATAR_ARRAY[2]);

      return await getInitialDirectConnectionLinks();
    },
    async (): Promise<boolean> => {
      //initialise FCM
      setLoaderText("We're almost there");
      setProfileUri('avatar://4');
      return await initialiseFCM();
    },
  ];
  const runActions = async (): Promise<boolean> => {
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
        store.dispatch({
          type: 'ONBOARDING_COMPLETE',
          payload: true,
        });
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
      <View style={styles.container}>
        <View style={styles.avatar}>
          <GenericAvatar avatarSize="large" profileUri={profileUri} />
        </View>
        <ProgressBar progress={progress} />
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.secondary}
          style={{marginTop: 11}}>
          {loaderText}
        </NumberlessText>

        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.secondary}
          style={{
            textAlign: 'center',
            position: 'absolute',
            bottom: 44,
          }}>
          This may take a few seconds. Please ensure you have an active internet
          connection.
        </NumberlessText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: PortColors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  avatar: {
    overflow: 'hidden',
    marginBottom: 30,
  },
});

export default SetupUser;
