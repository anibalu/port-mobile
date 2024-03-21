import Delete from '@assets/icons/DeleteIcon.svg';
import Copy from '@assets/icons/copy.svg';
import Forward from '@assets/icons/forward.svg';
import Reply from '@assets/icons/reply.svg';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortColors, isIOS} from '@components/ComponentUtils';

import {
  cleanDeleteGroupMessage,
  cleanDeleteMessage,
  getGroupMessage,
  getMessage,
} from '@utils/Storage/messages';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import PopupBottomsheet from '@components/Reusable/BottomSheets/PopupBottomsheet';

/**
 * Renders action bar based on messages that are selected
 * @param chatId,
 * @param selectedMessages, messages selected
 * @param setReplyTo, message being replied to (only useful if one message is selected)
 * @param postDelete,
 * @param onCopy,
 * @param onForward,
 * @returns {ReactNode} action bar that sits above the message bar
 */
export function MessageActionsBar({
  chatId,
  selectedMessages,
  setReplyTo,
  postDelete,
  onCopy,
  onForward,
  isGroup,
  isSharedMedia,
  isDisconnected = false,
}: {
  chatId: string;
  selectedMessages: string[];
  setReplyTo: any;
  postDelete: any;
  onCopy: any;
  isGroup: boolean;
  onForward: any;
  isSharedMedia?: boolean;
  isDisconnected?: boolean;
}): ReactNode {
  const performReply = async (): Promise<void> => {
    setReplyTo(
      isGroup
        ? await getGroupMessage(chatId, selectedMessages[0])
        : await getMessage(chatId, selectedMessages[0]),
    );
  };
  const performDelete = async (): Promise<void> => {
    if (isGroup) {
      for (const msg of selectedMessages) {
        await cleanDeleteGroupMessage(chatId, msg);
      }
      postDelete(selectedMessages);
      setOpenDeleteModal(false);
    } else {
      for (const msg of selectedMessages) {
        await cleanDeleteMessage(chatId, msg, true);
      }
      postDelete(selectedMessages);
      setOpenDeleteModal(false);
    }
  };

  const determineModalDisplay = async () => {
    setOpenDeleteModal(true);
    for (const msg of selectedMessages) {
      const message = await getMessage(chatId, msg);
      //If sender is false for all selected, we can then allow the messsages to be deleted for all
      if (!message?.sender) {
        return;
      }
    }
    setShowDeleteForEveryone(true);
  };

  const performGlobalDelete = async (): Promise<void> => {
    for (const msg of selectedMessages) {
      const sender = new SendMessage(chatId, ContentType.deleted, {
        messageIdToDelete: msg,
      });
      await sender.send();
    }
    postDelete(selectedMessages);
    setOpenDeleteModal(false);
  };

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [showDeleteForEveryone, setShowDeleteForEveryone] = useState(false);

  return (
    <View
      style={
        isIOS
          ? {
              ...styles.parentContainer,
              paddingBottom: 20,
              marginBottom: -20,
              paddingHorizontal: isDisconnected ? 45 : 10,
            }
          : {
              ...styles.parentContainer,
              paddingHorizontal: isDisconnected ? 45 : 10,
            }
      }>
      <PopupBottomsheet
        showMore={showDeleteForEveryone}
        openModal={openDeleteModal}
        title={'Delete message'}
        topButton={
          showDeleteForEveryone ? 'Delete for everyone' : 'Delete for me'
        }
        topButtonFunction={
          showDeleteForEveryone ? performGlobalDelete : performDelete
        }
        middleButton="Delete for me"
        middleButtonFunction={performDelete}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
      />
      {selectedMessages.length > 1 ? (
        <View style={styles.multiSelectedContainer}>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onCopy}>
              <Copy />
            </Pressable>
          </View>
          {!isDisconnected && (
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={determineModalDisplay}>
                <Delete />
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.singleSelectedContainer}>
          {!isSharedMedia && !isDisconnected && (
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={performReply}>
                <Reply />
              </Pressable>
            </View>
          )}

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
          </View>
          {!isSharedMedia && (
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onCopy}>
                <Copy />
              </Pressable>
            </View>
          )}

          {!isDisconnected && (
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={determineModalDisplay}>
                <Delete />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    paddingBottom: 10,
    backgroundColor: PortColors.primary.white,
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  optionBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 12,
  },
});
