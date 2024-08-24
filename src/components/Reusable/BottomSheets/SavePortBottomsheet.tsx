/**
 * Responsible for allowing the user to save a port.
 */

import React, {useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import SimpleInput from '../Inputs/SimpleInput';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {MIN_NAME_LENGTH, NAME_LENGTH_LIMIT} from '@configs/constants';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import {PortTable} from '@utils/Storage/DBCalls/ports/interfaces';
import {cleanDeletePort, updateGeneratedPortLabel} from '@utils/Ports';
import {useNavigation} from '@react-navigation/native';
import DynamicColors from '@components/DynamicColors';

const SavePortBottomsheet = ({
  visible,
  onClose,
  contactName,
  setContactName,
  qrData,
}: {
  visible: boolean;
  onClose: () => void;
  contactName: string;
  setContactName: (name: string) => void;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
}) => {
  const [newName, setNewName] = useState<string>(contactName);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  //whether the user wants to keep the port
  const [shouldKeepPort, setShouldKeepPort] = useState<boolean>(false);
  const navigation = useNavigation();
  const onEnterContactName = async () => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      setContactName(newName);
      if (qrData) {
        await updateGeneratedPortLabel(qrData.portId, newName);
      }
      setIsLoading(false);
      onClose();
      navigation.goBack();
    } catch (error) {
      console.error('ERROR SAVING PORT: ', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  const onDeletePort = async () => {
    try {
      setIsDeleting(true);
      Keyboard.dismiss();
      if (qrData) {
        await cleanDeletePort(qrData.portId, PortTable.generated);
      }
      setIsDeleting(false);
      onClose();
      navigation.goBack();
    } catch (error) {
      console.error('ERROR DELETING PORT: ', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const Colors = DynamicColors();

  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      title={
        shouldKeepPort ? "Enter contact's name" : 'QR code scan not detected'
      }
      titleStyle={styles.title}
      onClose={() => {
        setShouldKeepPort(false);
        onClose();
      }}>
      <View style={styles.mainWrapper}>
        {shouldKeepPort ? (
          <>
            <View style={{marginBottom: PortSpacing.secondary.bottom}}>
              <NumberlessText
                style={{
                  color: Colors.text.subtitle,
                  marginBottom: PortSpacing.secondary.bottom,
                }}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                Please enter the name of the contact to save this as a pending
                Port.
              </NumberlessText>
              <SimpleInput
                placeholderText="Contact name"
                maxLength={NAME_LENGTH_LIMIT}
                text={newName}
                setText={setNewName}
                bgColor="w"
              />
            </View>
            <PrimaryButton
              buttonText={'Save Port'}
              primaryButtonColor={'b'}
              isLoading={isLoading}
              disabled={newName.trim().length >= MIN_NAME_LENGTH ? false : true}
              onClick={onEnterContactName}
            />
          </>
        ) : (
          <View style={styles.optionsBox}>
            <NumberlessText
              style={{
                color: Colors.text.subtitle,
                marginBottom: PortSpacing.secondary.bottom,
              }}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              This might occur if either you or the individual you're attempting
              to connect with is offline. You can keep the port open to form the
              connection once internet connection is available.
            </NumberlessText>
            <PrimaryButton
              buttonText={'Keep Port Open'}
              primaryButtonColor={'b'}
              isLoading={false}
              disabled={false}
              onClick={() => setShouldKeepPort(true)}
            />
            <PrimaryButton
              buttonText={'Delete Port'}
              primaryButtonColor={'r'}
              isLoading={isDeleting}
              disabled={false}
              onClick={onDeletePort}
            />
          </View>
        )}
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 24,
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  title: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
  },
  optionsBox: {
    width: '100%',
    marginBottom: PortSpacing.secondary.bottom,
    gap: PortSpacing.medium.uniform,
  },
});

export default SavePortBottomsheet;
