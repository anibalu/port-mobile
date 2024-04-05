import Delete from '@assets/icons/DeleteIcon.svg';
import Copy from '@assets/icons/copy.svg';
import Forward from '@assets/icons/ForwardNew.svg';
import Reply from '@assets/icons/ReplyNew.svg';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';

import {
  cleanDeleteGroupMessage,
  cleanDeleteMessage,
  getGroupMessage,
  getMessage,
} from '@utils/Storage/messages';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import PopupBottomsheet from '@components/Reusable/BottomSheets/PopupBottomsheet';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useChatContext} from '@screens/DirectChat/ChatContext';

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
  openDeleteModal = false,
  setOpenDeleteModal,
  showDeleteForEveryone = false,
  determineDeleteModalDisplay,
  clearSelection,
}: {
  chatId: string;
  selectedMessages: string[];
  setReplyTo: any;
  postDelete: any;
  onCopy: any;
  isGroup: boolean;
  onForward: any;
  openDeleteModal: boolean;
  isSharedMedia?: boolean;
  showDeleteForEveryone: boolean;
  determineDeleteModalDisplay: () => void;
  setOpenDeleteModal: (isOpen: boolean) => void;
  isDisconnected?: boolean;
  clearSelection: any;
}): ReactNode {
  const {setSelectionMode} = useChatContext();
  const performReply = async (): Promise<void> => {
    setReplyTo(
      isGroup
        ? await getGroupMessage(chatId, selectedMessages[0])
        : await getMessage(chatId, selectedMessages[0]),
    );
    clearSelection();
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

  const onCopyClicked = () => {
    onCopy();
    setSelectionMode(false);
  };

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
              <Forward height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={PortColors.title}>
                Forward
              </NumberlessText>
            </Pressable>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onCopyClicked}>
              <Copy height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={PortColors.title}>
                Copy
              </NumberlessText>
            </Pressable>
          </View>
          {!isDisconnected && (
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={determineDeleteModalDisplay}>
                <Delete height={20} width={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={PortColors.title}>
                  Delete
                </NumberlessText>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.singleSelectedContainer}>
          {!isSharedMedia && !isDisconnected && (
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={performReply}>
                <Reply height={20} width={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={PortColors.title}>
                  Reply
                </NumberlessText>
              </Pressable>
            </View>
          )}

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={PortColors.title}>
                Forward
              </NumberlessText>
            </Pressable>
          </View>
          {!isSharedMedia && (
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onCopyClicked}>
                <Copy height={20} width={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={PortColors.title}>
                  Copy
                </NumberlessText>
              </Pressable>
            </View>
          )}

          {!isDisconnected && (
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={determineDeleteModalDisplay}>
                <Delete width={20} height={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={PortColors.title}>
                  Delete
                </NumberlessText>
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
    padding: PortSpacing.tertiary.top,
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
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBox: {
    width: 55,
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
