import Delete from '@assets/icons/DeleteIcon.svg';
import Copy from '@assets/icons/copy.svg';
import Forward from '@assets/icons/ForwardNew.svg';
import Reply from '@assets/icons/ReplyNew.svg';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';

import {getGroupMessage, getMessage} from '@utils/Storage/messages';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useChatContext} from '@screens/DirectChat/ChatContext';

/**
 * Renders action bar based on messages that are selected
 * @param postDelete,
 * @returns {ReactNode} action bar that sits above the message bar
 */
export function MessageActionsBar(): ReactNode {
  const {
    setSelectionMode,
    determineDeleteModalDisplay,
    clearSelection,
    setReplyToMessage,
    onForward,
    onCopy,
    chatId,
    isGroupChat,
    isConnected,
    selectedMessages,
  } = useChatContext();
  const performReply = async (): Promise<void> => {
    setReplyToMessage(
      isGroupChat
        ? await getGroupMessage(chatId, selectedMessages[0])
        : await getMessage(chatId, selectedMessages[0]),
    );
    clearSelection();
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
              paddingHorizontal: !isConnected ? 45 : 10,
            }
          : {
              ...styles.parentContainer,
              paddingHorizontal: !isConnected ? 45 : 10,
            }
      }>
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
        </View>
      ) : (
        <View style={styles.singleSelectedContainer}>
          {isConnected && (
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

          {isConnected && (
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
    borderTopColor: PortColors.stroke,
    borderTopWidth: 1,
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
