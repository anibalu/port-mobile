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
import { Spacing, Width } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import {safeModalCloseDuration} from '@configs/constants';
import {messageReportCategories} from '@configs/reportingCategories';

import {useChatContext} from '@screens/GroupChat/ChatContext';

import Group from '@utils/Groups/Group';
import {REPORT_TYPES, createGroupMessageReport} from '@utils/MessageReporting';
import {sendMessageReport} from '@utils/MessageReporting/APICalls';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {wait} from '@utils/Time';

import {ToastType, useToast} from 'src/context/ToastContext';

import SimpleCard from '../Cards/SimpleCard';
import SimpleInput from '../Inputs/SimpleInput';
import PrimaryButton from '../LongButtons/PrimaryButton';
import OptionWithRadio from '../OptionButtons/OptionWithRadio';


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

  const [topButtonLoading, setTopButtonLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const svgArray = [
    {
      assetName: 'SingleTick',
      light: require('@assets/light/icons/SingleTick.svg').default,
      dark: require('@assets/dark/icons/SingleTick.svg').default,
    },
  ];
  const results = useSVG(svgArray);

  const SingleTick = results.SingleTick;

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
      showToast('Report successfully submitted', ToastType.success);
    }
  };

  const onCloseClick = () => {
    setReportSubmitted(false);
    setText('');
    Keyboard.dismiss();
    onClose();
  };

  const Colors = useColors();

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
      console.error('Error disconnecting from group', err);
      setExitGroupButtonLoading(false);
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
      <View style={{flexDirection:'row', gap: Spacing.s}}>
        {onReportSubmitted && <SingleTick /> } 
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
              {onReportSubmitted? `Thanks for reporting`:`Why are you reporting ${name}?`}
          </NumberlessText>
      </View>
          
          <LineSeparator style={{ width: Width.screen }} />
        </View>
        {onReportSubmitted ? (
          <>
            <NumberlessText
              style={{marginBottom: Spacing.s}}
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
                  <SimpleInput
                    maxLength={200}
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
            style={{marginTop: Spacing.s}}
              textColor={Colors.text.subtitle}
              fontWeight={FontWeight.rg}
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
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}
           >
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
                    paddingHorizontal: Spacing.l,
                    marginVertical:Spacing.s
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
    buttonWrapper: {
      gap: Spacing.m,
      marginTop: Spacing.s
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
      marginTop: Spacing.m,   
    },
    titleContainer: {
      width: '100%',
      paddingTop: Spacing.s,
      paddingBottom: Spacing.s,
      flexDirection: 'column',
      alignItems: 'center',
      gap: Spacing.m,
    
    },
  });

export default GroupReportMessageBottomSheet;
