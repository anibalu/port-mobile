import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {Animated, StyleSheet, TouchableHighlight, View} from 'react-native';
import ReplyImage from '@assets/icons/ReplyNew.svg';
import ForwardImage from '@assets/icons/ForwardNew.svg';
import SelectImage from '@assets/icons/CheckCircle.svg';
import CopyImage from '@assets/icons/CopyNew.svg';
import DeleteImage from '@assets/icons/DeleteIcon.svg';
import React, {useEffect, useRef} from 'react';
import {useChatContext} from '@screens/DirectChat/ChatContext';

const BubbleFocusOptions = () => {
  const {isConnected, onReply, onSelect, onDelete, onForward, onCopy} =
    useChatContext();
  const barWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Start animations
    Animated.timing(barWidth, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View
      style={[
        styles.optionsContainer,
        {
          transform: [{scaleX: barWidth}],
        },
      ]}>
      {isConnected && (
        <TouchableHighlight
          underlayColor={PortColors.background}
          activeOpacity={1}
          onPress={onReply}
          style={styles.optionButtonWrapper}>
          <View style={styles.optionButton}>
            <ReplyImage width={20} height={20} />
            <NumberlessText
              textColor={PortColors.title}
              fontSizeType={FontSizeType.m}
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
          <NumberlessText
            textColor={PortColors.title}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
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
          <NumberlessText
            textColor={PortColors.title}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
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
          <NumberlessText
            textColor={PortColors.title}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
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
          <NumberlessText
            textColor={PortColors.primary.red.error}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            Delete
          </NumberlessText>
        </View>
      </TouchableHighlight>
    </Animated.View>
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
    width: 160,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
});

export default BubbleFocusOptions;
