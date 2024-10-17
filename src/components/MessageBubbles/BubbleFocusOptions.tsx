import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {Animated, StyleSheet, TouchableHighlight, View} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {
  ContentType,
  ReportMessageContentTypes,
  UnCopyableMessageContentTypes,
  UnForwardableMessageContentTypes,
  editableContentTypes,
} from '@utils/Messaging/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import DynamicColors from '@components/DynamicColors';
import {useTheme} from 'src/context/ThemeContext';

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
    onEditMessage,
  } = useChatContext();

  const allowReport =
    selectedMessage && selectedMessage.message
      ? ReportMessageContentTypes.includes(selectedMessage.message.contentType)
      : false;
  const allowForward =
    selectedMessage && selectedMessage.message
      ? !UnForwardableMessageContentTypes.includes(
          selectedMessage.message.contentType,
          selectedMessage.message.contentType,
        )
      : true;

  const allowCopy =
    selectedMessage && selectedMessage.message
      ? !UnCopyableMessageContentTypes.includes(
          selectedMessage.message.contentType,
        )
      : true;
  const allowEdit =
    selectedMessage && selectedMessage.message
      ? editableContentTypes.includes(selectedMessage.message.contentType)
      : false;

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
      assetName: 'SelectIcon',
      light: require('@assets/light/icons/CheckCircle.svg').default,
      dark: require('@assets/dark/icons/CheckCircle.svg').default,
    },
    {
      assetName: 'CopyIcon',
      light: require('@assets/light/icons/Copy.svg').default,
      dark: require('@assets/dark/icons/Copy.svg').default,
    },
    {
      assetName: 'CautionIcon',
      light: require('@assets/light/icons/Caution.svg').default,
      dark: require('@assets/dark/icons/Caution.svg').default,
    },
    {
      assetName: 'DeleteIcon',
      light: require('@assets/light/icons/Delete.svg').default,
      dark: require('@assets/dark/icons/Delete.svg').default,
    },
    {
      assetName: 'EditIcon',
      light: require('@assets/light/icons/EditIcon.svg').default,
      dark: require('@assets/dark/icons/EditIcon.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const ReplyIcon = results.ReplyIcon;
  const ForwardIcon = results.ForwardIcon;
  const SelectIcon = results.SelectIcon;
  const CopyIcon = results.CopyIcon;
  const CautionIcon = results.CautionIcon;
  const DeleteIcon = results.DeleteIcon;
  const EditIcon = results.EditIcon;

  const Colors = DynamicColors();
  const styles = styling(Colors);
  const {themeValue} = useTheme();

  const dynamicOptionWrapperStyle = StyleSheet.compose(
    styles.optionButtonWrapper,
    {
      borderBottomColor:
        themeValue === 'dark'
          ? Colors.primary.stroke
          : Colors.primary.mediumgrey,
    },
  );

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
          underlayColor={Colors.primary.background}
          activeOpacity={1}
          onPress={onReply}
          style={dynamicOptionWrapperStyle}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Reply
            </NumberlessText>
            <ReplyIcon width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}

      {!isDeleted && allowForward && (
        <TouchableHighlight
          underlayColor={Colors.primary.background}
          activeOpacity={1}
          onPress={onForward}
          style={dynamicOptionWrapperStyle}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Forward
            </NumberlessText>
            <ForwardIcon width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}
      {isConnected && !isDeleted && isSender && allowEdit && (
        <TouchableHighlight
          underlayColor={Colors.primary.background}
          activeOpacity={1}
          onPress={onEditMessage}
          style={dynamicOptionWrapperStyle}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Edit
            </NumberlessText>
            <EditIcon width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}
      {!isDeleted && allowCopy && (
        <TouchableHighlight
          underlayColor={Colors.primary.background}
          activeOpacity={1}
          onPress={onCopyClicked}
          style={dynamicOptionWrapperStyle}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Copy
            </NumberlessText>
            <CopyIcon width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}

      {!isDeleted && (
        <TouchableHighlight
          underlayColor={Colors.primary.background}
          activeOpacity={1}
          onPress={onSelect}
          style={dynamicOptionWrapperStyle}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Select
            </NumberlessText>
            <SelectIcon width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}
      {!isDeleted && !isSender && allowReport && (
        <TouchableHighlight
          underlayColor={Colors.primary.background}
          activeOpacity={1}
          onPress={onReport}
          style={dynamicOptionWrapperStyle}>
          <View style={styles.optionButton}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Report
            </NumberlessText>
            <CautionIcon width={20} height={20} />
          </View>
        </TouchableHighlight>
      )}

      <TouchableHighlight
        underlayColor={Colors.primary.background}
        activeOpacity={1}
        onPress={onDelete}
        style={StyleSheet.compose(dynamicOptionWrapperStyle, {
          borderBottomWidth: 0,
        })}>
        <View style={styles.optionButton}>
          <NumberlessText
            textColor={PortColors.primary.red.error}
            fontSizeType={FontSizeType.l}
            fontType={FontType.rg}>
            Delete
          </NumberlessText>
          <DeleteIcon width={20} height={20} />
        </View>
      </TouchableHighlight>
    </Animated.View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
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
    },
    optionsContainer: {
      marginTop: 4,
      backgroundColor: colors.primary.surface2,
      borderRadius: 12,
      overflow: 'hidden',
      width: 200,
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
  });

export default BubbleFocusOptions;
