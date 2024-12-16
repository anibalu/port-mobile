import React, {useState} from 'react';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {StyleSheet, View, Keyboard} from 'react-native';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {useChatContext} from '@screens/GroupChat/ChatContext';

import PrimaryButton from '../LongButtons/PrimaryButton';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {wait} from '@utils/Time';
import {sendMessageReport} from '@utils/MessageReporting/APICalls';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {safeModalCloseDuration} from '@configs/constants';
import DynamicColors from '@components/DynamicColors';
import SimpleCard from '../Cards/SimpleCard';
import OptionWithRadio from '../OptionButtons/OptionWithRadio';
import LineSeparator from '../Separators/LineSeparator';
import {messageReportCategories} from '@configs/reportingCategories';
import SimpleInput from '../Inputs/SimpleInput';
import {REPORT_TYPES, createGroupMessageReport} from '@utils/MessageReporting';
import {useNavigation} from '@react-navigation/native';
import {ToastType, useToast} from 'src/context/ToastContext';
import Group from '@utils/Groups/Group';
import LargeTextInput from '../Inputs/LargeTextInput';

function GroupReportMessageBottomSheet({
  openModal,
  topButton,
  onClose,
  description,
  setReportSubmitted,
  setSelectedReportOption,
  selectedReportOption,
  setOtherReport,
  otherReport,
  onReportSubmitted,
}: {
  openModal: boolean;
  topButton: string;
  onClose?: any;
  description: string;
  setReportSubmitted: (x: boolean) => void;
  setSelectedReportOption: (x: any) => void;
  selectedReportOption: any;
  setOtherReport: (x: string) => void;
  otherReport: string;
  onReportSubmitted: boolean;
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
  const {ReportSubmittedError} = useErrorModal();
  const [topButtonLoading, setTopButtonLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>('');

  const reportMessage = async () => {
    if (
      selectedMessage &&
      selectedMessage.message &&
      selectedMessage.message.data
    ) {
      if (selectedReportOption.index === 1) {
        await createGroupMessageReport(
          chatId,
          selectedMessage.message.messageId,
          REPORT_TYPES.MOLESTATION,
        );
      } else {
        await sendMessageReport(
          chatId,
          selectedMessage.message.data.text || '',
          text,
          selectedMessage.message.data.fileUri
            ? [getSafeAbsoluteURI(selectedMessage.message.data.fileUri, 'doc')]
            : [],
        );
      }

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

  const onTopButtonClick = async () => {
    try {
      setTopButtonLoading(true);
      await reportMessage();
      setTopButtonLoading(false);
      setSelectedMessage(null);
      await wait(safeModalCloseDuration);
      setReportSubmitted(true);
    } catch (error) {
      console.error('Error submitting report', error);
      setTopButtonLoading(false);
      setSelectedMessage(null);
      await wait(safeModalCloseDuration);
      ReportSubmittedError();
    }
  };

  const onCloseClick = () => {
    setReportSubmitted(false);
    setText('');
    Keyboard.dismiss();
    onClose();
  };

  const Colors = DynamicColors();

  const {showToast} = useToast();

  const [exitGroupButtonLoading, setExitGroupButtonLoading] =
    useState<boolean>(false);

  const styles = styling(Colors);

  const navigation = useNavigation();
  const handleChatDisconnect = async (chatIdString: string) => {
    try {
      const chatHandler = new Group(chatIdString);
      await chatHandler.leaveGroup();
    } catch (error) {
      wait(safeModalCloseDuration).then(() => {
        showToast(
          'Error in disconnecting this chat. Please check you network connection',
          ToastType.error,
        );
      });
    }
  };
  const onExitGroup = async () => {
    try {
      setExitGroupButtonLoading(true);
      await handleChatDisconnect(chatId);
      setExitGroupButtonLoading(false);
      onCloseClick();
      await wait(safeModalCloseDuration);
      navigation.navigate('HomeTab');
    } catch (err) {
      console.error('Error disconnecting', err);
      setExitGroupButtonLoading(false);
      onCloseClick();
      await wait(safeModalCloseDuration);
    }
  };

  return (
    <PrimaryBottomSheet
      bgColor="g"
      visible={openModal}
      title={`Why are you reporting ${name}?`}
      showClose={true}
      onClose={onCloseClick}>
      <View style={styles.mainContainer}>
        {onReportSubmitted ? (
          <>
            <NumberlessText
              style={{marginTop: PortSpacing.tertiary.top}}
              textColor={Colors.text.subtitle}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              Type of issue
            </NumberlessText>
            <SimpleCard style={styles.card}>
              <NumberlessText
                textColor={Colors.text.primary}
                fontType={FontType.sb}
                fontSizeType={FontSizeType.l}>
                {selectedReportOption.title}
              </NumberlessText>
              {selectedReportOption.index === 3 && (
                <View style={styles.block}>
                  <LargeTextInput
                    maxLength={2000}
                    setText={() => {}}
                    text={otherReport}
                    bgColor="w"
                    placeholderText="Add a description"
                    isEditable={false}
                  />
                </View>
              )}
            </SimpleCard>
            <NumberlessText
              textColor={Colors.text.primary}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              Port will take a careful look at this contact/content and take
              appropriate action.
            </NumberlessText>

            <View style={styles.buttonWrapper}>
              {isConnected && (
                <>
                  <PrimaryButton
                    disabled={false}
                    buttonText={'Exit group'}
                    isLoading={exitGroupButtonLoading}
                    onClick={onExitGroup}
                    primaryButtonColor="r"
                  />
                </>
              )}
            </View>
          </>
        ) : (
          <>
            <NumberlessText
              style={{marginTop: PortSpacing.secondary.top}}
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {description}
            </NumberlessText>
            <SimpleCard style={{paddingBottom: 4}}>
              {messageReportCategories.map((item, index) => {
                const isLast = messageReportCategories.length === item.index;
                return (
                  <View key={index}>
                    <OptionWithRadio
                      onClick={async () => setSelectedReportOption(item)}
                      selectedOption={selectedReportOption.index}
                      selectedOptionComparision={item.index}
                      title={item.title}
                    />
                    {!isLast && <LineSeparator />}
                  </View>
                );
              })}
              {selectedReportOption.index === 3 && (
                <View
                  style={{
                    paddingHorizontal: PortSpacing.secondary.bottom,
                    marginVertical: PortSpacing.tertiary.top,
                  }}>
                  <SimpleInput
                    placeholderText={'Type your reason'}
                    maxLength={200}
                    text={otherReport}
                    setText={setOtherReport}
                    bgColor="w"
                  />
                </View>
              )}
            </SimpleCard>
            <View style={styles.buttonWrapper}>
              {isConnected && (
                <>
                  <PrimaryButton
                    disabled={
                      otherReport.length === 0 &&
                      selectedReportOption.index === 3
                    }
                    buttonText={topButton}
                    isLoading={topButtonLoading}
                    onClick={onTopButtonClick}
                    primaryButtonColor="r"
                  />
                </>
              )}
            </View>
          </>
        )}
      </View>
    </PrimaryBottomSheet>
  );
}
const styling = (Colors: any) =>
  StyleSheet.create({
    mainContainer: {
      gap: PortSpacing.intermediate.uniform,
      width: screen.width,
      paddingHorizontal: PortSpacing.secondary.uniform,
      borderRadius: 30,
      ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
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
    card: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      borderWidth: 0.5,
      borderColor: Colors.primary.stroke,
      paddingVertical: PortSpacing.secondary.uniform,
    },
    block: {
      borderRadius: 8,
      borderColor: Colors.primary.stroke,
      borderWidth: 0.5,
      marginTop: PortSpacing.tertiary.top,
      paddingTop: PortSpacing.tertiary.top,
      paddingLeft: PortSpacing.tertiary.left,
    },
  });

export default GroupReportMessageBottomSheet;
