

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import { isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing, Width } from '@components/spacingGuide';




const ConfirmationBottomSheet = ({
  visible,
  onClose,
  onPrimaryButtonConfirm = async () => {},
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onSecondaryButtonConfirm
}: {
  visible: boolean;
  onClose: () => void;
  onPrimaryButtonConfirm?: () => Promise<void>;
  onSecondaryButtonConfirm:()=>void;
  title?: string;
  description?: string;
  primaryButtonText: string;
  secondaryButtonText: string
}) => {
  const [isPrimaryButtonLoading, setIsPrimaryButtonLoading] = useState<boolean>(false);
  const [ isSecondaryButtonLoading, setIsSecondaryButtonLoading] = useState<boolean>(false);
  const onPrimaryButtonClick = async () => {
    setIsPrimaryButtonLoading(true);
    await onPrimaryButtonConfirm();
    setIsPrimaryButtonLoading(false);
    onClose();
  };
  const onSecondaryButtonClick = async () => {
    setIsSecondaryButtonLoading(true);
    await onSecondaryButtonConfirm();
    setIsSecondaryButtonLoading(false);
    onClose();
  };
  const Colors = useColors();
  const styles= styling(Colors)
  return (
    <PrimaryBottomSheet
    bgColor='g'
    shouldAutoClose={false}
      showClose={false}
      visible={visible}
      onClose={onClose}>

<View style={styles.connectionOptionsRegion}>
        <View style={styles.mainContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            {title}
          </NumberlessText>
          <LineSeparator style={{ width: Width.screen }} />
        </View>
      </View>
      <View style={styles.mainWrapper}>
      {description && (
          <View
            style={{ width: '100%', marginBottom: Spacing.m }}>
            <NumberlessText
              style={{ color: Colors.text.subtitle }}
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}
            >
              {description}
            </NumberlessText>
          </View>
        )}
        <PrimaryButton
buttonStyle={styles.primaryButton}
          text={primaryButtonText}
          theme={Colors.theme}
          isLoading={isPrimaryButtonLoading}
          disabled={false}
          onClick={onPrimaryButtonClick}
        />
           <PrimaryButton
           buttonStyle={styles.secondaryButton}
          text={secondaryButtonText}
          theme={Colors.theme}
          isLoading={isSecondaryButtonLoading}
          disabled={false}
          onClick={onSecondaryButtonClick}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styling =(Colors: any)=> StyleSheet.create({
  mainWrapper: {
    flexDirection: 'column',
    width: '100%',
    marginTop: Spacing.l,
    ...(isIOS ? {marginBottom: Spacing.l} : 0),
  },
  title: {
    fontSize: FontSizeType.l,
    fontWeight: FontWeight.md,
  },
  connectionOptionsRegion: {
    width: Width.screen,
    paddingHorizontal: Spacing.l,
  },
  mainContainer: {
    width: '100%',
    paddingTop: Spacing.s,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.m,
  },
  primaryButton:{
    backgroundColor: Colors.red
  },
  secondaryButton:{
    backgroundColor: 'none',
    borderColor: Colors.stroke,
    borderWidth: 0.5,
    marginTop: Spacing.m

  }
});

export default ConfirmationBottomSheet;

