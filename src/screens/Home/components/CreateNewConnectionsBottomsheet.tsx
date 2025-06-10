import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import BaseBottomSheet from '@components/BaseBottomsheet';
import GradientCard from '@components/Cards/GradientCard';
import {useColors} from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import LineSeparator from '@components/Separators/LineSeparator';
import {Spacing, Width} from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

/**
 * A bottom sheet component for creating new connections.
 *
 * @param visible - Whether the bottom sheet is visible
 * @param onClose - Function to call when the bottom sheet is closed
 * @param navigation - Navigation prop for the screen
 */
export default function NewConnectionsBottomsheet({
  visible,
  onClose,
  navigation,
}: {
  visible: boolean;
  onClose: () => void;
  navigation: NativeStackNavigationProp<any>;
}) {
  console.log('[Rendered CreateNewConnectionsBottomsheet]');

  const openNewPortScreen = () => {
    onClose();
    navigation.navigate('NewPortScreen');
  };

  const handleOpenNewGroup = () => {
    onClose();
    navigation.navigate('CreateNewGroup');
  };

  const svgArray = [
    {
      assetName: 'NewPortIcon',
      light: require('@assets/light/icons/NewPort.svg').default,
      dark: require('assets/dark/icons/NewPort.svg').default,
    },
    {
      assetName: 'NewGroupIcon',
      light: require('@assets/light/icons/NewGroup.svg').default,
      dark: require('assets/dark/icons/NewGroup.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useSVG(svgArray);
  const Colors = useColors();
  const styles = styling(Colors);

  const NewPortIcon = results.NewPortIcon;
  const NewGroupIcon = results.NewGroupIcon;
  const AngleRight = results.AngleRight;

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}>
      <View style={styles.connectionOptionsRegion}>
        <View style={styles.mainContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            Create new
          </NumberlessText>
          <LineSeparator style={{width: Width.screen}} />
          <View style={styles.subtitleContainer}>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.l}
              fontWeight={FontWeight.rg}>
              Choose one of the options below
            </NumberlessText>
          </View>
        </View>
        <View style={styles.maincard}>
          <GradientCard style={styles.gradientcard}>
            <Pressable onPress={openNewPortScreen}>
              <View style={styles.row}>
                <NewPortIcon />
                <AngleRight />
              </View>
              <NumberlessText
                style={{marginTop: Spacing.m}}
                textColor={Colors.text.title}
                fontSizeType={FontSizeType.xl}
                fontWeight={FontWeight.sb}>
                New Port
              </NumberlessText>
              <NumberlessText
                style={{marginTop: Spacing.xs}}
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontWeight={FontWeight.rg}>
                Create a QR code/link to add new contacts
              </NumberlessText>
            </Pressable>
          </GradientCard>
          <GradientCard style={styles.gradientcard}>
            <Pressable onPress={handleOpenNewGroup}>
              <View style={styles.row}>
                <NewGroupIcon />
                <AngleRight />
              </View>
              <NumberlessText
                style={{marginTop: Spacing.m}}
                textColor={Colors.text.title}
                fontSizeType={FontSizeType.xl}
                fontWeight={FontWeight.sb}>
                New Group
              </NumberlessText>
              <NumberlessText
                style={{marginTop: Spacing.xs}}
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontWeight={FontWeight.rg}>
                Create a group with other Port users
              </NumberlessText>
            </Pressable>
          </GradientCard>
        </View>
      </View>
    </BaseBottomSheet>
  );
}

const styling = (Colors: any) =>
  StyleSheet.create({
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
    subtitleContainer: {
      width: '100%',
      alignItems: 'flex-start',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    maincard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.l,
    },
    gradientcard: {
      padding: Spacing.l,
      paddingVertical: Spacing.l,
      width: Width.screen / 2 - Spacing.xl,
      backgroundColor: Colors.surface2,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
