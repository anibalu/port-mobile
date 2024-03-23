import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {StyleSheet, TouchableHighlight, View} from 'react-native';
import ReplyImage from '@assets/icons/reply.svg';
import ForwardImage from '@assets/icons/forward.svg';
import SelectImage from '@assets/icons/CheckCircle.svg';
import CopyImage from '@assets/icons/copy.svg';
import DeleteImage from '@assets/icons/deleteRed.svg';
import React from 'react';

const BubbleFocusOptions = ({
  isConnected,
  onSelect,
  onReply,
  onForward,
  onDelete,
  onCopy,
}: {
  isConnected: boolean;
  onDelete: () => void;
  onReply: () => void;
  onSelect: () => void;
  onForward: () => void;
  onCopy: () => void;
}) => {
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
