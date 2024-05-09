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
import CautionImage from '@assets/icons/cautionBlack.svg';
import CopyImage from '@assets/icons/CopyNew.svg';
import DeleteImage from '@assets/icons/DeleteIcon.svg';
import React, {useEffect, useRef} from 'react';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {ContentType} from '@utils/Messaging/interfaces';

const BubbleFocusOptions = () => {
  const {
    isConnected,
    onReply,
    onSelect,
    onDelete,
    onReport,
    onForward,
    onCopy,
    selectedMessage,
    setSelectedMessage,
  } = useChatContext();

  const allowReport =
    selectedMessage?.message.contentType === ContentType.text ||
    ContentType.image ||
    ContentType.video ||
    ContentType.link ||
    ContentType.audioRecording;

  const isDeleted =
    selectedMessage?.message.contentType === ContentType.deleted;
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

  const isSender = selectedMessage?.message.sender;

  const onCopyClicked = () => {
    onCopy();
    setSelectedMessage(null);
  };
  return (
    <Animated.View
      style={[
        styles.optionsContainer,
        {
          transform: [{scaleX: barWidth}],
        },
      ]}>
      {isConnected && !isDeleted && (
        <TouchableHighlight
          underlayColor={PortColors.background}
          activeOpacity={1}
          onPress={onReply}
          style={styles.optionButtonWrapper}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={PortColors.title}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Reply
            </NumberlessText>
            <ReplyImage width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}
      {!isDeleted && (
        <TouchableHighlight
          underlayColor={PortColors.background}
          activeOpacity={1}
          onPress={onForward}
          style={styles.optionButtonWrapper}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={PortColors.title}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Forward
            </NumberlessText>
            <ForwardImage width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}
      {!isDeleted && (
        <TouchableHighlight
          underlayColor={PortColors.background}
          activeOpacity={1}
          onPress={onCopyClicked}
          style={styles.optionButtonWrapper}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={PortColors.title}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Copy
            </NumberlessText>
            <CopyImage width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}

      {!isDeleted && (
        <TouchableHighlight
          underlayColor={PortColors.background}
          activeOpacity={1}
          onPress={onSelect}
          style={styles.optionButtonWrapper}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={PortColors.title}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Select
            </NumberlessText>
            <SelectImage width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}
      {!isDeleted && !isSender && allowReport && (
        <TouchableHighlight
          underlayColor={PortColors.background}
          activeOpacity={1}
          onPress={onReport}
          style={styles.optionButtonWrapper}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={PortColors.title}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Report
            </NumberlessText>
            <CautionImage width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}

      <TouchableHighlight
        underlayColor={PortColors.background}
        activeOpacity={1}
        onPress={onDelete}
        style={StyleSheet.compose(styles.optionButtonWrapper, {
          borderBottomWidth: 0,
        })}>
        <View style={styles.optionButton}>
          <NumberlessText
            textColor={PortColors.primary.red.error}
            fontSizeType={FontSizeType.l}
            fontType={FontType.rg}>
            Delete
          </NumberlessText>
          <DeleteImage width={20} height={20} />
        </View>
      </TouchableHighlight>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionButtonWrapper: {
    width: '100%',
    padding: PortSpacing.secondary.uniform,
    borderBottomWidth: 0.25,
    borderBottomColor: PortColors.text.body,
  },
  optionsContainer: {
    marginTop: 4,
    backgroundColor: PortColors.stroke,
    borderRadius: 12,
    overflow: 'hidden',
    width: 200,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
});

export default BubbleFocusOptions;
