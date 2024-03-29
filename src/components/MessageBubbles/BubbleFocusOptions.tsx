import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {StyleSheet, TouchableHighlight, View} from 'react-native';
import ReplyImage from '@assets/icons/ReplyNew.svg';
import ForwardImage from '@assets/icons/ForwardNew.svg';
import SelectImage from '@assets/icons/CheckCircle.svg';
import CopyImage from '@assets/icons/CopyNew.svg';
import DeleteImage from '@assets/icons/deleteRed.svg';
import React from 'react';
import {useChatContext} from '@screens/DirectChat/ChatContext';

const BubbleFocusOptions = () => {
  const {isConnected, onReply, onSelect, onDelete, onForward, onCopy} =
    useChatContext();

  return (
    <View style={styles.optionsContainer}>
      {isConnected && (
        <TouchableHighlight
          underlayColor={PortColors.background}
          activeOpacity={1}
          onPress={onReply}
          style={styles.optionButtonWrapper}>
          <View style={styles.optionButton}>
            <ReplyImage width={20} height={20} />
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Reply
            </NumberlessText>
          </View>
        </TouchableHighlight>
      )}
      <TouchableHighlight
        underlayColor={PortColors.background}
        activeOpacity={1}
        onPress={onForward}
        style={styles.optionButtonWrapper}>
        <View style={styles.optionButton}>
          <ForwardImage width={20} height={20} />
          <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.rg}>
            Forward
          </NumberlessText>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor={PortColors.background}
        activeOpacity={1}
        onPress={onCopy}
        style={styles.optionButtonWrapper}>
        <View style={styles.optionButton}>
          <CopyImage width={20} height={20} />
          <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.rg}>
            Copy
          </NumberlessText>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor={PortColors.background}
        activeOpacity={1}
        onPress={onSelect}
        style={styles.optionButtonWrapper}>
        <View style={styles.optionButton}>
          <SelectImage width={20} height={20} />
          <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.rg}>
            Select
          </NumberlessText>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor={PortColors.background}
        activeOpacity={1}
        onPress={onDelete}
        style={StyleSheet.compose(styles.optionButtonWrapper, {
          borderBottomWidth: 0,
        })}>
        <View style={styles.optionButton}>
          <DeleteImage width={20} height={20} />
          <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.rg}>
            Delete
          </NumberlessText>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 15,
  },
  optionButtonWrapper: {
    width: '100%',
    padding: PortSpacing.secondary.uniform,
    borderBottomWidth: 0.5,
    borderBottomColor: PortColors.stroke,
  },
  optionsContainer: {
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: PortColors.stroke,
    backgroundColor: PortColors.primary.white,
    borderRadius: 12,
    overflow: 'hidden',
    width: 180,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
});

export default BubbleFocusOptions;
