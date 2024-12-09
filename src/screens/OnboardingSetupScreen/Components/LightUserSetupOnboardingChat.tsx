import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  DEFAULT_PROFILE_AVATAR_INFO,
  NAME_LENGTH_LIMIT,
  TOPBAR_HEIGHT,
} from '@configs/constants';

import {useNavigation} from '@react-navigation/native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import RightAngleWhite from '@assets/dark/icons/navigation/AngleRight.svg';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import InputWithoutBorder from '@components/Reusable/Inputs/InputWithoutBorder';
import {useTheme} from 'src/context/ThemeContext';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {deleteProfile, getRandomAvatarInfo, setupProfile} from '@utils/Profile';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {ToastType, useToast} from 'src/context/ToastContext';
import {fetchNewPorts, readBundle} from '@utils/Ports';
import store from '@store/appStore';
import {ProfileStatus} from '@utils/Storage/RNSecure/secureProfileHandler';
import {initialiseFCM} from '@utils/Messaging/FCM/fcm';
import {getBundleFromLink} from '@utils/DeepLinking';
import OnboardingMessageBubble from './OnboardingMessageBubble';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AnimatedProgressBar from './AnimatedProgressBar';
import useKeyboardVisibility from '@utils/Hooks/useKeyboardVisibility';

const STEP_ONE_POINTS = [
  {
    text: 'We’re building a world beyond phone numbers and other contact info.',
  },
  {
    bold: true,
    text: 'Why eliminate contact info?',
  },
  {
    text: 'You can’t be spammed if there’s no contact info to spam.',
    icon: '🚫',
  },
  {
    text: 'Contact info can’t be retracted, even if the conversation doesn’t work out.',
    icon: '🔒',
  },
  {
    text: 'You can’t control who shares your contact info, leading to unwanted messages.',
    icon: '🔗',
  },
  {
    text: 'Data about you can be aggregated based on your contact info.',
    icon: '📊',
  },
  {
    text: 'Curious how Port works without using any contact info? We’d love to show you!',
  },
];

const STEP_TWO_POINTS_WITH_URL = [
  {
    text: 'Your name is private—only visible to you and your contacts. We don’t see or store it. You can always edit your name later.',
  },
  {
    text: 'Enter your name below ⬇️',
    bold: true,
    accentColor: true,
  },
];
const STEP_TWO_POINTS = [
  {
    text: 'Your name is private—only visible to you and your contacts. We don’t see or store it. You can always edit your name later.',
  },
  {
    text: 'Enter your name below ⬇️',
    accentColor: true,
    bold: true,
  },
];
const STEP_THREE_POINTS = [
  {
    text: 'We don’t need anything else to get you started.',
  },
];
const INVALID_LINK_POINTS = [
  {
    text: 'You can go home now and start connecting with people.',
    bold: false,
  },
];

const LightUserSetupOnboardingChat = ({
  screenIndex,
  setScreenIndex,
  portUrl = null,
}: {
  portUrl?: any;
  screenIndex: number;
  setScreenIndex: (x: number) => void;
}) => {
  const navigation = useNavigation();
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  const maxScreenIndex = 4;
  const styles = styling(Colors, themeValue, screenIndex, maxScreenIndex);
  const scrollViewRef = useRef<ScrollView>(null);
  const {showToast} = useToast();

  const inset = useSafeAreaInsets();
  const processedAvatar: FileAttributes = useMemo(
    () => getRandomAvatarInfo() || DEFAULT_PROFILE_AVATAR_INFO,
    [],
  );
  type ThunkAction = () => Promise<boolean>;

  //name entered by the user
  const [userName, setUserName] = useState<string>('');
  const [rawInputText, setRawInputText] = useState<string>('');
  //triggers useeffect to go to next bubble index post profile creation success
  const [settingUpUser, setSettingUpUser] = useState<boolean>(false);
  const [isInvalidLink, setIsInvalidLink] = useState<boolean>(false);

  const svgArray = [
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const RightChevron = results.RightChevron;

  const onBackPress = () => {
    if (screenIndex < 3) {
      navigation.goBack();
    }
  };

  const onRedirectToHome = () => {
    store.dispatch({
      type: 'ONBOARDING_COMPLETE',
      payload: true,
    });
  };

  const setInputText = (rawName: string) => {
    const limitedRawName = rawName.substring(0, NAME_LENGTH_LIMIT);
    setRawInputText(limitedRawName);
  };

  const onSubmitNameAndSetupUser = async () => {
    Keyboard.dismiss();
    onSetupUser();
  };

  const formNewConnection = async () => {
    if (typeof portUrl === 'string') {
      const bundle = await getBundleFromLink({url: portUrl});
      if (bundle) {
        console.log('read bundle: ', bundle);
        await readBundle(bundle);
      } else {
        throw new Error('Invalid link: failed to retrieve bundle.');
      }
    } else {
      const bundle = portUrl;
      if (bundle) {
        console.log('read bundle: ', bundle);
        await readBundle(bundle);
      } else {
        showToast('QR is Invalid!', ToastType.error);
      }
    }
  };

  const onSetupUser = async () => {
    setSettingUpUser(true);

    BackHandler.addEventListener('hardwareBackPress', () => true);

    navigation.addListener('beforeRemove', e => e.preventDefault());

    try {
      const ret = await runActions();

      if (!ret) {
        showToast(
          'Error in setting you up, please check your network.',
          ToastType.error,
        );

        await deleteProfile();
        console.error('profile deleted!');
        setSettingUpUser(false);
      } else {
        setUserName(rawInputText.trim());
        setInputText('');
        setSettingUpUser(false);

        if (portUrl) {
          try {
            await formNewConnection();
          } catch (error: any) {
            setSettingUpUser(false);
            setIsInvalidLink(true);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error during setup:', error);
      setSettingUpUser(false);
      showToast('An unexpected error occurred.', ToastType.error);
    }
  };

  //setting up user
  //state of progress
  //actions attached to progress
  const setupActions: ThunkAction[] = [
    async (): Promise<boolean> => {
      //setup profile
      const response = await setupProfile(rawInputText, processedAvatar);
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
    if (userName && screenIndex === 2) {
      setScreenIndex(3);
      setTimeout(() => {
        setScreenIndex(4);
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  const isKeyboardVisible = useKeyboardVisibility();

  useEffect(() => {
    const scrollToBottom = () => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    };

    if (scrollViewRef?.current) {
      const delay = isKeyboardVisible ? 0 : 50;
      const timeout = setTimeout(scrollToBottom, delay);
      return () => clearTimeout(timeout);
    }
  }, [screenIndex, isKeyboardVisible]);

  useEffect(() => {
    if (screenIndex === 1) {
      const timeoutId = setTimeout(() => {
        setScreenIndex(2);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenIndex === 1]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topBarContainer}>
        <Pressable onPress={onBackPress}>
          <RightChevron
            style={{
              transform: [{scaleX: -1}],
              opacity: screenIndex >= 3 ? 0 : 1,
            }}
            width={20}
            height={20}
          />
        </Pressable>
        <NumberlessText
          style={{textAlign: 'center', flex: 1}}
          textColor={Colors.text.primary}
          fontType={FontType.sb}
          fontSizeType={FontSizeType.xl}>
          {'Let’s Port Over'}
        </NumberlessText>
      </View>
      <AnimatedProgressBar
        maxScreenIndex={maxScreenIndex}
        screenIndex={screenIndex}
      />
      <KeyboardAvoidingView
        style={{
          flexGrow: 1,
          flexShrink: 1,
          paddingBottom: PortSpacing.secondary.bottom,
          width: screen.width,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          backgroundColor:
            themeValue === 'dark'
              ? Colors.primary.background
              : Colors.primary.surface,
        }}
        behavior={isIOS ? 'padding' : 'height'}
        keyboardVerticalOffset={isIOS ? inset.bottom + 20 : 30}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            gap: PortSpacing.tertiary.uniform,
            paddingHorizontal: PortSpacing.secondary.uniform,
          }}>
          {screenIndex >= 1 && (
            <OnboardingMessageBubble
              titleColor={
                themeValue === 'dark'
                  ? Colors.primary.accentLight
                  : Colors.primary.accent
              }
              title={
                portUrl
                  ? 'Awesome! You’re almost there'
                  : 'Welcome to the future of messaging!'
              }
              points={
                portUrl
                  ? [
                      {
                        text: `We need to set you up with a profile before you can connect ${
                          portUrl?.name ? `with ${portUrl.name} ` : ''
                        }using this Port.`,
                      },
                    ]
                  : STEP_ONE_POINTS
              }
            />
          )}
          {screenIndex >= 1 && (
            <OnboardingMessageBubble
              showTyping={true}
              typingAnimationDelay={2000}
              typingAnimationStartDelay={1000}
              title="Get started by adding your name"
              points={portUrl ? STEP_TWO_POINTS_WITH_URL : STEP_TWO_POINTS}
            />
          )}
          {screenIndex >= 3 && userName && (
            <OnboardingMessageBubble
              sender={true}
              points={[
                {
                  text: userName,
                },
              ]}
            />
          )}
          {screenIndex >= 3 && (
            <OnboardingMessageBubble
              showTyping={true}
              typingAnimationDelay={1500}
              title={
                isInvalidLink
                  ? 'Link is Invalid but profile is created!'
                  : 'That’s it! Your onboarding is done!'
              }
              points={
                portUrl && !isInvalidLink
                  ? [
                      {
                        text: `You can go home and start chatting with ${
                          portUrl?.name || ' your connection'
                        }.`,
                      },
                    ]
                  : portUrl && isInvalidLink
                  ? INVALID_LINK_POINTS
                  : STEP_THREE_POINTS
              }
              titleColor={
                themeValue === 'dark'
                  ? Colors.primary.accentLight
                  : Colors.primary.accent
              }
            />
          )}
        </ScrollView>
        {(screenIndex === 2 || screenIndex === 3) && (
          <View style={styles.bottomBarContainer}>
            <View style={styles.bottomBarWrapper}>
              <View style={styles.inputContainer}>
                <InputWithoutBorder
                  setText={setInputText}
                  text={rawInputText}
                  bgColor={themeValue === 'dark' ? 'w' : 'g'}
                  isEditable={screenIndex === 2}
                  maxLength={NAME_LENGTH_LIMIT}
                  placeholderText="Enter your name"
                />
              </View>
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  buttonText="Continue"
                  disabled={rawInputText.length === 0}
                  isLoading={settingUpUser}
                  onClick={onSubmitNameAndSetupUser}
                  primaryButtonColor="b"
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
              }}>
              <NumberlessText
                style={{
                  textAlign: 'left',
                  flex: 1,
                }}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.s}
                textColor={Colors.text.subtitle}>
                By clicking on 'Continue', you agree to our{' '}
                <NumberlessText
                  onPress={() =>
                    Linking.openURL(
                      'https://port.numberless.tech/TermsAndConditions',
                    )
                  }
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.s}
                  textColor={
                    themeValue === 'light'
                      ? Colors.primary.accent
                      : Colors.primary.blue
                  }>
                  Terms
                </NumberlessText>{' '}
                and{' '}
                <NumberlessText
                  fontType={FontType.rg}
                  onPress={() =>
                    Linking.openURL(
                      'https://port.numberless.tech/PrivacyPolicy',
                    )
                  }
                  fontSizeType={FontSizeType.s}
                  textColor={
                    themeValue === 'light'
                      ? Colors.primary.accent
                      : Colors.primary.blue
                  }>
                  Privacy Policy
                </NumberlessText>
                .
              </NumberlessText>
            </View>
          </View>
        )}
        {screenIndex === maxScreenIndex && (
          <>
            <View style={styles.ctaContainer}>
              <Pressable onPress={onRedirectToHome} style={styles.ctaWrapper}>
                <NumberlessText
                  style={{flex: 1, textAlign: 'center'}}
                  textColor={
                    themeValue === 'dark'
                      ? Colors.text.primary
                      : Colors.primary.white
                  }
                  fontType={FontType.sb}
                  fontSizeType={FontSizeType.l}>
                  {'Enter Port'}
                </NumberlessText>
                <RightAngleWhite width={20} height={20} />
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styling = (
  colors: any,
  themeValue: any,
  screenIndex: number,
  maxScreenIndex: number,
) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.white,
      height: screen.height,
      paddingBottom: isIOS ? PortSpacing.secondary.bottom : 0,
    },
    topBarContainer: {
      height: TOPBAR_HEIGHT,
      paddingHorizontal: PortSpacing.secondary.uniform,
      width: screen.width,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomBarContainer: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingTop: PortSpacing.secondary.uniform,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      gap: 4,
      marginTop: screenIndex === maxScreenIndex ? PortSpacing.tertiary.top : 0,
    },
    bottomBarWrapper: {
      flexDirection: 'row',
      gap: PortSpacing.tertiary.uniform,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputContainer: {
      borderRadius: PortSpacing.intermediate.uniform,
      overflow: 'hidden',
      flex: 2,
    },
    buttonContainer: {
      borderRadius: PortSpacing.intermediate.uniform,
      overflow: 'hidden',
      flex: 1,
    },
    ctaContainer: {
      marginHorizontal: PortSpacing.secondary.uniform,
      marginVertical: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.intermediate.uniform,
    },
    ctaWrapper: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      backgroundColor: colors.button.black,
      borderRadius: PortSpacing.intermediate.uniform,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default LightUserSetupOnboardingChat;
