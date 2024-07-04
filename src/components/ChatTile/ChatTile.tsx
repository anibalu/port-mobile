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
import {ChatType, ConnectionInfo} from '@utils/Connections/interfaces';
import DirectChat from '@utils/DirectChats/DirectChat';
import {ContentType} from '@utils/Messaging/interfaces';
import {fetchSuperport} from '@utils/Ports';
import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, View} from 'react-native';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import DisplayStatus from './DisplayStatus';
import RenderText from './RenderText';
import RenderTimestamp from './RenderTimestamp';

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

  const [superportTag, setSuperportTag] = useState<string>('');
  const [contactshareTag, setContactShareTag] = useState<string>('');

  const Colors = DynamicColors();
  const styles = styling(Colors);

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
      console.log('error saving contact share info message:  ', error);
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
        // eslint-disable-next-line react-native/no-inline-styles
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
                          <RenderText newMessage={props} />
                          <DisplayStatus newMessage={props} />
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
