import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import QrWithLogo from '@components/Reusable/QR/QrWithLogo';
import {PortBundle} from '@utils/Ports/interfaces';
import {useTheme} from 'src/context/ThemeContext';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import Clipboard from '@react-native-clipboard/clipboard';
import {ToastType, useToast} from 'src/context/ToastContext';
import {getBundleClickableLink} from '@utils/Ports';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {checkAndAskContactPermission} from '@utils/AppPermissions';
import {useNavigation} from '@react-navigation/native';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';

type OnboardingQRCardBubbleProps = {
  typingAnimationDelay?: number;
  showTyping?: boolean;
  typingAnimationStartDelay?: number;
  qrData: PortBundle | null;
  userName: string;
  setScreenIndex: (prev: number) => void;
  setIsLinkCopied: (prev: boolean) => void;
  setIsLinkShared: (prev: boolean) => void;
  qrLoading: boolean;
  userAvatar: FileAttributes;
  hasFailed: boolean;
};

const OnboardingQRCardBubble: React.FC<OnboardingQRCardBubbleProps> = ({
  typingAnimationDelay = 3000,
  typingAnimationStartDelay = 0,
  showTyping = false,
  qrData = null,
  userName,
  setScreenIndex,
  setIsLinkCopied,
  setIsLinkShared,
  qrLoading = false,
  userAvatar = DEFAULT_PROFILE_AVATAR_INFO,
  hasFailed = false,
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors, showTyping);

  const svgArray = [
    {
      assetName: 'ShareAccent',
      light: require('@assets/icons/ShareAccent.svg').default,
      dark: require('@assets/dark/icons/ShareAccent.svg').default,
    },
    {
      assetName: 'CopyIcon',
      light: require('@assets/icons/copy.svg').default,
      dark: require('@assets/dark/icons/Copy.svg').default,
    },
    {
      assetName: 'ShareIcon',
      light: require('@assets/icons/ShareBlack.svg').default,
      dark: require('@assets/dark/icons/ShareGrey.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const ShareIcon = results.ShareIcon;
  const CopyIcon = results.CopyIcon;

  const navigation = useNavigation();

  // Animation references for slide and fade-in
  const translateX = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [isTyping, setIsTyping] = useState(showTyping);
  const [isVisible, setIsVisible] = useState(false);

  const {themeValue} = useTheme();

  // Animated values for typing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Start animation and visibility after the specified start delay
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsVisible(true);

      // Start the slide and fade-in animations
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      if (showTyping) {
        setIsTyping(true); // Trigger typing animation
      }
    }, typingAnimationStartDelay);

    return () => clearTimeout(startTimeout);
  }, [showTyping, translateX, opacity, typingAnimationStartDelay]);

  // Typing animation for dots
  useEffect(() => {
    if (isTyping) {
      // Bounce effect for each dot
      const bounceDot = (dot: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -5,
              duration: 300,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };

      bounceDot(dot1, 0);
      bounceDot(dot2, 150); // Slight delay between dots
      bounceDot(dot3, 300);

      // Set timeout to stop typing and show main content after delay
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, typingAnimationDelay);

      return () => clearTimeout(typingTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping]);

  //whether sharable link is being generated
  const [isLinkLoading, setIsLinkLoading] = useState<boolean>(false);

  //whether copiable link is being generated
  const [isCopyLinkLoading, setIsCopyLinkLoading] = useState<boolean>(false);

  const {showToast} = useToast();

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    try {
      setIsLinkLoading(true);
      if (qrData && qrData.portId) {
        await getBundleClickableLink(
          BundleTarget.direct,
          qrData.portId,
          JSON.stringify(qrData),
        );
        setIsLinkLoading(false);
        try {
          const granted = await checkAndAskContactPermission();
          if (granted) {
            navigation.navigate('PhoneContactList', {
              fromOnboardingStack: true,
              onLinkShare: () => {
                setIsLinkShared(true);
                navigation.navigate('OnboardingSetupScreen');
              },
            });
            setScreenIndex(6);
          } else {
            showToast(
              'Please allow access to your contacts in order to continue. This can be changed in your Settings.',
              ToastType.error,
            );
          }
        } catch (error) {
          console.log('Link not shared', error);
        }
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLinkLoading(false);
      showToast(
        'Could not share link. Please check you internet and try again.',
        ToastType.error,
      );
    }
  };

  //converts qr bundle into link and copies
  const onFetchLinkAndCopy = async () => {
    try {
      setIsCopyLinkLoading(true);
      if (qrData && qrData.portId) {
        const link = await getBundleClickableLink(
          BundleTarget.direct,
          qrData.portId,
          JSON.stringify(qrData),
        );
        setIsLinkLoading(false);
        Clipboard.setString(link);
      }
      showToast('Link Copied!', ToastType.success);
      setIsCopyLinkLoading(false);
      setScreenIndex(6);
      setIsLinkCopied(true);
    } catch (error) {
      console.log('Link not shared', error);
      showToast(
        'Could not copy link. Please check you internet and try again.',
        ToastType.error,
      );
      setIsCopyLinkLoading(false);
    }
    return;
  };

  return isVisible ? (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          transform: [{translateX}],
          opacity,
        },
      ]}>
      <SimpleCard style={styles.cardContainer}>
        {isTyping ? (
          // Typing animation with 3 bouncing dots
          <View style={styles.typingContainer}>
            <Animated.View
              style={[styles.dot, {transform: [{translateY: dot1}]}]}
            />
            <Animated.View
              style={[styles.dot, {transform: [{translateY: dot2}]}]}
            />
            <Animated.View
              style={[styles.dot, {transform: [{translateY: dot3}]}]}
            />
          </View>
        ) : (
          <>
            <View style={{alignItems: 'center'}}>
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: PortSpacing.intermediate.uniform,
                  marginBottom: PortSpacing.medium.uniform,
                  backgroundColor:
                    themeValue === 'dark'
                      ? Colors.primary.accent
                      : Colors.lowAccentColors.violet,
                }}>
                <NumberlessText
                  textColor={
                    themeValue === 'dark'
                      ? Colors.primary.white
                      : Colors.primary.accent
                  }
                  fontType={FontType.sb}
                  fontSizeType={FontSizeType.s}>
                  {'One-time use QR'}
                </NumberlessText>
              </View>
              <QrWithLogo
                qrData={qrData}
                profileUri={userAvatar.fileUri}
                isLoading={qrLoading}
                hasFailed={hasFailed}
              />
              <NumberlessText
                style={{
                  textAlign: 'center',
                  paddingVertical: PortSpacing.medium.uniform,
                }}
                fontType={FontType.md}
                fontSizeType={FontSizeType.xl}
                textColor={Colors.text.primary}>
                {userName}
              </NumberlessText>
            </View>
            <View style={{gap: PortSpacing.tertiary.uniform}}>
              <Pressable
                disabled={isCopyLinkLoading}
                onPress={onFetchLinkAndCopy}
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  height: 50,
                  gap: PortSpacing.tertiary.left,
                  borderRadius: PortSpacing.medium.uniform,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.primary.surface,
                  borderColor: Colors.primary.stroke,
                  borderWidth: 0.5,
                }}>
                {isCopyLinkLoading ? (
                  <ActivityIndicator
                    color={
                      themeValue === 'light'
                        ? Colors.primary.darkgrey
                        : Colors.text.primary
                    }
                  />
                ) : (
                  <CopyIcon height={20} width={20} />
                )}
                <NumberlessText
                  style={{
                    textAlign: 'center',
                    color: Colors.text.primary,
                  }}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.l}>
                  Copy Port link
                </NumberlessText>
              </Pressable>

              <Pressable
                disabled={isLinkLoading}
                onPress={fetchLinkData}
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  height: 50,
                  gap: PortSpacing.tertiary.left,
                  borderRadius: PortSpacing.medium.uniform,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.primary.surface,
                  borderColor: Colors.primary.stroke,
                  borderWidth: 0.5,
                }}>
                {isLinkLoading ? (
                  <ActivityIndicator
                    color={
                      themeValue === 'light'
                        ? Colors.primary.darkgrey
                        : Colors.text.primary
                    }
                  />
                ) : (
                  <ShareIcon height={20} width={20} />
                )}
                <NumberlessText
                  style={{
                    textAlign: 'center',
                    color: Colors.text.primary,
                  }}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.l}>
                  Share your Port
                </NumberlessText>
              </Pressable>
            </View>
          </>
        )}
      </SimpleCard>
    </Animated.View>
  ) : null; // Don't render anything until the delay passes
};

const styling = (Colors: any, showTyping?: boolean) =>
  StyleSheet.create({
    animatedContainer: {
      width: 300,
      marginRight: showTyping ? 'auto' : undefined,
    },
    cardContainer: {
      backgroundColor: Colors.primary.surface2,
      paddingHorizontal: PortSpacing.medium.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      gap: PortSpacing.medium.uniform,
    },
    // Typing animation container
    typingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: PortSpacing.tertiary.uniform,
      height: 20,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.text.subtitle,
    },
  });

export default OnboardingQRCardBubble;
