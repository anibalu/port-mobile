import React, {useState} from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import {useColors} from '@components/colorGuide';
import CustomKeyboardAvoidingView from '@components/CustomKeyboardAvoidingView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import {SafeAreaView} from '@components/SafeAreaView';
import {Size, Spacing} from '@components/spacingGuide';
import useSVG from '@components/svgGuide';
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import {NAME_LENGTH_LIMIT} from '@configs/constants';

import {OnboardingStackParamList} from '@navigation/OnboardingStack/OnboardingStackTypes';
import {rootNavigationRef} from '@navigation/rootNavigation';

import {initialiseFCM} from '@utils/Messaging/PushNotifications/fcm';
import { Port } from '@utils/Ports/SingleUsePorts/Port';
import {
  deleteProfile,
  getRandomAvatarInfo,
  processName,
  setupProfile,
} from '@utils/Profile';
import {ProfileStatus} from '@utils/Storage/RNSecure/secureProfileHandler';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';

import {ToastType, useToast} from 'src/context/ToastContext';
type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'OnboardingSetupScreen'
>;

const OnboardingSetupScreen = ({navigation}: Props) => {
  const {showToast} = useToast();

  // profile picture attributes
  const [imageAttr, setImageAttr] = useState<FileAttributes>(
    getRandomAvatarInfo(),
  );
  // profile is being setup
  const [isLoading, setIsLoading] = useState(false);
  // open edit avatar modal
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);
  // user name
  const [userName, setUserName] = useState<string>('');

  const svgArray = [
    {
      assetName: 'EditCameraIcon',
      light: require('@assets/light/icons/EditCamera.svg').default,
      dark: require('@assets/dark/icons/EditCamera.svg').default,
    },
  ];

  const color = useColors();

  const results = useSVG(svgArray);
  const EditCameraIcon = results.EditCameraIcon;

  const onBackPress = () => {
    navigation.goBack();
  };

  type ThunkAction = () => Promise<boolean>;

  //Actions to be performed in order to setup a user
  const setupActions: ThunkAction[] = [
    //setup a user's profile. Onboarding fails if this fails
    async (): Promise<boolean> => {
      const processedName = processName(userName);
      const response = await setupProfile(processedName, imageAttr);
      if (response === ProfileStatus.created) {
        return true;
      }
      return false;
    },

    //fetch new ports. Onboarding doesn't fail if this fails
    async (): Promise<boolean> => {
      await Port.generator.fetchNewPorts();
      return true;
    },

    //initialise FCM. Onboarding doesn't fail if this fails
    async (): Promise<boolean> => {
      await initialiseFCM();
      return true;
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

  //setup a user by running all actions in order
  const onSetupUser = () => {
    setIsLoading(true);
    if (processName(userName).length === 0) {
      showToast('Please input a valid name.', ToastType.error);
      setIsLoading(false);
      return;
    }
    runActions().then(ret => {
      if (!ret) {
        //error case
        showToast(
          'Error in setting you up, please check your network and try again.',
          ToastType.error,
        ); //delete whatever profile is setup so it can begin again cleanly.

        deleteProfile().then(() => {
          console.error('profile deleted!');
          setIsLoading(false);
        });
      } else {
        //success case
        setIsLoading(false);
        //navigate to permissions screen
        if (rootNavigationRef.isReady()) {
          rootNavigationRef.reset({
            index: 0,
            routes: [
              {
                name: 'AppStack',
                params: {
                  screen: 'DefaultPermissionsScreen',
                  params: {isFromOnboarding: true},
                },
              },
            ],
          });
        }
      }
    });
  };

  //dummy function to save profile picture
  async function onSavePicture(profilePicAttr: FileAttributes) {
    console.log(profilePicAttr);
  }

  const styles = styling(color);

  return (
    <>
      <CustomStatusBar theme={color.theme} backgroundColor={color.background} />
      <SafeAreaView backgroundColor={color.background}>
        <GenericBackTopBar
          onBackPress={onBackPress}
          theme={color.theme}
          backgroundColor={color.background}
        />
        <CustomKeyboardAvoidingView>
          <ScrollView contentContainerStyle={styles.mainContainer}>
            <View style={{gap: Spacing.m}}>
              <NumberlessText
                textColor={color.text.title}
                fontWeight={FontWeight.sb}
                fontSizeType={FontSizeType.es}>
                {'Let’s get you set up!'}
              </NumberlessText>
              <NumberlessText
                textColor={color.text.subtitle}
                fontWeight={FontWeight.rg}
                fontSizeType={FontSizeType.l}>
                Your name and profile picture are private — only visible to you
                and your chosen contacts. We don’t see or store them.
              </NumberlessText>
              <View
                style={{
                  gap: Spacing.l,
                  paddingTop: Spacing.xxl,
                  paddingBottom: Spacing.l,
                }}>
                <View style={styles.profilePictureHitbox}>
                  <AvatarBox
                    profileUri={imageAttr.fileUri}
                    avatarSize="m"
                    onPress={() => {
                      setOpenEditAvatarModal(p => !p);
                    }}
                  />
                  <Pressable
                    style={styles.updatePicture}
                    onPress={() => {
                      setOpenEditAvatarModal(p => !p);
                    }}>
                    <EditCameraIcon width={20} height={20} />
                  </Pressable>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={color.disabled}
                  value={userName}
                  textAlign="center"
                  maxLength={NAME_LENGTH_LIMIT}
                  onChangeText={setUserName}
                  autoFocus={false}
                  numberOfLines={1}
                  multiline={false}
                  autoCorrect={false}
                  allowFontScaling={false}
                />
              </View>
            </View>
            <View style={{gap: Spacing.l}}>
              <NumberlessText
                style={{textAlign: 'center'}}
                fontWeight={FontWeight.rg}
                fontSizeType={FontSizeType.s}
                textColor={color.text.title}>
                By clicking on 'Continue' or by restoring your account, you
                agree to our{' '}
                <NumberlessText
                  onPress={() =>
                    Linking.openURL(
                      'https://portmessenger.com/TermsAndConditions',
                    )
                  }
                  fontWeight={FontWeight.rg}
                  fontSizeType={FontSizeType.s}
                  textColor={color.purple}>
                  Terms
                </NumberlessText>{' '}
                and{' '}
                <NumberlessText
                  fontWeight={FontWeight.rg}
                  onPress={() =>
                    Linking.openURL('https://portmessenger.com/PrivacyPolicy')
                  }
                  fontSizeType={FontSizeType.s}
                  textColor={color.purple}>
                  Privacy Policy
                </NumberlessText>
                .
              </NumberlessText>
              <PrimaryButton
                isLoading={isLoading}
                theme={color.theme}
                text={'Continue'}
                disabled={processName(userName).length === 0}
                onClick={onSetupUser}
              />
            </View>
          </ScrollView>
        </CustomKeyboardAvoidingView>
        <EditAvatar
          visible={openEditAvatarModal}
          onSave={onSavePicture}
          localImageAttr={imageAttr}
          setLocalImageAttr={setImageAttr}
          onClose={() => {
            setOpenEditAvatarModal(false);
          }}
        />
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    profilePictureHitbox: {
      paddingHorizontal: Spacing.xl,
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      alignSelf: 'center',
    },
    input: {
      color: Colors.text.title,
      fontSize: 40,
    },
    mainContainer: {
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: Spacing.l,
      paddingHorizontal: Spacing.l,
    },
    updatePicture: {
      width: Size.xl,
      height: Size.xl,
      backgroundColor: Colors.purple,
      position: 'absolute',
      bottom: -Spacing.s,
      right: Spacing.l,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: Spacing.l,
    },
  });
export default OnboardingSetupScreen;
