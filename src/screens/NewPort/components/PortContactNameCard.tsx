import React from 'react';
import {View} from 'react-native';

import GradientCard from '@components/Cards/GradientCard';
import {useColors} from '@components/colorGuide';
import SimpleInput from '@components/Inputs/SimpleInput';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {Spacing} from '@components/spacingGuide';

const PortContactNameCard = ({
  portName,
  setPortName,
}: {
  portName: string;
  setPortName: (value: string) => void;
}) => {
  const color = useColors();

  return (
    <GradientCard style={{padding: Spacing.l, paddingVertical: Spacing.l}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: Spacing.l,
        }}>
        <NumberlessText
          textColor={color.text.title}
          fontSizeType={FontSizeType.l}
          fontWeight={FontWeight.md}>
          {'(Port is not reusable)'}
        </NumberlessText>
      </View>
      <View
        style={{
          gap: Spacing.s,
        }}>
        <>
          <SimpleInput
            setText={setPortName}
            text={portName}
            bgColor="w"
            placeholderText="Who are you sending this Port to?"
            showError={portName.trim() === '' || portName.trim().length === 0}
          />
          {(portName.trim() === '' || portName.trim().length === 0) && (
            <NumberlessText
              fontSizeType={FontSizeType.xs}
              fontWeight={FontWeight.rg}
              textColor={color.red}
              style={{ marginLeft: Spacing.s, marginTop: -Spacing.s }}
            >
            *Contact name is required.
            </NumberlessText>
          )}
          <NumberlessText
            style={{marginTop: Spacing.s}}
            textColor={color.text.subtitle}
            fontSizeType={FontSizeType.s}
            fontWeight={FontWeight.rg}>
            When a new contact is added using this Port, this will be used as
            their contact name.
          </NumberlessText>
        </>
      </View>
    </GradientCard>
  );
};

export default PortContactNameCard;
