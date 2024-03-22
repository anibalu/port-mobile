/**
 * This screen sets up a user's profile.
 * It shows an error message and re-directs to enter name screen if there's a failure.
 */
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import store from '@store/appStore';
import {initialiseFCM} from '@utils/Messaging/FCM/fcm';
import {fetchNewPorts} from '@utils/Ports';
import {deleteProfile, setupProfile} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {CircleSnail} from 'react-native-progress';
import {useErrorModal} from 'src/context/ErrorModalContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SetupUser'>;

//loader that shows up when profile is being setup
const Loader = () => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <CircleSnail color={PortColors.primary.blue.app} duration={500} />
    </View>
  );
};

function SetupUser({route, navigation}: Props) {
  //importing onboarding error
  const {onboardingFailureError} = useErrorModal();
  //we get user name and profile picture from route params
  const {name, avatar} = route.params;
  const processedName: string = name || DEFAULT_NAME;
  const processedAvatar: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;
  //state of progress
  //actions attached to progress
  type ThunkAction = () => Promise<boolean>;
  const setupActions: ThunkAction[] = [
    async (): Promise<boolean> => {
      //setup profile
      const response = await setupProfile(processedName, processedAvatar);
      if (response === ProfileStatus.created) {
        return true;
      }
      return false;
    },
    async (): Promise<boolean> => {
      //get initial set of connection links
      await fetchNewPorts();
      return true;
    },
    async (): Promise<boolean> => {
      //initialise FCM
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
    }
    return true;
  };
  useEffect(() => {
    runActions().then(ret => {
      if (!ret) {
        onboardingFailureError();
        //delete whatever profile is setup so it can begin again cleanly.
        deleteProfile().then(() => {
          navigation.navigate('OnboardingStack', {screen: 'NameScreen'});
        });
      } else {
        // ts-ignore
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
      <SafeAreaView>
        <View style={styles.container}>
          <Loader />
          <NumberlessText
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}
            textColor={PortColors.text.secondary}
            style={{
              textAlign: 'center',
              position: 'absolute',
              bottom: 44,
            }}>
            This might take a moment. Please make sure you're connected to the
            internet.
          </NumberlessText>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: PortSpacing.intermediate.uniform,
  },
});

export default SetupUser;
