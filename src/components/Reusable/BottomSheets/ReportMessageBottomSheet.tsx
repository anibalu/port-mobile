import React, {useState} from 'react';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {StyleSheet, View, Keyboard} from 'react-native';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import * as storage from '@utils/Storage/blockUsers';
import PrimaryButton from '../LongButtons/PrimaryButton';
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
import {REPORT_TYPES, createLineMessageReport} from '@utils/MessageReporting';
import {useSelectionContext} from '@screens/DirectChat/ChatContexts/SelectedMessages';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import SecondaryButton from '../LongButtons/SecondaryButton';
import LargeTextInput from '../Inputs/LargeTextInput';
import {ToastType, useToast} from 'src/context/ToastContext';

function ReportMessageBottomSheet({
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
  const {name, reportedMessages, setReportedMessages, isConnected, chatId} =
    useChatContext();
  const {selectedMessages, setSelectedMessages} = useSelectionContext();

  const [disconnectLoading, setDisconnectLoading] = useState<boolean>(false);
  const [bottomButtonLoading, setBottomButtonLoading] =
    useState<boolean>(false);

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const {showToast} = useToast();

  const [topButtonLoading, setTopButtonLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const reportMessage = async () => {
    if (selectedMessages && selectedMessages[0] && selectedMessages[0].data) {
      if (selectedReportOption.index === 1) {
        await createLineMessageReport(
          chatId,
          selectedMessages[0].messageId,
          REPORT_TYPES.MOLESTATION,
        );
      } else {
        await sendMessageReport(
          chatId,
          selectedMessages[0].data.text || '',
          text,
          selectedMessages[0].data.fileUri
            ? [getSafeAbsoluteURI(selectedMessages[0].data.fileUri, 'doc')]
            : [],
        );
      }

      if (reportedMessages?.length === 0 || reportedMessages === null) {
        setReportedMessages([selectedMessages[0].messageId]);
      } else {
        setReportedMessages((prev: string[]) => [
          ...prev,
          selectedMessages[0].messageId,
        ]);
      }
    }
  };

  const onTopButtonClick = async () => {
    try {
      setTopButtonLoading(true);
      await reportMessage();
      setTopButtonLoading(false);
      setSelectedMessages([]);
      await wait(safeModalCloseDuration);
      setReportSubmitted(true);
    } catch (error) {
      console.error('Error submitting report', error);
      setTopButtonLoading(false);
      setSelectedMessages([]);
      await wait(safeModalCloseDuration);
      showToast('Report successfully submitted', ToastType.success);
    }
  };

  const onCloseClick = () => {
    setText('');
    setReportSubmitted(false);
    Keyboard.dismiss();
    onClose();
  };

  const disconnect = async () => {
    try {
      const chatHandler = new DirectChat(chatId);
      await chatHandler.disconnect();
    } catch (error) {
      console.error('Error disconnecting chat', error);
    }
  };

  const blockUser = async () => {
    try {
      const chatHandler = new DirectChat(chatId);
      const chatData = await chatHandler.getChatData();
      await storage.blockUser({
        name: chatData.name || '',
        pairHash: chatData.pairHash,
        blockTimestamp: new Date().toISOString(),
      });
    } catch {
      console.log('Error in blocking user');
    }
  };
  const navigation = useNavigation();
  const onDisconnectClick = async () => {
    try {
      setDisconnectLoading(true);
      await disconnect();
      setDisconnectLoading(false);
      onCloseClick();
      await wait(safeModalCloseDuration);
      navigation.navigate('HomeTab');
    } catch (err) {
      console.error('Error disconnecting', err);
      setDisconnectLoading(false);
      onCloseClick();
      await wait(safeModalCloseDuration);
    }
  };

  const onDisconnectAndBlockClick = async () => {
    try {
      setBottomButtonLoading(true);
      await disconnect();
      await blockUser();
      setBottomButtonLoading(false);
      onCloseClick();
      await wait(safeModalCloseDuration);
      navigation.navigate('HomeTab');
    } catch (err) {
      console.error('Error disconnecting and blocking', err);
      setBottomButtonLoading(false);
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
                  <SecondaryButton
                    isLoading={disconnectLoading}
                    buttonText={'Disconnect chat'}
                    onClick={onDisconnectClick}
                    secondaryButtonColor="r"
                  />
                  <PrimaryButton
                    disabled={false}
                    buttonText={'Disconnect and block'}
                    isLoading={bottomButtonLoading}
                    onClick={onDisconnectAndBlockClick}
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

export default ReportMessageBottomSheet;
