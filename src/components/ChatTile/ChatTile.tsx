import Failure from '@assets/icons/statusIndicators/failure.svg';
import {default as Journaled} from '@assets/icons/statusIndicators/sending.svg';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import LabelChip from '@components/Reusable/Chip/LabelChip';
import CheckBox from '@components/Reusable/MultiSelectMembers/CheckBox';
import {DEFAULT_AVATAR, defaultFolderId} from '@configs/constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {getAllFolders} from '@utils/ChatFolders';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import {getLabelByTimeDiff} from '@utils/ChatPermissions';
import {
  ChatType,
  ConnectionInfo,
  ReadStatus,
} from '@utils/Connections/interfaces';
import DirectChat from '@utils/DirectChats/DirectChat';
import {
  ContactBundleParams,
  ContentType,
  DisappearingMessageParams,
  MessageStatus,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {fetchSuperport} from '@utils/Ports';
import {getGroupMessage, getMessage} from '@utils/Storage/messages';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {getChatTileTimestamp} from '@utils/Time';
import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, View} from 'react-native';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';

export interface ChatTileProps extends ConnectionInfo {
  expired?: boolean;
  isReadPort?: boolean;
}

const AVATAR_WIDTH = 86;
const CHECKBOX_WIDTH = 40;

function ChatTile({
  props,
  setSelectedProps,
  selectedConnections,
  setSelectedConnections,
  selectionMode,
  setSelectionMode,
  selectedFolder,
}: {
  //controls display
  props: ChatTileProps;
  selectedFolder: FolderInfo;
  //responsible for passing connection information to modals
  setSelectedProps: (p: ChatTileProps | null) => void;
  //selected connections
  selectedConnections: ChatTileProps[];
  //set selected connectiosn
  setSelectedConnections: (p: ChatTileProps[]) => void;
  //whether home screen is in selection mode
  selectionMode: boolean;
  setSelectionMode: (p: boolean) => void;
}): ReactNode {
  const isSelected = selectedConnections.some(x => x.chatId === props.chatId);
  const navigation = useNavigation<any>();
  //handles navigation to a chat screen and toggles chat to read.
  const onClick = (): void => {
    if (selectionMode) {
      select();
    } else {
      // TODO stop doing this bullshit true stuff, needed for testing in sandbox for sending prior to auth
      if (!props.isReadPort) {
        navigation.navigate('DirectChat', {
          chatId: props.chatId,
          isGroupChat: props.connectionType === ChatType.group,
          isConnected: !props.disconnected,
          profileUri: props.pathToDisplayPic || DEFAULT_AVATAR,
          name: props.name,
          isAuthenticated: props.authenticated,
        });
      } else {
        setSelectedProps(props);
      }
    }
  };

  const [newMessage, setNewMessage] = useState<SavedMessageParams | null>(null);
  const [superportTag, setSuperportTag] = useState<string>('');
  const [contactshareTag, setContactShareTag] = useState<string>('');

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const getNewMessage = async (): Promise<void> => {
    if (props.latestMessageId && !props.isReadPort) {
      const msg =
        props.connectionType === ChatType.group
          ? await getGroupMessage(props.chatId, props.latestMessageId)
          : await getMessage(props.chatId, props.latestMessageId);
      setNewMessage(msg);
    }
  };
  function getSuperportDisplayName(
    id: string,
    label: string | null | undefined,
  ) {
    if (label && label !== '') {
      return label;
    } else {
      return '#' + id;
    }
  }
  async function getFromSuperportName(superportId: string) {
    try {
      const superport = await fetchSuperport(superportId);
      return `via ${getSuperportDisplayName(
        superport.superport.portId,
        superport.superport.label,
      )}`;
    } catch (error) {
      console.log('error saving superport info message: ', error);
      return '';
    }
  }

  async function getFromContactName(fromContact: string) {
    try {
      const chat = new DirectChat(fromContact);
      const chatData = await chat.getChatData();
      return `via ${chatData.name}`;
    } catch (error) {
      console.log('error saving contact share info message: ', error);
      return '';
    }
  }

  async function setTags() {
    if (props.chatId && !props.isReadPort) {
      try {
        const chat = new DirectChat(props.chatId);
        const isSuperport = await chat.didConnectUsingSuperport();
        const isContactSharing = await chat.didConnectUsingContactSharing();
        if (isSuperport) {
          setSuperportTag(await getFromSuperportName(isSuperport));
        }
        if (isContactSharing) {
          setContactShareTag(await getFromContactName(isContactSharing));
        }
      } catch (error) {
        console.log('error setting tags', error);
      }
    }
  }

  useEffect(() => {
    getNewMessage();
    setTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };
  const select = () => {
    setSelectedConnections([...selectedConnections, props]);
  };
  const unselect = () => {
    const newSelectedConnections = selectedConnections.filter(
      x => x.chatId !== props.chatId,
    );
    setSelectedConnections(newSelectedConnections);
    if (newSelectedConnections.length === 0) {
      setSelectionMode(false);
    }
  };
  const selectWithHaptic = () => {
    if (!isSelected) {
      setSelectedConnections([...selectedConnections, props]);
      RNReactNativeHapticFeedback.trigger('impactMedium', options);
      setSelectionMode(true);
    }
  };
  const [selectionScale] = useState(new Animated.Value(0));
  const [folders, setFolders] = useState<FolderInfo[]>([]);

  const findFolderNameById = (
    folderArray: FolderInfo[],
    folderId: string,
  ): string | null => {
    if (folderId === defaultFolderId) {
      return null;
    } else {
      const foundFolder = folderArray.find(
        folder => folder.folderId === folderId,
      );
      return foundFolder ? foundFolder.name : null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (selectedFolder.folderId === 'all') {
        const fetchData = async () => {
          const fetchedFolders = await getAllFolders();
          setFolders(fetchedFolders);
        };

        fetchData();
      }
    }, [selectedFolder]),
  );

  useEffect(() => {
    if (selectionMode) {
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
  }, [selectionMode]);

  return (
    <View style={styles.container}>
      {selectionMode && (
        <Pressable
          style={styles.checkboxContainer}
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
            <AvatarBox profileUri={props.pathToDisplayPic} avatarSize="s+" />
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
                {selectedFolder.folderId === 'all' &&
                  props.folderId !== defaultFolderId && (
                    <View style={styles.labelWrapper}>
                      <LabelChip
                        text={findFolderNameById(folders, props.folderId)}
                        bgColor={Colors.primary.background}
                        textColor={Colors.text.subtitle}
                      />
                    </View>
                  )}
              </View>
              <NumberlessText
                numberOfLines={1}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={Colors.primary.mediumgrey}
                style={{
                  paddingRight: PortSpacing.secondary.right,
                  paddingLeft: PortSpacing.tertiary.left,
                }}>
                {getChatTileTimestamp(props.timestamp)}
              </NumberlessText>
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
              ) : (
                <>
                  {!props.isReadPort ? (
                    <>
                      {props.recentMessageType === ContentType.newChat ? (
                        <NumberlessText
                          ellipsizeMode="tail"
                          numberOfLines={1}
                          fontType={FontType.rg}
                          style={{
                            flex: 1,
                          }}
                          fontSizeType={FontSizeType.m}
                          textColor={Colors.button.accent}>
                          {'New connection ' + superportTag + contactshareTag}
                        </NumberlessText>
                      ) : (
                        <>
                          <RenderText newMessage={newMessage} />
                          <DisplayStatus
                            readStatus={props.readStatus}
                            newMessageCount={props.newMessageCount}
                            newMessage={newMessage}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
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
                            Failed to add this contact. You used an expired
                            Port.
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
                            textColor={PortColors.text.title}>
                            Adding new contact...
                          </NumberlessText>
                        )
                      }
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
      {isSelected && (
        <Animated.View
          style={StyleSheet.compose(styles.selectionOverlaySelectionMode, {
            left: selectionScale.interpolate({
              inputRange: [0, 1],
              outputRange: [
                PortSpacing.tertiary.uniform,
                PortSpacing.tertiary.uniform + CHECKBOX_WIDTH,
              ],
            }),
          })}>
          <Pressable
            style={{flex: 1}}
            onPress={unselect}
            pointerEvents="box-only"
          />
        </Animated.View>
      )}
    </View>
  );
}

const RenderText = ({
  newMessage,
}: {
  newMessage: SavedMessageParams | undefined | null;
}) => {
  const Colors = DynamicColors();

  let text = '';
  let italic = false;
  if (newMessage && newMessage.data) {
    text = newMessage.data.text ? newMessage.data.text : '';
    if (newMessage.contentType === ContentType.image) {
      if (text === '') {
        text = '📷 image';
      } else {
        text = '📷 ' + text;
      }
    } else if (newMessage.contentType === ContentType.video) {
      if (text === '') {
        text = '🎥 video';
      } else {
        text = '🎥 ' + text;
      }
    } else if (newMessage.contentType === ContentType.file) {
      if (text === '') {
        text = '📎 file';
      } else {
        text = '📎 ' + text;
      }
    } else if (newMessage.contentType === ContentType.audioRecording) {
      if (text === '') {
        text = '🔊 audio';
      } else {
        text = '🔊 ' + text;
      }
    } else if (newMessage.contentType === ContentType.contactBundle) {
      text = '👤 ' + (newMessage.data as ContactBundleParams).bundle.name;
    } else if (newMessage.contentType === ContentType.disappearingMessages) {
      const turnedOff =
        getLabelByTimeDiff(
          (newMessage.data as DisappearingMessageParams).timeoutValue,
        ) === 'Off';
      text = turnedOff
        ? 'Disappearing messages have been turned OFF'
        : 'Disappearing messages have been turned ON';
      italic = true;
    }
    return (
      <NumberlessText
        ellipsizeMode="tail"
        numberOfLines={2}
        style={{flex: 1}}
        fontType={italic ? FontType.it : FontType.rg}
        fontSizeType={FontSizeType.m}
        textColor={Colors.text.subtitle}>
        {text}
      </NumberlessText>
    );
  }
  return (
    <View style={{flexDirection: 'row', flex: 1}}>
      <NumberlessText
        ellipsizeMode="tail"
        numberOfLines={2}
        style={{width: screen.width - 160}}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}
        textColor={Colors.text.subtitle}>
        {text}
      </NumberlessText>
    </View>
  );
};

function DisplayStatus({
  readStatus,
  newMessageCount,
  newMessage,
}: {
  readStatus: ReadStatus;
  newMessageCount: number;
  newMessage: SavedMessageParams | undefined | null;
}): ReactNode {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'Read',
      light: require('@assets/light/icons/Read.svg').default,
      dark: require('@assets/dark/icons/PurpleRead.svg').default,
    },
    {
      assetName: 'Delivered',
      light: require('@assets/light/icons/Received.svg').default,
      dark: require('@assets/dark/icons/GreyReceived.svg').default,
    },
    {
      assetName: 'Sent',
      light: require('@assets/light/icons/Sent.svg').default,
      dark: require('@assets/icons/statusIndicators/sent.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Read = results.Read;
  const Sent = results.Sent;
  const Delivered = results.Delivered;
  const MessageStatusIndicator = () => {
    if (newMessage && newMessage.sender) {
      if (!newMessage.messageStatus) {
        return <Delivered />;
      }
      switch (newMessage.messageStatus) {
        case MessageStatus.journaled:
          return <Journaled />;
        case MessageStatus.read:
          return <Read />;
        case MessageStatus.sent:
          return <Sent />;
        case MessageStatus.failed:
          return <Failure />;
        default:
          return <></>;
      }
    }
    if (newMessage && !newMessage.sender) {
      return <></>;
    }
    return <></>;
  };
  if (readStatus === ReadStatus.new) {
    if (newMessageCount > 0) {
      return (
        <View
          style={{
            paddingRight: PortSpacing.secondary.right,
            paddingTop: 4,
            paddingLeft: PortSpacing.tertiary.left,
          }}>
          <View style={styles.new}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={PortColors.text.primaryWhite}
              numberOfLines={1}
              allowFontScaling={false}>
              {displayNumber(newMessageCount)}
            </NumberlessText>
          </View>
        </View>
      );
    } else {
      return (
        <View
          style={{
            paddingRight: PortSpacing.secondary.right,
            paddingTop: 4,
          }}
        />
      );
    }
  } else {
    return (
      <View
        style={{
          paddingRight: PortSpacing.secondary.right,
          paddingTop: 4,
          paddingLeft: PortSpacing.tertiary.left,
        }}>
        <View>
          <MessageStatusIndicator />
        </View>
      </View>
    );
  }
}

//returns display string based on new message count
function displayNumber(newMsgCount: number): string {
  if (newMsgCount > 999) {
    return '999+';
  }
  return newMsgCount.toString();
}

const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: screen.width,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxContainer: {
      height: 54,
      paddingLeft: 18,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      left: 0,
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginHorizontal: PortSpacing.tertiary.uniform,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      backgroundColor: colors.primary.surface,
      paddingVertical: PortSpacing.secondary.uniform,
      overflow: 'hidden',
    },
    selectionOverlaySelectionMode: {
      position: 'absolute',
      flex: 1,
      right: PortSpacing.tertiary.uniform,
      height: '100%',
      backgroundColor: colors.primary.accentOverlay,
      borderWidth: 0.5,
      borderColor: colors.primary.accent,
      borderRadius: 16,
    },
    avatarArea: {
      justifyContent: 'center',
      alignItems: 'center',
      width: AVATAR_WIDTH,
      alignSelf: 'center',
    },
    nonAvatarArea: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
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
