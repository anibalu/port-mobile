import React from 'react';
import {StyleSheet, View} from 'react-native';

import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';


/**
 * Generic Title component
 * @param title - The title to display
 * @returns {React.ReactElement}
 */
const GenericTitle = ({title}: {title: string}) => {
  const Colors = useColors()
  const styles = styling(Colors);
  return (
    <View style={styles.container}>
      <NumberlessText
        textColor={Colors.text.title}
        fontSizeType={FontSizeType.xl}
        fontWeight={FontWeight.sb}
>
        {title}
      </NumberlessText>
    </View>
  );
};
const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.l,
      height: 64,
      justifyContent: 'center',
      backgroundColor:colors.background2
    },
  });

export default GenericTitle;
