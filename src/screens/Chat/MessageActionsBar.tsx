import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {
  MessageSelectionMode,
  useSelectionContext,
} from '@screens/DirectChat/ChatContexts/SelectedMessages';
import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';

/**
 * Renders action bar based on messages that are selected
 * @param postDelete,
 * @returns {ReactNode} action bar that sits above the message bar
 */
export function MessageActionsBar(): ReactNode {
  const {determineDeleteModalDisplay, setReplyToMessage, chatId, isConnected} =
    useChatContext();
  const navigation = useNavigation();

  const {selectedMessages, setSelectedMessages, setSelectionMode} =
    useSelectionContext();

  const performReply = async (): Promise<void> => {
    // setReplyToMessage(reply);
    setReplyToMessage(selectedMessages[0]);
    clearSelection();
  };

  function clearSelection() {
    setSelectedMessages([]);
    setSelectionMode(MessageSelectionMode.Single);
  }
  function copyTexts() {
    const messageTexts = selectedMessages.map(m => m.data?.text || '');
    Clipboard.setStrings(messageTexts);
    clearSelection();
  }

  function forwardMessages() {
    const messageIds = selectedMessages.map(x => x.messageId);
    clearSelection();
    navigation.push('ForwardToContact', {
      chatId,
      messages: messageIds,
    });
  }

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'ReplyIcon',
      light: require('@assets/light/icons/Reply.svg').default,
      dark: require('@assets/dark/icons/Reply.svg').default,
    },
    {
      assetName: 'ForwardIcon',
      light: require('@assets/light/icons/Forward.svg').default,
      dark: require('@assets/dark/icons/Forward.svg').default,
    },

    {
      assetName: 'CopyIcon',
      light: require('@assets/light/icons/Copy.svg').default,
      dark: require('@assets/dark/icons/Copy.svg').default,
    },

    {
      assetName: 'DeleteIcon',
      light: require('@assets/light/icons/Delete.svg').default,
      dark: require('@assets/dark/icons/Delete.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const ReplyIcon = results.ReplyIcon;
  const ForwardIcon = results.ForwardIcon;
  const CopyIcon = results.CopyIcon;
  const DeleteIcon = results.DeleteIcon;

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
      {selectedMessages.length < 2 && (
        <View style={styles.optionContainer}>
          <Pressable style={styles.optionBox} onPress={performReply}>
            <ReplyIcon height={20} width={20} />
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={Colors.text.primary}>
              Reply
            </NumberlessText>
          </Pressable>
        </View>
      )}
      <View style={styles.optionContainer}>
        <Pressable style={styles.optionBox} onPress={forwardMessages}>
          <ForwardIcon height={20} width={20} />
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={Colors.text.primary}>
            Forward
          </NumberlessText>
        </Pressable>
      </View>

      <View style={styles.optionContainer}>
        <Pressable style={styles.optionBox} onPress={copyTexts}>
          <CopyIcon height={20} width={20} />
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={Colors.text.primary}>
            Copy
          </NumberlessText>
        </Pressable>
      </View>

      <View style={styles.optionContainer}>
        <Pressable
          style={styles.optionBox}
          onPress={determineDeleteModalDisplay}>
          <DeleteIcon height={20} width={20} />
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={PortColors.primary.red.error}>
            Delete
          </NumberlessText>
        </Pressable>
      </View>

      {/* {selectedMessages.length > 1 ? (
        <View style={styles.multiSelectedContainer}>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <ForwardIcon height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={Colors.text.primary}>
                Forward
              </NumberlessText>
            </Pressable>
          </View>

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onCopy}>
              <CopyIcon height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={Colors.text.primary}>
                Copy
              </NumberlessText>
            </Pressable>
          </View>

          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={determineDeleteModalDisplay}>
              <DeleteIcon height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={PortColors.primary.red.error}>
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
                <ReplyIcon height={20} width={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={Colors.text.primary}>
                  Reply
                </NumberlessText>
              </Pressable>
            </View>
          )}

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <ForwardIcon height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={Colors.text.primary}>
                Forward
              </NumberlessText>
            </Pressable>
          </View>

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onCopy}>
              <CopyIcon height={20} width={20} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={Colors.text.primary}>
                Copy
              </NumberlessText>
            </Pressable>
          </View>

          {isConnected && (
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={determineDeleteModalDisplay}>
                <DeleteIcon width={20} height={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={PortColors.primary.red.error}>
                  Delete
                </NumberlessText>
              </Pressable>
            </View>
          )}
        </View>
      )} */}
    </View>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    parentContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: PortSpacing.tertiary.top,
      paddingBottom: 10,
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
