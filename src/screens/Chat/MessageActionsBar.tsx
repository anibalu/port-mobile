import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Copy from '@assets/icons/copy.svg';
import Delete from '@assets/icons/DeleteIcon.svg';
import Forward from '@assets/icons/forward.svg';
import Info from '@assets/icons/info.svg';
import Reply from '@assets/icons/reply.svg';
import CustomModal from '@components/CustomModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {cleanDeleteMessage, getMessage} from '@utils/Storage/messages';
import {PortColors} from '@components/ComponentUtils';

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
  isSharedMedia,
}: {
  chatId: string;
  selectedMessages: string[];
  setReplyTo: any;
  postDelete: any;
  onCopy: any;
  onForward: any;
  isSharedMedia?: boolean;
}): ReactNode {
  const performReply = async (): Promise<void> => {
    setReplyTo(await getMessage(chatId, selectedMessages[0]));
  };
  const performDelete = async (): Promise<void> => {
    for (const msg of selectedMessages) {
      await cleanDeleteMessage(chatId, msg);
    }
    postDelete(selectedMessages);
    setOpenCustomModal(false);
  };

  const [openCustomModal, setOpenCustomModal] = useState(false);

  return (
    <View style={styles.parentContainer}>
      <CustomModal
        openCustomModal={openCustomModal}
        title={'Delete message'}
        topButton="Delete for me"
        topButtonFunction={performDelete}
        bottomButton="Cancel"
        bottomButtonFunction={() => {
          setOpenCustomModal(false);
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
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                setOpenCustomModal(true);
              }}>
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
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('info pressed');
              }}>
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
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                setOpenCustomModal(true);
              }}>
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
