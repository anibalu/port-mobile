import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Swipeable} from 'react-native-gesture-handler';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';

import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
// import LabelChip from '@components/Reusable/Chip/LabelChip';
import CheckBox from '@components/Reusable/MultiSelectMembers/CheckBox';

import {DEFAULT_AVATAR} from '@configs/constants';

import {ContentType} from '@utils/Messaging/interfaces';
import {toggleRead} from '@utils/Storage/connections';
import {ChatType, ConnectionInfo} from '@utils/Storage/DBCalls/connections';

import AddFolderViolet from '@assets/icons/AddFolderViolet.svg';
import ShareContactGreen from '@assets/icons/ShareContactGreen.svg';

import {useTheme} from 'src/context/ThemeContext';

import DisplayStatus from './DisplayStatus';
import RenderText from './RenderText';
import RenderTimestamp from './RenderTimestamp';


export interface ChatTileProps extends ConnectionInfo {
  expired?: boolean;
  isReadPort?: boolean;
}

export interface CompleteChatTileProps extends ChatTileProps {
  setSelectedProps: (props: ChatTileProps | null) => void;
  selectedConnections: ChatTileProps[];
  setSelectedConnections: (connections: ChatTileProps[]) => void;
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  setMoveToFolderSheet: (visible: boolean) => void;
  setIsChatActionBarVisible: (visible: boolean) => void;
  setContactShareParams: (params: any) => void;
}

const CHECKBOX_WIDTH = 40;

function ChatTile(initialProps: CompleteChatTileProps): ReactNode {
  const [props, setProps] = useState(initialProps);
  useMemo(() => {
    setProps(initialProps);
  }, [initialProps]);

  const isSelected = props.selectedConnections?.some(
    x => x.chatId === props.chatId,
  );
  const navigation = useNavigation<any>();
  //handles navigation to a chat screen and toggles chat to read.
  const onClick = (): void => {
    if (props.isReadPort) {
      if (!props.selectionMode) {
        props.setSelectedProps(props);
      }
    } else {
      if (isSelected) {
        unselect();
      } else if (props.selectionMode) {
        select();
      } else {
        toggleRead(props.chatId);
        setProps({...props, newMessageCount: 0});
        if (props.connectionType === ChatType.group) {
          // Push the right screen onto the stack so we can navigate back here when we go back
          navigation.push('GroupChat', {
            chatId: props.chatId,
            isConnected: !props.disconnected,
            profileUri: props.pathToDisplayPic || DEFAULT_AVATAR,
            name: props.name,
          });
        } else {
          navigation.push('DirectChat', {
            chatId: props.chatId,
            isConnected: !props.disconnected,
            profileUri: props.pathToDisplayPic || DEFAULT_AVATAR,
            name: props.name,
            isAuthenticated: props.authenticated,
          });
        }
      }
    }
  };

  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const styles = styling(Colors, themeValue);

  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };
  const select = () => {
    props.setSelectedConnections([...props.selectedConnections, props]);
  };
  const unselect = () => {
    const newSelectedConnections = props.selectedConnections.filter(
      x => x.chatId !== props.chatId,
    );
    props.setSelectedConnections(newSelectedConnections);
    if (newSelectedConnections.length === 0) {
      props.setSelectionMode(false);
      props.setIsChatActionBarVisible(false);
    }
  };
  const selectWithHaptic = () => {
    if (props.isReadPort) {
      return;
    }
    if (!isSelected) {
      props.setSelectedConnections([...props.selectedConnections, props]);
      RNReactNativeHapticFeedback.trigger('impactMedium', options);
      props.setSelectionMode(true);
      props.setIsChatActionBarVisible(true);
    }
  };

  const [selectionScale] = useState(new Animated.Value(0));
  useEffect(() => {
    if (props.selectionMode) {
      Animated.timing(selectionScale, {
        toValue: 1,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(selectionScale, {
        toValue: 0,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectionMode]);

  const swipableRef = useRef(null);

  const renderLeftActions = () => {
    return (
      <View style={{width: 80}}>
        <View
          style={{
            alignItems: 'stretch',
            overflow: 'hidden',
            flexDirection: 'row',
            width: 80,
            flex: 1,
          }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              props.setSelectedConnections([props]);
              props.setIsChatActionBarVisible(true);
              props.setMoveToFolderSheet(true);
            }}
            style={{
              flexDirection: 'column',
              width: 80,
              flex: 1,
              backgroundColor: Colors.lowAccentColors.violet,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Animated.View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                gap: PortSpacing.tertiary.uniform,
              }}>
              <AddFolderViolet height={24} width={24} />
              <NumberlessText
                style={{textAlign: 'center'}}
                fontSizeType={FontSizeType.s}
                fontType={FontType.sb}
                textColor={Colors.primary.violet}>
                {'Move to\nfolder'}
              </NumberlessText>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderRightActions = () => {
    return (
      <View
        style={{
          width: 80,
        }}>
        <View
          style={{
            alignItems: 'stretch',
            overflow: 'hidden',
            justifyContent: 'flex-end',
            flexDirection: 'row',
            flex: 1,
          }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (props.connectionType === ChatType.direct) {
                props.setContactShareParams({
                  name: props.name,
                  pairHash: props.pairHash,
                });
              }
            }}
            style={{
              flexDirection: 'column',
              width: 80,
              gap: PortSpacing.tertiary.uniform,
              backgroundColor: Colors.lowAccentColors.darkGreen,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Animated.View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                gap: PortSpacing.tertiary.uniform,
              }}>
              <ShareContactGreen height={24} width={24} />
              <NumberlessText
                style={{textAlign: 'center'}}
                fontSizeType={FontSizeType.s}
                fontType={FontType.sb}
                textColor={Colors.primary.darkGreen}>
                {'Share\ncontact'}
              </NumberlessText>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  if (props.isReadPort) {
    return (
      <View style={{...styles.container, justifyContent: 'flex-end'}}>
        <View style={styles.container}>
          <Animated.View
            style={{
              flex: 1,
              overflow: 'hidden',
              marginLeft: selectionScale.interpolate({
                inputRange: [0, 1],
                outputRange: [0, CHECKBOX_WIDTH],
              }),
            }}>
            <Pressable
              style={styles.tile}
              onPress={onClick}
              onLongPress={selectWithHaptic}
              pointerEvents="box-only">
              <View style={styles.avatarArea}>
                <AvatarBox
                  profileUri={props.pathToDisplayPic}
                  avatarSize="s+"
                />
              </View>
              <View style={styles.nonAvatarArea}>
                <View style={styles.nameAndTimestamp}>
                  <View style={styles.nameContainer}>
                    <NumberlessText
                      textColor={Colors.primary.mainelements}
                      style={{flexShrink: 1}}
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      fontType={FontType.md}
                      fontSizeType={FontSizeType.l}>
                      {props.name || 'New contact'}
                    </NumberlessText>
                  </View>
                  <RenderTimestamp props={props} />
                </View>
                <View style={styles.textAndStatus}>
                  {
                    //if not authenticated yet, could be a read port
                    props.expired ? (
                      <NumberlessText
                        ellipsizeMode="tail"
                        numberOfLines={2}
                        fontType={FontType.rg}
                        style={{
                          flex: 1,
                        }}
                        fontSizeType={FontSizeType.m}
                        textColor={PortColors.primary.red.error}>
                        Failed to add this contact. You used an expired Port.
                      </NumberlessText>
                    ) : (
                      <NumberlessText
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        fontType={FontType.rg}
                        style={{
                          flex: 1,
                        }}
                        fontSizeType={FontSizeType.m}
                        textColor={Colors.button.accent}>
                        {props.connectionType === ChatType.group
                          ? 'Adding new group...'
                          : 'Adding new contact...'}
                      </NumberlessText>
                    )
                  }
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  } else {
    return (
      <Swipeable
        ref={swipableRef}
        enabled={!props.selectionMode}
        friction={2}
        leftThreshold={60}
        rightThreshold={100}
        overshootFriction={1}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}>
        <Animated.View
          style={{...styles.container, justifyContent: 'flex-end'}}>
          <View style={styles.container}>
            {props.selectionMode && (
              <Pressable
                style={StyleSheet.compose(styles.checkboxContainer, {
                  backgroundColor: isSelected
                    ? Colors.primary.accentOverlay
                    : 'transparent',
                })}
                onPress={() => {
                  if (!isSelected) {
                    select();
                  } else {
                    unselect();
                  }
                }}>
                <CheckBox value={isSelected} />
              </Pressable>
            )}
            <Animated.View
              style={{
                flex: 1,
                overflow: 'hidden',
                marginLeft: selectionScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, CHECKBOX_WIDTH],
                }),
              }}>
              <Pressable
                style={styles.tile}
                onPress={onClick}
                onLongPress={selectWithHaptic}
                pointerEvents="box-only">
                <View style={styles.avatarArea}>
                  <AvatarBox
                    profileUri={props.pathToDisplayPic}
                    avatarSize="s+"
                  />
                </View>
                <View style={styles.nonAvatarArea}>
                  <View style={styles.nameAndTimestamp}>
                    <View style={styles.nameContainer}>
                      <NumberlessText
                        textColor={Colors.primary.mainelements}
                        style={{flexShrink: 1}}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        fontType={FontType.rg}
                        fontSizeType={FontSizeType.l}>
                        {props.name || 'New contact'}
                      </NumberlessText>
                    </View>
                    <RenderTimestamp props={props} />
                  </View>
                  <View style={styles.textAndStatus}>
                    {props.disconnected ? (
                      <NumberlessText
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        fontType={FontType.rg}
                        style={{
                          flex: 1,
                        }}
                        fontSizeType={FontSizeType.m}
                        textColor={PortColors.primary.red.error}>
                        Disconnected
                      </NumberlessText>
                    ) : props.recentMessageType === ContentType.newChat ? (
                      <NumberlessText
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        fontType={FontType.rg}
                        style={{
                          flex: 1,
                        }}
                        fontSizeType={FontSizeType.m}
                        textColor={Colors.button.accent}>
                        {props.connectionType === ChatType.group
                          ? 'New group'
                          : 'New connection'}
                      </NumberlessText>
                    ) : (
                      <>
                        <RenderText newMessage={props} />
                        <DisplayStatus newMessage={props} />
                      </>
                    )}
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </Swipeable>
    );
  }
}

const styling = (colors: any, themeValue: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: screen.width,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
    },
    checkboxContainer: {
      height: '100%',
      paddingLeft: 18,
      alignItems: 'flex-start',
      justifyContent: 'center',
      position: 'absolute',
      left: 0,
      flex: 1,
      width: screen.width,
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginHorizontal: PortSpacing.tertiary.uniform,
      paddingTop: PortSpacing.secondary.uniform,
      overflow: 'hidden',
    },
    selectionOverlaySelectionMode: {
      position: 'absolute',
      flex: 1,
      right: PortSpacing.tertiary.uniform,
      height: '100%',
      backgroundColor: colors.primary.accentOverlay,
    },
    avatarArea: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: PortSpacing.tertiary.uniform,
      alignSelf: 'center',
      paddingBottom: PortSpacing.medium.uniform,
    },
    nonAvatarArea: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      borderBottomColor: colors.primary.stroke,
      borderBottomWidth: 0.25,
      flex: 1,
      paddingBottom: PortSpacing.medium.uniform,
    },
    nameAndTimestamp: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    textAndStatus: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
    },
    nameContainer: {
      overflow: 'hidden',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: PortSpacing.tertiary.right,
    },
    labelWrapper: {
      flexBasis: 45,
      flexGrow: 1,
      alignItems: 'flex-start',
    },
    new: {
      backgroundColor: colors.primary.accent,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      minWidth: 20,
    },
  });

export default ChatTile;
