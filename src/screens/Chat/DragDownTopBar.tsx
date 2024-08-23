import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import DirectChat from '@utils/DirectChats/DirectChat';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import getPermissionIcon from '@components/getPermissionIcon';
import {useTheme} from 'src/context/ThemeContext';
import ChatSettingsCard from '@components/Reusable/PermissionCards/ChatSettingsCard';
import AdvanceSettingsCard from '@components/Reusable/PermissionCards/AdvanceSettingsCard';

const TOP_BAR_HEIGHT = 56;
const PERMISSION_BAR_HEIGHT =
  Math.floor((screen.width - 32) / (20 + 12)) > 7 ? 52 : 88;
const SLIDER_HEIGHT = 12;
const PERMISSIONS_OPEN_HEIGHT = 504;
const THRESHOLD_OPEN = 150;

export function ChatTopBarWithAccessControls() {
  const {chatId} = useChatContext();
  const {themeValue} = useTheme();
  const [permissionsArray, setPermissionsArray] =
    useState<PermissionsStrict | null>(null);
  const [permissionsId, setPermissionsId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const chat = new DirectChat(chatId);
        const chatData = await chat.getChatData();
        setPermissionsId(chatData.permissionsId);
        const permissions: PermissionsStrict = await chat.getPermissions();
        setPermissionsArray(permissions);
      } catch (error) {
        setPermissionsArray(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Colors = DynamicColors();
  const styles = styling(Colors);
  const hasStarted = useSharedValue(false);
  const heightInitiaValue = useSharedValue(
    TOP_BAR_HEIGHT + PERMISSION_BAR_HEIGHT + SLIDER_HEIGHT,
  );
  const height = useSharedValue(
    TOP_BAR_HEIGHT + PERMISSION_BAR_HEIGHT + SLIDER_HEIGHT,
  );
  const animatedStyleHeight = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });
  const translateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });
  const pan = Gesture.Pan()
    .onBegin(() => {
      hasStarted.value = true;
    })
    .onUpdate(e => {
      height.value = Math.min(
        e.translationY + heightInitiaValue.value,
        PERMISSIONS_OPEN_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT,
      );
    })
    .onEnd(() => {
      if (
        height.value <
        PERMISSION_BAR_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT
      ) {
        height.value = withTiming(SLIDER_HEIGHT + TOP_BAR_HEIGHT, {
          duration: 500,
        });
        heightInitiaValue.value = SLIDER_HEIGHT + TOP_BAR_HEIGHT;
        translateY.value = withTiming(0, {duration: 500});
      } else {
        if (
          height.value >
          PERMISSION_BAR_HEIGHT +
            SLIDER_HEIGHT +
            TOP_BAR_HEIGHT +
            THRESHOLD_OPEN
        ) {
          height.value = withTiming(
            PERMISSIONS_OPEN_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT,
            {duration: 500},
          );
          heightInitiaValue.value =
            PERMISSIONS_OPEN_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT;
          translateY.value = withTiming(PERMISSION_BAR_HEIGHT, {
            duration: 500,
          });
        } else {
          height.value = withTiming(
            PERMISSION_BAR_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT,
            {duration: 500},
          );
          heightInitiaValue.value =
            PERMISSION_BAR_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT;
          translateY.value = withTiming(0, {duration: 500});
        }
      }
    })
    .onFinalize(() => {
      hasStarted.value = false;
    });

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
        <View style={styles.parent}>
          {permissionsArray && permissionsId ? (
            <View style={styles.permissionsParent}>
              <View style={styles.minimizedPermissionBar}>
                {Object.entries(permissionsArray).map(permission => {
                  const PermissionIcon = getPermissionIcon([
                    permission[0],
                    permission[1],
                    themeValue,
                  ]);
                  return (
                    <View
                      key={permission[0]}
                      style={{
                        flexDirection: 'row',
                        gap: PortSpacing.tertiary.uniform,
                        alignItems: 'center',
                      }}>
                      <View>{PermissionIcon}</View>
                    </View>
                  );
                })}
              </View>
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
                <ChatSettingsCard
                  chatId={chatId}
                  permissions={permissionsArray}
                  permissionsId={permissionsId}
                  setPermissions={setPermissionsArray}
                  showDissapearingMessagesOption={true}
                />
                <AdvanceSettingsCard
                  chatId={chatId}
                  permissions={permissionsArray}
                  permissionsId={permissionsId}
                  setPermissions={setPermissionsArray}
                  heading={'Allow this contact to'}
                />
              </Animated.View>
            </View>
          ) : (
            <View
              style={{
                width: '100%',
                height: PERMISSIONS_OPEN_HEIGHT + PERMISSION_BAR_HEIGHT,
                paddingBottom: PortSpacing.medium.uniform,
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <ActivityIndicator color={Colors.text.subtitle} />
            </View>
          )}
        </View>
        <View
          style={StyleSheet.compose(styles.slider, {
            backgroundColor:
              themeValue === 'dark'
                ? Colors.primary.surface
                : Colors.primary.surface2,
          })}>
          <View style={styles.notch} />
        </View>
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
    },
    slider: {
      width: '100%',
      height: SLIDER_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notch: {
      width: 40,
      height: 4,
      borderRadius: 8,
      backgroundColor: colors.text.subtitle,
    },
    sliderText: {
      width: '100%',
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    parent: {
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    permissionsParent: {
      width: '100%',
      height: PERMISSIONS_OPEN_HEIGHT + PERMISSION_BAR_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    minimizedPermissionBar: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      gap: 12,
      paddingVertical: 8,
    },
    permissionCards: {
      width: screen.width,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: PERMISSIONS_OPEN_HEIGHT,
      bottom: PERMISSION_BAR_HEIGHT,
      position: 'absolute',
    },
  });
