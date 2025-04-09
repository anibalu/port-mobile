import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

/**
 * Generic Title component
 * @param title - The title to display
 * @returns {React.ReactElement}
 */
const GenericTitle = ({title}: {title: string}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.container}>
      <NumberlessText
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.xl}
        fontType={FontType.sb}>
        {title}
      </NumberlessText>
    </View>
  );
};
const styling = (Colors: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      height: 64,
      justifyContent: 'center',
      backgroundColor: Colors.primary.background,
    },
  });

export default GenericTitle;
