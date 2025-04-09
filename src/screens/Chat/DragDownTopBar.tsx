import React, {forwardRef, useImperativeHandle, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PermissionIcons from '@components/PermissionIcons';
import ContactSettingsCard from '@components/Reusable/PermissionCards/ContactSettingsCard';
import NewChatSettingsCard from '@components/Reusable/PermissionCards/NewChatSettingsCard';

import {DirectPermissions} from '@utils/Storage/DBCalls/permissions/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {useTheme} from 'src/context/ThemeContext';

/**
 * Access slider constants
 */
const TOP_BAR_HEIGHT = 56; //height of chat screen top bar
const PERMISSION_BAR_HEIGHT = 40; //height of perission icons bar
const SLIDER_HEIGHT = 32; //height of slider drag sliver
const SLIDER_EXCESS_HEIGHT = 0; //height of slider minus height of notch
const PERMISSIONS_OPEN_HEIGHT = 480; //height of permission cards
const THRESHOLD_OPEN = 10; //distance to move to initiate full open motion
const THRESHOLD_CLOSE = 10; //distance to move to initiate full close motion
const SLIDER_CLOSED_HEIGHT = SLIDER_HEIGHT + TOP_BAR_HEIGHT; //height of slider when it is fully closed.
const ICON_DISPLAY_HEIGHT =
  PERMISSION_BAR_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT - 4; //height of slider when permission icons are displayed
const MAX_SLIDER_HEIGHT =
  PERMISSIONS_OPEN_HEIGHT +
  SLIDER_HEIGHT +
  TOP_BAR_HEIGHT -
  SLIDER_EXCESS_HEIGHT; //height of slider when permission cards are displayed

export const ChatTopBarWithAccessControls = forwardRef(
  (
    {
      chatId,
      chatName,
      isScreenClickable,
      sliderOpen,
      permissionsId,
      permissions,
      setPermissions,
    }: {
      chatId: string;
      chatName: string;
      isScreenClickable: SharedValue<boolean>;
      sliderOpen: boolean;
      permissionsId: string | null | undefined;
      permissions: DirectPermissions | null | undefined;
      setPermissions: (x: DirectPermissions | null | undefined) => void;
    },
    ref,
  ) => {
    const {themeValue} = useTheme();
    const Colors = DynamicColors();
    const styles = styling(Colors);

    const svgArray = [
      {
        assetName: 'NotchDown',
        light: require('@assets/light/icons/NotchDown.svg').default,
        dark: require('@assets/dark/icons/NotchDown.svg').default,
      },
    ];

    const results = useDynamicSVG(svgArray);
    const NotchDown = results.NotchDown;

    // Access slider attributes
    const hasStarted = useSharedValue(false);
    const sliderHeightInitiaValue = useSharedValue(
      TOP_BAR_HEIGHT + SLIDER_HEIGHT - SLIDER_EXCESS_HEIGHT,
    );
    const sliderHeight = useSharedValue(
      TOP_BAR_HEIGHT + SLIDER_HEIGHT - SLIDER_EXCESS_HEIGHT,
    );
    const permissionCardHeight = useSharedValue(0);
    const permissionIconHeight = useSharedValue(0);
    const movingDown = useSharedValue(false);

    //close slider completely
    const moveSliderCompleteClosed = () => {
      'worklet';
      isScreenClickable.value = true;
      sliderHeight.value = withTiming(SLIDER_CLOSED_HEIGHT, {
        duration: 500,
      });
      sliderHeightInitiaValue.value = SLIDER_CLOSED_HEIGHT;
      permissionIconHeight.value = withTiming(-SLIDER_EXCESS_HEIGHT, {
        duration: 300,
      });
      permissionCardHeight.value = withTiming(0, {duration: 500});
    };

    //open slider till permission icons visible
    const moveSliderIntermediateOpen = () => {
      'worklet';
      isScreenClickable.value = true;
      sliderHeight.value = withTiming(
        ICON_DISPLAY_HEIGHT - SLIDER_EXCESS_HEIGHT,
        {duration: 500},
      );
      sliderHeightInitiaValue.value =
        ICON_DISPLAY_HEIGHT - SLIDER_EXCESS_HEIGHT;
      permissionCardHeight.value = withTiming(0, {duration: 500});
      permissionIconHeight.value = withTiming(0, {duration: 300});
    };

    //open slider completely
    const moveSliderCompleteOpen = () => {
      'worklet';
      isScreenClickable.value = false;
      sliderHeight.value = withTiming(MAX_SLIDER_HEIGHT, {duration: 500});
      sliderHeightInitiaValue.value = MAX_SLIDER_HEIGHT;
      permissionCardHeight.value = withTiming(
        PERMISSION_BAR_HEIGHT + SLIDER_EXCESS_HEIGHT,
        {
          duration: 500,
        },
      );
      permissionIconHeight.value = withTiming(0, {duration: 300});
    };

    //animated styles for slider height and permission card height
    const animatedStyleHeight = useAnimatedStyle(() => {
      return {
        height: sliderHeight.value,
      };
    });

    //animated style for permission card height
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{translateY: permissionCardHeight.value}],
      };
    });

    //animated style for permission icons height
    const animatedStylePermissionIcons = useAnimatedStyle(() => {
      return {
        transform: [{translateY: permissionIconHeight.value}],
      };
    });

    //react to changes in permissions
    useMemo(() => {
      moveSliderIntermediateOpen();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //gesture handler for slider
    const pan = Gesture.Pan()
      .onBegin(() => {
        hasStarted.value = true;
      })
      .onUpdate(e => {
        sliderHeight.value = Math.max(
          Math.min(
            e.translationY + sliderHeightInitiaValue.value,
            MAX_SLIDER_HEIGHT,
          ),
          SLIDER_CLOSED_HEIGHT,
        );
        if (sliderHeight.value > sliderHeightInitiaValue.value) {
          movingDown.value = true;
        } else {
          movingDown.value = false;
        }
      })
      .onEnd(() => {
        if (sliderHeight.value <= ICON_DISPLAY_HEIGHT) {
          if (movingDown.value) {
            moveSliderIntermediateOpen();
          } else {
            moveSliderCompleteClosed();
          }
        } else {
          if (movingDown.value) {
            if (sliderHeight.value > ICON_DISPLAY_HEIGHT + THRESHOLD_OPEN) {
              moveSliderCompleteOpen();
            } else {
              moveSliderIntermediateOpen();
            }
          } else {
            if (sliderHeight.value < MAX_SLIDER_HEIGHT - THRESHOLD_CLOSE) {
              moveSliderIntermediateOpen();
            } else {
              moveSliderCompleteOpen();
            }
          }
        }
      })
      .onFinalize(() => {
        hasStarted.value = false;
      });

    // Expose the moveSliderIntermediateOpen function
    useImperativeHandle(ref, () => ({
      moveSliderIntermediateOpen,
    }));

    return (
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.container,
            animatedStyleHeight,
            {
              backgroundColor:
                themeValue === 'dark'
                  ? Colors.primary.surface
                  : Colors.primary.surface2,
            },
          ]}>
          <View
            style={StyleSheet.compose(styles.slider, {
              backgroundColor:
                themeValue === 'dark'
                  ? Colors.primary.surface
                  : Colors.primary.surface2,
            })}>
            {sliderOpen ? (
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.xs}
                fontType={FontType.rg}
                allowFontScaling={false}
                style={{marginBottom: 4}}>
                To close this toolbar, drag the slider up
              </NumberlessText>
            ) : (
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.xs}
                fontType={FontType.rg}
                allowFontScaling={false}
                style={{marginBottom: 4}}>
                Drag this slider down to customize permissions
              </NumberlessText>
            )}
            <NotchDown />
          </View>
          {permissions && permissionsId && (
            <View style={styles.permissionsParent}>
              <Animated.View
                style={[
                  styles.minimizedPermissionBar,
                  animatedStylePermissionIcons,
                  {
                    backgroundColor:
                      themeValue === 'dark'
                        ? Colors.primary.surface
                        : Colors.primary.surface2,
                  },
                ]}>
                <PermissionIcons
                  chatId={chatId}
                  permissions={permissions}
                  permissionsId={permissionsId}
                  setPermissions={setPermissions}
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.permissionCards,
                  animatedStyle,
                  {
                    backgroundColor:
                      themeValue === 'dark'
                        ? Colors.primary.surface
                        : Colors.primary.surface2,
                  },
                ]}>
                <ContactSettingsCard
                  chatId={chatId}
                  chatName={chatName}
                  permissions={permissions}
                  permissionsId={permissionsId}
                  setPermissions={setPermissions}
                />
                <NewChatSettingsCard
                  chatId={chatId}
                  permissions={permissions}
                  permissionsId={permissionsId}
                  setPermissions={setPermissions}
                  showDissapearingMessagesOption={true}
                />
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    );
  },
);

const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      width: screen.width,
      justifyContent: 'flex-end',
      alignItems: 'center',
      overflow: 'hidden',
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
    },
    slider: {
      width: screen.width,
      height: SLIDER_HEIGHT,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 4,
    },
    notch: {
      width: 40,
      height: 4,
      borderRadius: 8,
      backgroundColor: colors.text.subtitle,
    },
    sliderText: {
      width: screen.width,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    permissionsParent: {
      width: screen.width,
      height: PERMISSIONS_OPEN_HEIGHT + PERMISSION_BAR_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'absolute',
      bottom: SLIDER_HEIGHT - SLIDER_EXCESS_HEIGHT,
    },
    minimizedPermissionBar: {
      width: screen.width,
      height: PERMISSION_BAR_HEIGHT,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    permissionCards: {
      width: screen.width,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: PERMISSIONS_OPEN_HEIGHT,
      bottom: PERMISSION_BAR_HEIGHT + SLIDER_EXCESS_HEIGHT,
      position: 'absolute',
    },
  });
