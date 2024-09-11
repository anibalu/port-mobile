import React, {useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  ICON_DISPLAY_HEIGHT,
  MAX_SLIDER_HEIGHT,
  PERMISSION_BAR_HEIGHT,
  PERMISSIONS_OPEN_HEIGHT,
  SLIDER_CLOSED_HEIGHT,
  SLIDER_EXCESS_HEIGHT,
  SLIDER_HEIGHT,
  THRESHOLD_CLOSE,
  THRESHOLD_OPEN,
  useChatContext,
} from '@screens/GroupChat/ChatContext';
import {useTheme} from 'src/context/ThemeContext';
import ChatSettingsCardGroup from '@components/Reusable/PermissionCards/ChatSettingsCardGroup';
import AdvanceSettingsCardGroup from '@components/Reusable/PermissionCards/AdvanceSettingsCardGroup';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PermissionIconsGroup from '@components/PermissionIconsGroup';

export function ChatTopBarWithAccessControls() {
  const {themeValue} = useTheme();
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const {
    chatId,
    permissions,
    setPermissions,
    permissionsId,
    hasStarted,
    isScreenClickable,
    movingDown,
    sliderHeight,
    sliderHeightInitiaValue,
    permissionCardHeight,
    permissionIconHeight,
    moveSliderCompleteClosed,
    moveSliderCompleteOpen,
    moveSliderIntermediateOpen,
  } = useChatContext();

  const animatedStyleHeight = useAnimatedStyle(() => {
    return {
      height: sliderHeight.value,
    };
  });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: permissionCardHeight.value}],
    };
  });
  const animatedStylePermissionIcons = useAnimatedStyle(() => {
    return {
      transform: [{translateY: permissionIconHeight.value}],
    };
  });

  useMemo(() => {
    if (permissions) {
      moveSliderIntermediateOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

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

  const [sliderOpen, setSliderOpen] = useState<boolean>(true);
  useAnimatedReaction(
    () => isScreenClickable.value,
    value => {
      runOnJS(setSliderOpen)(value ? false : true);
    },
  );
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
          {!sliderOpen && (
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              allowFontScaling={false}
              style={{marginBottom: 4}}>
              Drag this slider down to edit permissions
            </NumberlessText>
          )}
          <View style={styles.notch} />
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
              <PermissionIconsGroup
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
              <ChatSettingsCardGroup
                chatId={chatId}
                permissions={permissions}
                permissionsId={permissionsId}
                setPermissions={setPermissions}
                showDissapearingMessagesOption={true}
              />
              <AdvanceSettingsCardGroup
                chatId={chatId}
                permissions={permissions}
                permissionsId={permissionsId}
                setPermissions={setPermissions}
                heading={'Allow members in this group to'}
              />
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

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
