/**
 * Top Bar of the home screen containing sidebar menu, pending request count and search.
 */
import React, { ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useColors } from '@components/colorGuide';
import { screen } from '@components/ComponentUtils';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import { TOPBAR_HEIGHT } from '@configs/constants';

import { useTheme } from 'src/context/ThemeContext';

function HomeTopbar({
  unread = 0,
}: {
  unread?: number;
}): ReactNode {
  const title = useMemo(() => {
    if (unread) {
      return `Home (${unread})`;
    } else {
      return 'Home';
    }
  }, [unread]);
  const navigation = useNavigation<any>();

  const Colors = useColors();
  const { themeValue } = useTheme();
  const styles = styling(Colors, themeValue);

  const svgArray = [
    {
      assetName: 'SidebarMenu',
      light: require('@assets/light/icons/SidebarMenu.svg').default,
      dark: require('@assets/dark/icons/SidebarMenu.svg').default,
    },
    {
      assetName: 'FolderSettingsIcon',
      light: require('@assets/light/icons/FolderSettings.svg').default,
      dark: require('@assets/dark/icons/FolderSettings.svg').default,
    },
    {
      assetName: 'ContactBook',
      light: require('@assets/light/icons/ContactBook.svg').default,
      dark: require('@assets/dark/icons/ContactBook.svg').default,
    },
    {
      assetName: 'ScanQR',
      light: require('@assets/light/icons/ScanQR.svg').default,
      dark: require('@assets/dark/icons/ScanQR.svg').default,
    },
  ];

  const results = useSVG(svgArray);

  const ContactBook = results.ContactBook;
  const ScanQR = results.ScanQR;

  return (
    <View style={styles.bar}>
      <View style={styles.menuLeft}>
        <NumberlessText
          numberOfLines={1}
          textColor={Colors.text.title}
          ellipsizeMode="tail"
          fontWeight={FontWeight.sb}
          fontSizeType={FontSizeType.xl}>
          {title}
        </NumberlessText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.s,
        }}>
        <Pressable
          style={styles.iconWrapper}
          onPress={() => navigation.push('Scan')}>
          <ScanQR width={20} height={20} />
          <NumberlessText
            numberOfLines={1}
            textColor={Colors.text.subtitle}
            ellipsizeMode="tail"
            fontWeight={FontWeight.sb}
            fontSizeType={FontSizeType.s}>
            Scan
          </NumberlessText>
        </Pressable>
        <Pressable
          style={styles.iconWrapper}
          onPress={() => navigation.push('ContactsScreen')}>
          <ContactBook width={20} height={20} />
          <NumberlessText
            numberOfLines={1}
            textColor={Colors.text.subtitle}
            ellipsizeMode="tail"
            fontWeight={FontWeight.sb}
            fontSizeType={FontSizeType.s}>
            Contacts
          </NumberlessText>
        </Pressable>
      </View>
    </View>
  );
}

const styling = (colors: any, themeValue: any) =>
  StyleSheet.create({
    bar: {
      height: TOPBAR_HEIGHT,
      paddingHorizontal: Spacing.l,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor:
        themeValue === 'dark'
          ? colors.background
          : colors.surface,

    },
    selectedBar: {
      height: TOPBAR_HEIGHT,
      paddingHorizontal: Spacing.l,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor:
        themeValue === 'dark'
          ? colors.background
          : colors.surface,
      borderBottomColor: colors.stroke,
      borderBottomWidth: 0.5,
    },
    profileBar: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleBar: {
      flex: 1,
      maxWidth: '60%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: Spacing.s,
    },
    text: {
      height: '100%',
      width: '100%',
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    modal: {
      margin: 0,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    menuLeft: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    backgroundImage: {
      width: 50,
      height: 50,
      position: 'absolute',
      resizeMode: 'cover',
    },
    iconWrapper: {
      height: 40,
      paddingHorizontal: Spacing.s,
      borderRadius: Spacing.xml,
      flexDirection: 'row',
      backgroundColor: colors.surface3,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 0.5,
      borderColor: colors.stroke
    },
    selectedCount: {
      color: colors.text.title,
      overflow: 'hidden',
      width: screen.width / 2,
    },
    crossBox: {
      backgroundColor:
        themeValue === 'dark'
          ? colors.background
          : colors.surface,
      alignItems: 'flex-end',
      height: 40,
      top: 7,
      width: 40,
    },
  });

export default HomeTopbar;
