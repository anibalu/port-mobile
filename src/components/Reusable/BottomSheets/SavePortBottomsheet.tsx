/**
 * Responsible for allowing the user to save a port.
 */

import React, {useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {safeModalCloseDuration} from '@configs/constants';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import {PortTable} from '@utils/Storage/DBCalls/ports/interfaces';
import {cleanDeletePort} from '@utils/Ports';
import {useNavigation} from '@react-navigation/native';
import DynamicColors from '@components/DynamicColors';
import {wait} from '@utils/Time';

const SavePortBottomsheet = ({
  visible,
  onClose,
  qrData,
}: {
  visible: boolean;
  onClose: () => void;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const navigation = useNavigation();
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

  const onKeepPortOpenAndGoBack = () => {
    onClose();
    wait(safeModalCloseDuration);
    navigation.goBack();
  };

  const Colors = DynamicColors();

  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      title={'QR code scan not detected'}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
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
            onClick={onKeepPortOpenAndGoBack}
          />
          <PrimaryButton
            buttonText={'Delete Port'}
            primaryButtonColor={'r'}
            isLoading={isDeleting}
            disabled={false}
            onClick={onDeletePort}
          />
        </View>
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
