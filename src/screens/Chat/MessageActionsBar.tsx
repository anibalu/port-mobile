import Delete from '@assets/icons/DeleteIcon.svg';
import Copy from '@assets/icons/copy.svg';
import Forward from '@assets/icons/forward.svg';
import Info from '@assets/icons/info.svg';
import Reply from '@assets/icons/reply.svg';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortColors} from '@components/ComponentUtils';
import DeleteModal from '@components/Modals/DeleteModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {cleanDeleteMessage, getMessage} from '@utils/Storage/messages';
import {useErrorModal} from 'src/context/ErrorModalContext';

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
  onInfo,
  onForward,
  isSharedMedia,
}: {
  chatId: string;
  selectedMessages: string[];
  setReplyTo: any;
  postDelete: any;
  onCopy: any;
  onInfo: () => void;
  onForward: any;
  isSharedMedia?: boolean;
}): ReactNode {
  const {somethingWentWrongError} = useErrorModal();
  const performReply = async (): Promise<void> => {
    setReplyTo(await getMessage(chatId, selectedMessages[0]));
  };
  const performDelete = async (): Promise<void> => {
    for (const msg of selectedMessages) {
      await cleanDeleteMessage(chatId, msg);
    }
    postDelete(selectedMessages);
    setOpenDeleteModal(false);
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
      const sender = new SendMessage(chatId, ContentType.update, {
        messageIdToBeUpdated: msg,
        updatedContentType: ContentType.deleted,
      });
      sender.send(true, true, async (success: boolean) => {
        if (success) {
          await cleanDeleteMessage(chatId, msg);
          postDelete(selectedMessages);
        } else {
          somethingWentWrongError();
        }
      });
    }

    setOpenDeleteModal(false);
  };

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [showDeleteForEveryone, setShowDeleteForEveryone] = useState(false);

  return (
    <View style={styles.parentContainer}>
      <DeleteModal
        showMore={showDeleteForEveryone}
        openDeleteModal={openDeleteModal}
        title={'Delete message'}
        topButton="Delete for me"
        topButtonFunction={performDelete}
        middleButton="Delete for everyone"
        middleButtonFunction={performGlobalDelete}
        bottomButton="Cancel"
        bottomButtonFunction={() => {
          setOpenDeleteModal(false);
        }}
      />
      {selectedMessages.length > 1 ? (
        <View style={styles.multiSelectedContainer}>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
            <NumberlessText
              style={styles.optionText}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Forward
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onCopy}>
              <Copy />
            </Pressable>
            <NumberlessText
              style={styles.optionText}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Copy
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={determineModalDisplay}>
              <Delete />
            </Pressable>
            <NumberlessText
              style={styles.optionText}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Delete
            </NumberlessText>
          </View>
        </View>
      ) : (
        <View style={styles.singleSelectedContainer}>
          {!isSharedMedia && (
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={performReply}>
                <Reply />
              </Pressable>
              <NumberlessText
                style={styles.optionText}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Reply
              </NumberlessText>
            </View>
          )}

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
            <NumberlessText
              style={styles.optionText}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Forward
            </NumberlessText>
          </View>
          {!isSharedMedia && (
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onCopy}>
                <Copy />
              </Pressable>
              <NumberlessText
                style={styles.optionText}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Copy
              </NumberlessText>
            </View>
          )}

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onInfo}>
              <Info />
            </Pressable>
            <NumberlessText
              style={styles.optionText}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Info
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={determineModalDisplay}>
              <Delete />
            </Pressable>
            <NumberlessText
              style={styles.optionText}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Delete
            </NumberlessText>
          </View>
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
    paddingBottom: 20,
    backgroundColor: PortColors.primary.white,
  },
  singleSelectedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  multiSelectedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
