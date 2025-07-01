import React, { useState } from 'react';
import { View } from 'react-native';

import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import SimpleInput from '@components/Inputs/SimpleInput';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';

const PortLabelAndLimitCard = ({
  portName,
  setPortName,
  limit,
  setLimit,
  connectionsMade,
}: {
  portName: string;
  setPortName: (value: string) => void;
  limit: number;
  setLimit: (value: number) => void;
  connectionsMade: number;
}) => {
  const color = useColors();

  const handleLimitChange = (text: string) => {
    setErrorMessage(undefined);
    const numericValue = parseInt(text, 10);
    const finalNumber = isNaN(numericValue) ? 0 : numericValue;
    if (finalNumber < connectionsMade) {
      setErrorMessage(
        'Limit cannot be less than the number of connections made',
      );
      setLimit(finalNumber);
    }
    else if (finalNumber <= 0) {
      setErrorMessage(
        'Limit must be greater than 0',
      );
      setLimit(0);
    }
    else {
      setLimit(finalNumber);
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  return (
    <GradientCard style={{ padding: Spacing.l, paddingVertical: Spacing.l }}>
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
          {'(Port is reusable)'}
        </NumberlessText>
      </View>
      <View
        style={{
          gap: Spacing.s,
        }}>
        <SimpleInput
          setText={setPortName}
          text={portName}
          bgColor="w"
          placeholderText="Label this Port. Ex: “LinkedIn Inbounds”"
          showError={portName.trim() === '' || portName.trim().length === 0}
        />
        {(portName.trim() === '' || portName.trim().length === 0) && (
          <NumberlessText
            fontSizeType={FontSizeType.xs}
            fontWeight={FontWeight.rg}
            textColor={color.red}
            style={{ marginLeft: Spacing.s, marginTop: -Spacing.s }}
          >
            *Label is required.
          </NumberlessText>
        )}
        <SimpleInput
          setText={handleLimitChange}
          text={limit ? limit.toString() : ''}
          bgColor="w"
          keyboardType="numeric"
          placeholderText="How many times can this Port be used?"
          showError={limit < connectionsMade}
        />
        {errorMessage && (
          <NumberlessText
            textColor={color.red}
            fontSizeType={FontSizeType.xs}
            fontWeight={FontWeight.rg}
            style={{ marginLeft: Spacing.s, marginTop: -Spacing.s }}
            >
            *{errorMessage}
          </NumberlessText>
        )}
        <NumberlessText
          style={{ marginTop: Spacing.s }}
          textColor={color.text.subtitle}
          fontSizeType={FontSizeType.s}
          fontWeight={FontWeight.rg}>
          Labelling Ports helps organize them better. Usage limits on Ports can
          be modified later.
        </NumberlessText>
      </View>
    </GradientCard>
  );
};

export default PortLabelAndLimitCard;
