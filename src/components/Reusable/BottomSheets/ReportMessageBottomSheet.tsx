import React, {useState} from 'react';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {StyleSheet, View, Keyboard} from 'react-native';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {useChatContext} from '@screens/DirectChat/ChatContext';

import PrimaryButton from '../LongButtons/PrimaryButton';
import SecondaryButton from '../LongButtons/SecondaryButton';
import LargeInputWithImageAttachment from '../Inputs/LargeInputWithImageAttachment';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {wait} from '@utils/Time';
import {sendMessageReport} from '@utils/MessageReporting/APICalls';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import DirectChat from '@utils/DirectChats/DirectChat';
import {safeModalCloseDuration} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';

function ReportMessageBottomSheet({
  openModal,
  topButton,
  middleButton = '',
  onClose,
  description,
}: {
  openModal: boolean;
  topButton: string;
  middleButton?: string;
  onClose?: any;
  description: string;
}) {
  const {
    name,
    setSelectedMessage,
    selectedMessage,
    reportedMessages,
    setReportedMessages,
    isConnected,
    chatId,
  } = useChatContext();
  //this is incorrectly name "ReportSubmittedError". It is infact a success notification.
  const {ReportSubmittedError, ReportSubmittedSuccess} = useErrorModal();
  const [topButtonLoading, setTopButtonLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [middleButtonLoading, setMiddleButtonLoading] =
    useState<boolean>(false);

  const reportMessage = async () => {
    if (
      selectedMessage &&
      selectedMessage.message &&
      selectedMessage.message.data
    ) {
      await sendMessageReport({
        lineId: chatId,
        message: selectedMessage.message.data.text || '',
        description: text,
        attachedFiles: selectedMessage.message.data.fileUri
          ? [getSafeAbsoluteURI(selectedMessage.message.data.fileUri, 'doc')]
          : [],
      });
      if (reportedMessages?.length === 0 || reportedMessages === null) {
        setReportedMessages([selectedMessage.message.messageId]);
      } else {
        setReportedMessages((prev: string[]) => [
          ...prev,
          selectedMessage.message.messageId,
        ]);
      }
    }
  };
  const disconnect = async () => {
    try {
      const chatHandler = new DirectChat(chatId);
      await chatHandler.disconnect();
    } catch (error) {
      console.error('Error disconnecting chat', error);
    }
  };

  const navigation = useNavigation();

  const onTopButtonClick = async () => {
    try {
      setTopButtonLoading(true);
      await reportMessage();
      await disconnect();
      setTopButtonLoading(false);
      onCloseClick();
      setSelectedMessage(null);
      await wait(safeModalCloseDuration);
      ReportSubmittedSuccess();
      navigation.navigate('HomeTab');
    } catch (error) {
      console.error('Error submitting report and disconnecting', error);
      setTopButtonLoading(false);
      onCloseClick();
      setSelectedMessage(null);
      await wait(safeModalCloseDuration);
      ReportSubmittedError();
    }
  };

  const onMiddleButtonClick = async () => {
    try {
      setMiddleButtonLoading(true);
      await reportMessage();
      setMiddleButtonLoading(false);
      onCloseClick();
      setSelectedMessage(null);
      await wait(safeModalCloseDuration);
      ReportSubmittedSuccess();
    } catch (error) {
      console.error('Error submitting report', error);
      setMiddleButtonLoading(false);
      onCloseClick();
      setSelectedMessage(null);
      await wait(safeModalCloseDuration);
      ReportSubmittedError();
    }
  };

  const onCloseClick = () => {
    setText('');
    Keyboard.dismiss();
    onClose();
  };

  return (
    <PrimaryBottomSheet
      bgColor="g"
      visible={openModal}
      title={`Report ${name}`}
      showClose={true}
      onClose={onCloseClick}>
      <View style={styles.mainContainer}>
        <NumberlessText
          style={{marginTop: PortSpacing.secondary.top}}
          textColor={PortColors.subtitle}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {description}
        </NumberlessText>
        <View style={{paddingBottom: 4}}>
          <LargeInputWithImageAttachment
            showLimit={true}
            setText={setText}
            text={text}
            placeholderText="Add description (optional)"
            maxLength={1000}
          />
        </View>
        <View style={styles.buttonWrapper}>
          {isConnected && (
            <PrimaryButton
              buttonText={topButton}
              disabled={middleButtonLoading}
              isLoading={topButtonLoading}
              onClick={onTopButtonClick}
              primaryButtonColor="r"
            />
          )}
          <SecondaryButton
            isLoading={middleButtonLoading}
            buttonText={middleButton}
            onClick={onMiddleButtonClick}
            secondaryButtonColor="r"
          />
        </View>
      </View>
    </PrimaryBottomSheet>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    gap: PortSpacing.intermediate.uniform,
    width: screen.width,
    paddingHorizontal: PortSpacing.secondary.uniform,
    borderRadius: 30,
  },
  buttonWrapper: {
    gap: PortSpacing.tertiary.uniform,
  },
  buttonContainer: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.tertiary.uniform,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default ReportMessageBottomSheet;
