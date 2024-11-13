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
  defaultFolderInfo,
} from '@configs/constants';

import {useNavigation} from '@react-navigation/native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import RightAngleWhite from '@assets/dark/icons/navigation/AngleRight.svg';
import {
  BackHandler,
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
import OnboardingQRCardBubble from './OnboardingQRCardBubble';
import {fetchNewPorts, generateBundle, readBundle} from '@utils/Ports';
import {PortBundle} from '@utils/Ports/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import store from '@store/appStore';
import {ProfileStatus} from '@utils/Storage/RNSecure/secureProfileHandler';
import {initialiseFCM} from '@utils/Messaging/FCM/fcm';
import {useSelector} from 'react-redux';
import {getBundleFromLink} from '@utils/DeepLinking';
import OnboardingMessageBubble from './OnboardingMessageBubble';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AnimatedProgressBar from './AnimatedProgressBar';

const stepOnePoint = [
  {
    text: 'We’re on a mission to build a numberless world—where you can connect without sharing your contact info.',
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
    text: `Curious how Port works without using any contact info? We’d love to show you!`,
  },
];

const stepTwoPortUrlPoints = [
  {
    text: `Your name is private—only visible to you and your contacts. We don’t see or store it. You can always edit your name later.`,
  },
  {
    text: 'Enter your name below ⬇️',
    bold: true,
    accentColor: true,
  },
];
const stepTwoPoints = [
  {
    text: 'Your name is private—only visible to you and your contacts. We don’t see or store it. You can always edit your name later.',
  },
  {
    text: 'Enter your name below ⬇️',
    accentColor: true,
    bold: true,
  },
];
const stepThreePoints = [
  {
    text: 'Instead of contact info, we use Ports, one-time use QR codes or links that form a new connection.',
  },
  {
    text: "Let's create one for you now 🪄",
    bold: true,
  },
];

const stepFourLinkCopiedPoints = [
  {
    text: 'Port is better with your favorite people!\nShare the link to bring your contacts over. Your chat appears once they tap it.',
  },
];
const stepFourLinkSharedPoints = [
  {
    text: 'Port is better with your favorite people!\nYour chat will be created once your contact taps the link.',
  },
];
const stepFourQRScannedPoints = [
  {
    text: 'Congratulations on creating your first connection. You can now go home and start chatting with them.',
  },
];

const UserSetupOnboardingChat = ({
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

  const maxScreenIndex = portUrl ? 4 : 6;
  const styles = styling(Colors, themeValue, screenIndex);
  const scrollViewRef = useRef<ScrollView>(null);

  const [newUserName, setNewUserName] = useState<string>('');

  const processedAvatar: FileAttributes = useMemo(
    () => getRandomAvatarInfo() || DEFAULT_PROFILE_AVATAR_INFO,
    [],
  );
  type ThunkAction = () => Promise<boolean>;

  const setInputText = (rawName: string) => {
    const trimmedRawName = rawName.trim().substring(0, NAME_LENGTH_LIMIT);
    if (trimmedRawName === '') {
      setRawInputText('');
    }
    setRawInputText(trimmedRawName);
  };

  const [inputText, setRawInputText] = useState<string>('');
  //triggers useeffect to go to next bubble index post profile creation success
  const [settingUpUser, setSettingUpUser] = useState<boolean>(false);
  const [qrData, setQrData] = useState<PortBundle | null>(null);
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const [hasFailed, setHasFailed] = useState<boolean>(false);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);
  const [isLinkShared, setIsLinkShared] = useState<boolean>(false);
  const [isQRScanned, setIsQRScanned] = useState<boolean>(false);

  const svgArray = [
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const RightChevron = results.RightChevron;

  const onSubmitNameAndSetupUser = async () => {
    onSetupUser();
    portUrl && (await formNewConnection());
  };

  const formNewConnection = async () => {
    if (typeof portUrl === 'string') {
      const bundle = await getBundleFromLink({url: portUrl});
      console.log('read bundle: ', bundle);
      await readBundle(bundle);
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
  const onSetupUser = () => {
    //Stops you from going back
    setSettingUpUser(true);

    BackHandler.addEventListener('hardwareBackPress', () => {
      return null;
    });
    navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
    });

    runActions().then(ret => {
      if (!ret) {
        //error case
        showToast(
          'Error in setting you up, please check your network.',
          ToastType.error,
        ); //delete whatever profile is setup so it can begin again cleanly.
        deleteProfile().then(() => {
          console.error('profile deleted!');
        });
        setSettingUpUser(false);
      } else {
        //success case
        setNewUserName(inputText);
        setInputText('');
        setSettingUpUser(false);
        // ts-ignore
      }
    });
  };

  useEffect(() => {
    if (screenIndex === 1) {
      const timeoutId = setTimeout(
        () => {
          setScreenIndex(2);
        },
        portUrl ? 2000 : 4000,
      );

      // Cleanup function to clear the timeout
      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (screenIndex === 4) {
      const timeoutId = setTimeout(() => {
        setScreenIndex(5);
      }, 3000);

      // Cleanup function to clear the timeout
      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  useEffect(() => {
    if (screenIndex === 4) {
      const timeoutId = setTimeout(() => {
        if (scrollViewRef && scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({animated: true});
        }
      }, 2000);

      // Cleanup function to clear the timeout
      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData, screenIndex === 4, isLinkCopied, isLinkShared, isQRScanned]);

  //checks latest new connection
  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const {showToast} = useToast();

  const onRedirectToHome = () => {
    setScreenIndex(6);
    store.dispatch({
      type: 'ONBOARDING_COMPLETE',
      payload: true,
    });
  };

  //fetches a port and its associated permissions
  const fetchPort = async () => {
    try {
      setQrLoading(true);
      setHasFailed(false);
      const bundle: PortBundle = await generateBundle(
        BundleTarget.direct,
        undefined,
        undefined,
        undefined,
        undefined,
        defaultFolderInfo.folderId,
      );

      if (bundle) {
        setQrData(bundle);
      }
      setQrLoading(false);
    } catch (error) {
      console.log('Failed to fetch port: ', error);
      setHasFailed(true);
      setQrLoading(false);
      setQrData(null);
    }
  };

  //setting up user
  //state of progress
  //actions attached to progress
  const setupActions: ThunkAction[] = [
    async (): Promise<boolean> => {
      //setup profile
      const response = await setupProfile(inputText, processedAvatar);
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

  //sets isQRScanned state boolean true if latest new connection Id matches port Id
  useEffect(() => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (qrData) {
          if (qrData.portId === latestUsedConnectionLinkId) {
            setIsQRScanned(true);
            return;
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  useEffect(() => {
    if (newUserName && screenIndex === 2) {
      setScreenIndex(3);
      setTimeout(() => {
        setScreenIndex(4);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUserName]);

  useEffect(() => {
    if (screenIndex >= 4 && !portUrl) {
      fetchPort();
    }
    const timeoutId = setTimeout(() => {
      if (scrollViewRef && scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({animated: true});
      }
    }, 200);
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, screenIndex]);

  const onBackPress = () => {
    if (screenIndex < 3) {
      if (portUrl) {
        navigation.navigate('Welcome');
      } else {
        navigation.goBack();
      }
    }
  };

  const inset = useSafeAreaInsets();

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
          {screenIndex === 1 ? 'Let’s Port' : 'Set up Profile'}
        </NumberlessText>
      </View>
      <AnimatedProgressBar
        maxScreenIndex={maxScreenIndex}
        portUrl={portUrl}
        screenIndex={screenIndex}
      />

      <KeyboardAvoidingView
        style={{
          flex: 1,
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
                  : 'At Port, you’re in control.'
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
                  : stepOnePoint
              }
            />
          )}
          {screenIndex >= 1 && (
            <OnboardingMessageBubble
              showTyping={true}
              typingAnimationDelay={portUrl ? 2000 : 4000}
              typingAnimationStartDelay={portUrl ? 1500 : 2000}
              title="Get started by adding your name"
              points={portUrl ? stepTwoPortUrlPoints : stepTwoPoints}
            />
          )}
          {screenIndex >= 3 && newUserName && (
            <OnboardingMessageBubble
              sender={true}
              points={[
                {
                  text: newUserName,
                },
              ]}
            />
          )}
          {screenIndex >= 3 && (
            <OnboardingMessageBubble
              showTyping={true}
              typingAnimationDelay={1000}
              title="That’s it. Your onboarding is done!"
              points={
                portUrl
                  ? [
                      {
                        text: `You can go home and start chatting with${
                          portUrl?.name || ' your connection'
                        }.`,
                      },
                    ]
                  : stepThreePoints
              }
              titleColor={
                themeValue === 'dark'
                  ? Colors.primary.accentLight
                  : Colors.primary.accent
              }
            />
          )}
          {qrData && screenIndex >= 4 && (
            <OnboardingQRCardBubble
              setIsLinkCopied={setIsLinkCopied}
              setIsLinkShared={setIsLinkShared}
              setScreenIndex={setScreenIndex}
              showTyping={true}
              typingAnimationDelay={3000}
              typingAnimationStartDelay={2000}
              qrData={qrData}
              userName={newUserName}
              qrLoading={qrLoading}
              userAvatar={processedAvatar}
              hasFailed={hasFailed}
            />
          )}
          {screenIndex >= 6 && isLinkCopied && (
            <OnboardingMessageBubble
              title="Link copied ✅"
              points={stepFourLinkCopiedPoints}
              titleColor={
                themeValue === 'dark'
                  ? Colors.primary.accentLight
                  : Colors.primary.accent
              }
            />
          )}
          {screenIndex >= 6 && isLinkShared && (
            <OnboardingMessageBubble
              title="Nice work! You’ve shared your Port ✅"
              points={stepFourLinkSharedPoints}
              titleColor={
                themeValue === 'dark'
                  ? Colors.primary.accentLight
                  : Colors.primary.accent
              }
            />
          )}
          {screenIndex >= 6 && isQRScanned && (
            <OnboardingMessageBubble
              title="Created your first connection ✅"
              points={stepFourQRScannedPoints}
              titleColor={
                themeValue === 'dark'
                  ? Colors.primary.accentLight
                  : Colors.primary.accent
              }
            />
          )}
        </ScrollView>
        {screenIndex === (2 || 3) && (
          <View style={styles.bottomBarContainer}>
            <View style={styles.bottomBarWrapper}>
              <View style={styles.inputContainer}>
                <InputWithoutBorder
                  setText={setInputText}
                  text={inputText}
                  bgColor={themeValue === 'dark' ? 'w' : 'g'}
                  isEditable={screenIndex === 2}
                  maxLength={NAME_LENGTH_LIMIT}
                  placeholderText="Enter your name"
                />
              </View>
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  buttonText="Continue"
                  disabled={inputText.length === 0}
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
        {screenIndex >= (portUrl ? 4 : 5) && (
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
                  {portUrl
                    ? 'Start chatting on Port'
                    : 'Start connecting on Port'}
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

const styling = (colors: any, themeValue: any, screenIndex: number) =>
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
      marginTop: screenIndex === 4 ? PortSpacing.tertiary.top : 0,
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

export default UserSetupOnboardingChat;
