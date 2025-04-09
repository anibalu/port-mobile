import React from 'react';

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';

const Back = () => {
  const Colors = DynamicColors();
  return (
    <SimpleCard
      style={{
        backgroundColor: Colors.primary.surface,
        marginHorizontal: 10,
        height: 180,
      }}>
      <NumberlessText
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.l}
        fontType={FontType.md}>
        Back SIDEEE
      </NumberlessText>
    </SimpleCard>
  );
};

export default Back;
