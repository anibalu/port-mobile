import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {PortSpacing} from './ComponentUtils';
import DynamicColors from './DynamicColors';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import SimpleCard from './Reusable/Cards/SimpleCard';

// TODO: why is the legal card called the "help card?"
const HelpCard = () => {
  const navigation = useNavigation();
  const onPress = () => {
    navigation.push('HelpScreen');
  };

  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'LegalHammer',
      light: require('@assets/light/icons/LegalHammer.svg').default,
      dark: require('@assets/dark/icons/LegalHammer.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const LegalHammer = results.LegalHammer;
  const BlackAngleRight = results.AngleRight;

  return (
    <SimpleCard style={styles.card}>
      <Pressable style={styles.button} onPress={() => onPress()}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <LegalHammer height={20} width={20} />
          <NumberlessText
            style={{marginLeft: PortSpacing.tertiary.left}}
            textColor={Colors.text.primary}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Legal
          </NumberlessText>
        </View>
        <View style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
          <BlackAngleRight />
        </View>
      </Pressable>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingHorizontal: PortSpacing.secondary.uniform,
    marginTop: PortSpacing.secondary.top,
    paddingVertical: 0,
  },
  button: {
    paddingVertical: PortSpacing.secondary.uniform,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default HelpCard;
