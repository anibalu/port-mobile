import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {ThemeType,themeOptions} from '@utils/Themes';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {PortSpacing} from './ComponentUtils';
import DynamicColors from './DynamicColors';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import ThemeBottomsheet from './Reusable/BottomSheets/ThemeBottomsheet';
import SimpleCard from './Reusable/Cards/SimpleCard';

const ThemeCard = ({
  selected,
  setSelected,
}: {
  selected: ThemeType;
  setSelected: (value: ThemeType) => void;
}) => {
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const onForwardPress = () => {
    setOpenBottomSheet(p => !p);
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);
  function getKeyByValue(value: ThemeType): string | undefined {
    const themeOption = themeOptions.find(option => option.value === value);
    return themeOption ? themeOption.key : undefined;
  }
  const currTheme = getKeyByValue(selected);
  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
    {
      assetName: 'AppearanceIcon',
      light: require('@assets/light/icons/Appearance.svg').default,
      dark: require('@assets/dark/icons/Appearance.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const BlackAngleRight = results.AngleRight;
  const AppearanceIcon = results.AppearanceIcon;

  return (
    <SimpleCard style={styles.card}>
      <Pressable onPress={() => onForwardPress()} style={styles.title}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <AppearanceIcon height={20} width={20} />
          <NumberlessText
            style={{marginLeft: PortSpacing.tertiary.left}}
            textColor={Colors.labels.text}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Appearance
          </NumberlessText>
        </View>
        <View style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
          <View style={styles.pill}>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              {currTheme}
            </NumberlessText>
          </View>
          <BlackAngleRight />
        </View>
      </Pressable>
      <ThemeBottomsheet
        selected={selected}
        setSelected={setSelected}
        setShowThemeBottomsheet={setOpenBottomSheet}
        showThemeBottomsheet={openBottomSheet}
      />
    </SimpleCard>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    card: {
      width: '100%',
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.primary.top,
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pill: {
      backgroundColor: colors.primary.lightgrey,
      paddingHorizontal: 6,
      paddingVertical: 5,
      borderRadius: 6,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      alignSelf: 'flex-end',
    },
  });

export default ThemeCard;
