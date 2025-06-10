import React, {useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import BaseBottomSheet from '@components/BaseBottomsheet';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing , Width } from '@components/spacingGuide';

import {safeModalCloseDuration} from '@configs/constants';
import {messageReportCategories} from '@configs/reportingCategories';

import {useChatContext} from '@screens/DirectChat/ChatContext';
import {useSelectionContext} from '@screens/DirectChat/ChatContexts/SelectedMessages';

import DirectChat from '@utils/DirectChats/DirectChat';
import {REPORT_TYPES, createLineMessageReport} from '@utils/MessageReporting';
import {sendMessageReport} from '@utils/MessageReporting/APICalls';
import * as storage from '@utils/Storage/blockUsers';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {wait} from '@utils/Time';

import {ToastType, useToast} from 'src/context/ToastContext';

import SimpleCard from '../Cards/SimpleCard';
import LargeTextInput from '../Inputs/LargeTextInput';
import SimpleInput from '../Inputs/SimpleInput';
import PrimaryButton from '../LongButtons/PrimaryButton';
import SecondaryButton from '../LongButtons/SecondaryButton';
import OptionWithRadio from '../OptionButtons/OptionWithRadio';


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

  const Colors = useColors();
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
    <BaseBottomSheet
      visible={openModal}
      onClose={onCloseClick}>
      <View style={styles.mainContainer}>
      <View style={styles.titleContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            Why are you reporting {name}?
          </NumberlessText>
          <LineSeparator style={{ width: Width.screen }} />
        </View>
        {onReportSubmitted ? (
          <>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.m}>
              Type of issue
            </NumberlessText>
            <SimpleCard style={styles.card}>
              <NumberlessText
                textColor={Colors.text.title}
                fontWeight={FontWeight.sb}
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
              textColor={Colors.text.subtitle}
              fontWeight={FontWeight.rg}
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
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}>
              {description}
            </NumberlessText>
            <SimpleCard >
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
                    paddingHorizontal: Spacing.m,
                    marginVertical: Spacing.m,
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
    </BaseBottomSheet>
  );
}

const styling = (Colors: any) =>
  StyleSheet.create({
    mainContainer: {
      width: Width.screen,
      paddingHorizontal: Spacing.l,
    },
    titleContainer: {
      width: '100%',
      paddingTop: Spacing.s,
      paddingBottom: Spacing.l,
      flexDirection: 'column',
      alignItems: 'center',
      gap: Spacing.m,
    },
    buttonWrapper: {
      gap: Spacing.m,
    },
    buttonContainer: {
      paddingHorizontal: Spacing.m,
      paddingVertical: Spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    card: {
      paddingHorizontal: Spacing.m,
      borderWidth: 0.5,
      borderColor: Colors.stroke,
      paddingVertical: Spacing.m,
    },
    block: {
      borderRadius: 8,
      borderColor: Colors.stroke,
      borderWidth: 0.5,
      marginTop: Spacing.m,
      paddingTop: Spacing.m,
      paddingLeft: Spacing.m,
    },
  });

export default ReportMessageBottomSheet;
