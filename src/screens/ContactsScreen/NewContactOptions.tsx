import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Port from '@assets/icons/NewContacts/Port.svg';
import Group from '@assets/icons/NewContacts/Group.svg';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {Spacing} from '@components/spacingGuide';
import {useColors} from '@components/colorGuide';

const NewContactOptions = () => {
  const Colors = useColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const BlackAngleRight = results.AngleRight;

  return (
    <SimpleCard style={styles.card}>
      <View
        style={StyleSheet.compose(
          {
            borderBottomWidth: 0.5,
          },
          styles.rowItem,
        )}>
        <View style={{flexDirection: 'row', gap: Spacing.m}}>
          <Port />
          <NumberlessText
            style={{color: Colors.text.title}}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.m}>
            New Port
          </NumberlessText>
        </View>
        <BlackAngleRight />
      </View>
      <View style={styles.rowItem}>
        <View style={{flexDirection: 'row', gap: Spacing.m}}>
          <Group />
          <NumberlessText
            style={{color: Colors.text.title}}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.m}>
            New Group
          </NumberlessText>
        </View>
        <BlackAngleRight />
      </View>
    </SimpleCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    rowItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomColor: color.stroke,
      paddingVertical: Spacing.m,
    },
    card: {
      marginHorizontal: Spacing.l,
      paddingHorizontal: Spacing.l,
      backgroundColor: color.surface,
    },
  });

export default NewContactOptions;
