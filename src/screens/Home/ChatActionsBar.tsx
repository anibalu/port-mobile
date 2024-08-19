import Delete from '@assets/icons/DeleteIcon.svg';
import React, {ReactNode, useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {BOTTOMBAR_HEIGHT} from '@configs/constants';
import MoveToFolder from './MoveToFolderBottomsheet';
import {useBottomNavContext} from 'src/context/BottomNavContext';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import DirectChat from '@utils/DirectChats/DirectChat';
import {ToastType, useToast} from 'src/context/ToastContext';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {loadHomeScreenConnections} from '@utils/Connections/onRefresh';

export function ChatActionsBar(): ReactNode {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const {
    setSelectionMode,
    moveToFolderSheet,
    setMoveToFolderSheet,
    confirmSheet,
    setConfirmSheet,
    setIsChatActionBarVisible,
    selectedConnections,
    setSelectedConnections,
    setConnections,
    setTotalUnreadCount,
  } = useBottomNavContext();

  const svgArray = [
    {
      assetName: 'AddFolder',
      light: require('@assets/light/icons/AddFolder.svg').default,
      dark: require('@assets/dark/icons/AddFolder.svg').default,
    },
    {
      assetName: 'Disconnect',
      light: require('@assets/light/icons/Disconnect.svg').default,
      dark: require('@assets/dark/icons/Disconnect.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const AddFolder = results.AddFolder;
  const Disconnect = results.Disconnect;

  const wording = useMemo(() => {
    const chatPlural = selectedConnections.length > 1 ? 'chats' : 'chat';
    const allDisconnected = selectedConnections.every(
      connection => connection.disconnected,
    );
    const containsDisconnected = selectedConnections.some(
      connection => connection.disconnected,
    );
    const action = allDisconnected
      ? 'Delete'
      : containsDisconnected
      ? 'Disconnect/Delete'
      : 'Disconnect';
    return {
      action,
      chatPlural,
      allDisconnected,
      containsDisconnected,
    };
  }, [selectedConnections]);

  const {showToast} = useToast();

  const disconnectOrDeleteSelectedConnections = async () => {
    try {
      await Promise.all(
        selectedConnections.map(async connection => {
          if (connection.connectionType === ChatType.direct) {
            const chatHandler = new DirectChat(connection.chatId);
            if (connection.disconnected) {
              await chatHandler.delete();
            } else {
              await chatHandler.disconnect();
            }
          }
          const output = await loadHomeScreenConnections();
          setConnections(output.connections);
          setTotalUnreadCount(output.unread);
        }),
      );
    } catch (error) {
      console.error(
        'Error disconnecting chat. Please check your network connection',
        error,
      );
      showToast(
        'Error performing action. Please check your network connection',
        ToastType.error,
      );
    } finally {
      setSelectedConnections([]);
      setSelectionMode(false);
      setIsChatActionBarVisible(false);
    }
  };

  return (
    <>
      {selectedConnections.length > 0 && (
        <View style={styles.parentContainer}>
          <View style={styles.singleSelectedContainer}>
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={() => setMoveToFolderSheet(true)}>
                <AddFolder height={20} width={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={Colors.text.primary}>
                  Move to a folder
                </NumberlessText>
              </Pressable>
            </View>
            {wording.allDisconnected ? (
              <View style={styles.optionContainer}>
                <Pressable
                  style={styles.optionBox}
                  onPress={() => setConfirmSheet(true)}>
                  <Delete width={20} height={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={Colors.primary.red}>
                    {wording.action + ' ' + wording.chatPlural}
                  </NumberlessText>
                </Pressable>
              </View>
            ) : wording.containsDisconnected ? (
              <View style={styles.optionContainer}>
                <Pressable
                  style={styles.optionBox}
                  onPress={() => setConfirmSheet(true)}>
                  <Disconnect width={20} height={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={Colors.primary.red}>
                    {wording.action + ' ' + wording.chatPlural}
                  </NumberlessText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.optionContainer}>
                <Pressable
                  style={styles.optionBox}
                  onPress={() => setConfirmSheet(true)}>
                  <Disconnect width={20} height={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={Colors.primary.red}>
                    {wording.action + ' ' + wording.chatPlural}
                  </NumberlessText>
                </Pressable>
              </View>
            )}
          </View>
          <MoveToFolder
            visible={moveToFolderSheet}
            onClose={() => {
              setSelectedConnections([]);
              setSelectionMode(false);
              setIsChatActionBarVisible(false);
              setMoveToFolderSheet(false);
            }}
            buttonText={'Move chats'}
            buttonColor="b"
          />
          <ConfirmationBottomSheet
            visible={confirmSheet}
            onClose={() => setConfirmSheet(false)}
            onConfirm={async () => {
              await disconnectOrDeleteSelectedConnections();
            }}
            title={`Are you sure you want to ${
              wording.action + ' ' + wording.chatPlural
            } ?`}
            description={
              'Disconnecting a chat will prevent further messaging but save chat history. Deleting a chat will delete all associated chat data.'
            }
            buttonText={wording.action + ' ' + wording.chatPlural}
            buttonColor="r"
          />
        </View>
      )}
    </>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    parentContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: BOTTOMBAR_HEIGHT,
      backgroundColor: colors.primary.surface,
      borderTopColor: colors.primary.stroke,
      borderTopWidth: 0.5,
    },
    singleSelectedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    multiSelectedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    optionContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionBox: {
      height: 55,
      gap: PortSpacing.tertiary.uniform,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },
    optionText: {
      fontSize: 12,
    },
  });
