/**
 * Top Bar of the home screen containing sidebar menu, pending request count and search.
 */
import {PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TOPBAR_HEIGHT} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import React, {ReactNode, useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {GenericButton} from '@components/GenericButton';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import ContactBook from '@assets/icons/ContactBook.svg';
import {useTheme} from 'src/context/ThemeContext';
import Scanner from '@assets/icons/ScannerDarkGreen.svg';

function HomeTopbar({
  unread = 0,
  setIsChatActionBarVisible,
  selectionMode,
  setSelectionMode,
  selectedConnections,
  setSelectedConnections,
}: {
  unread?: number;
  setIsChatActionBarVisible: (visible: boolean) => void;
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  selectedConnections: any[];
  setSelectedConnections: (connections: any[]) => void;
}): ReactNode {
  const title = useMemo(() => {
    if (unread) {
      return `Home (${unread})`;
    } else {
      return 'Home';
    }
  }, [unread]);
  const navigation = useNavigation<any>();

  const handleCancel = () => {
    setSelectedConnections([]);
    setSelectionMode(false);
    setIsChatActionBarVisible(false);
  };
  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const styles = styling(Colors, themeValue);

  const svgArray = [
    {
      assetName: 'SidebarMenu',
      light: require('@assets/light/icons/SidebarMenu.svg').default,
      dark: require('@assets/dark/icons/SidebarMenu.svg').default,
    },
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
    {
      assetName: 'FolderSettingsIcon',
      light: require('@assets/light/icons/FolderSettings.svg').default,
      dark: require('@assets/dark/icons/FolderSettings.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const CloseIcon = results.CloseIcon;

  return (
    <>
      {selectionMode ? (
        <View style={styles.selectedBar}>
          <View style={styles.profileBar}>
            <View style={styles.titleBar}>
              <NumberlessText
                fontSizeType={FontSizeType.xl}
                fontType={FontType.sb}
                ellipsizeMode="tail"
                style={styles.selectedCount}
                numberOfLines={1}>
                {'Selected (' + selectedConnections.length.toString() + ')'}
              </NumberlessText>
            </View>
            <View>
              <GenericButton
                buttonStyle={styles.crossBox}
                IconLeft={CloseIcon}
                onPress={handleCancel}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.bar}>
          <View style={styles.menuLeft}>
            <NumberlessText
              numberOfLines={1}
              textColor={Colors.primary.mainelements}
              ellipsizeMode="tail"
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}>
              {title}
            </NumberlessText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: PortSpacing.tertiary.uniform,
            }}>
            <Pressable
              style={styles.scanIconWrapper}
              onPress={() => navigation.push('Scan')}>
              <Scanner width={20} height={20} />
            </Pressable>
            <Pressable
              style={styles.iconWrapper}
              onPress={() => navigation.push('ContactsScreen')}>
              <ContactBook width={24} height={24} />
              <NumberlessText
                numberOfLines={1}
                textColor={Colors.primary.white}
                ellipsizeMode="tail"
                fontType={FontType.sb}
                fontSizeType={FontSizeType.s}>
                Contacts
              </NumberlessText>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}

const styling = (colors: any, themeValue: any) =>
  StyleSheet.create({
    bar: {
      height: TOPBAR_HEIGHT,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
      borderBottomColor: colors.primary.stroke,
      borderBottomWidth: 0.5,
    },
    selectedBar: {
      height: TOPBAR_HEIGHT,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
      borderBottomColor: colors.primary.stroke,
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
      gap: PortSpacing.tertiary.uniform,
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
    scanIconWrapper: {
      height: 36,
      paddingHorizontal: PortSpacing.tertiary.uniform,
      borderRadius: 100,
      flexDirection: 'row',
      backgroundColor: colors.primary.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapper: {
      height: 36,
      paddingHorizontal: 11,
      borderRadius: PortSpacing.intermediate.uniform,
      flexDirection: 'row',
      gap: 6,
      backgroundColor: colors.primary.blue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedCount: {
      color: colors.labels.text,
      overflow: 'hidden',
      width: screen.width / 2,
    },
    crossBox: {
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
      alignItems: 'flex-end',
      height: 40,
      top: 7,
      width: 40,
    },
  });

export default HomeTopbar;
