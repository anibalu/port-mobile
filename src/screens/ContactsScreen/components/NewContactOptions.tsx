import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import { checkAndAskContactPermission } from '@utils/AppPermissions';

import Contact from '@assets/icons/NewContacts/Contact.svg';
import Group from '@assets/icons/NewContacts/Group.svg';
import Port from '@assets/icons/NewContacts/Port.svg';

import { ToastType, useToast } from 'src/context/ToastContext';

const NewContactOptions = () => {
  const Colors = useColors();
  const styles = styling(Colors);
  const navigation = useNavigation();
  const { showToast } = useToast();
  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useSVG(svgArray);

  const BlackAngleRight = results.AngleRight;
  const onInviteClicked = async () => {
    const granted = await checkAndAskContactPermission();
    if (granted) {
      navigation.navigate('PhoneContactList');
    } else {
      showToast(
        'To invite contacts, Port needs access to your contacts. You can enable this permission in your device settings.',
        ToastType.error,
      );
    }
  };

  return (
    <GradientCard style={styles.card}>
      <Pressable onPress={onInviteClicked} style={StyleSheet.compose(
        {
          borderBottomWidth: 0.5,
        },
        styles.rowItem,
      )}>
        <View style={{ flexDirection: 'row', gap: Spacing.m }}>
          <Contact />
          <NumberlessText
            style={{ color: Colors.text.title }}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.m}>
            Invite your phone contacts
          </NumberlessText>
        </View>
        <BlackAngleRight />
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate('NewPortScreen')}
        style={StyleSheet.compose(
          {
            borderBottomWidth: 0.5,
          },
          styles.rowItem,
        )}>
        <View style={{ flexDirection: 'row', gap: Spacing.m }}>
          <Port />
          <NumberlessText
            style={{ color: Colors.text.title }}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.m}>
            New Port
          </NumberlessText>
        </View>
        <BlackAngleRight />
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate('CreateNewGroup')}
        style={styles.rowItem}>
        <View style={{ flexDirection: 'row', gap: Spacing.m }}>
          <Group />
          <NumberlessText
            style={{ color: Colors.text.title }}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.m}>
            New Group
          </NumberlessText>
        </View>
        <BlackAngleRight />
      </Pressable>
    </GradientCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    rowItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomColor: color.stroke,
      paddingVertical: Spacing.l,
    },
    card: {
      paddingHorizontal: Spacing.l,
      backgroundColor: color.surface,
    },
  });

export default NewContactOptions;
