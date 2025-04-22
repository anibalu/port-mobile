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

const PortLabelCard = ({
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
          Contact Name
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
              placeholderText="New contact name"
            />
            <NumberlessText
              style={{marginTop: Spacing.s}}
              textColor={color.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontWeight={FontWeight.rg}>
              You can also edit their name later.
            </NumberlessText>
          </>
      </View>
    </GradientCard>
  );
};

export default PortLabelCard;
