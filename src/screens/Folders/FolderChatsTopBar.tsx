/**
 * Top Bar of the folder chats screen.
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
import {useBottomNavContext} from 'src/context/BottomNavContext';
import {BackButton} from '@components/BackButton';

export function FolderChatsTopBar({
  showEdit = true,
}: {
  showEdit?: boolean;
}): ReactNode {
  const navigation = useNavigation<any>();
  const {
    setIsChatActionBarVisible,
    selectionMode,
    setSelectionMode,
    selectedConnections,
    setSelectedConnections,
    totalFolderUnreadCount,
    selectedFolderData,
    setFolderConnections,
    setTotalFolderUnreadCount,
  } = useBottomNavContext();
  const title = useMemo(() => {
    if (totalFolderUnreadCount) {
      return `${selectedFolderData?.name} (${totalFolderUnreadCount})`;
    } else {
      return selectedFolderData?.name || '';
    }
  }, [totalFolderUnreadCount, selectedFolderData]);
  const handleCancel = () => {
    setSelectedConnections([]);
    setSelectionMode(false);
    setIsChatActionBarVisible(false);
  };
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
    {
      assetName: 'SettingsIcon',
      light: require('@assets/light/icons/Settings.svg').default,
      dark: require('@assets/dark/icons/Settings.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CloseIcon = results.CloseIcon;
  const SettingsIcon = results.SettingsIcon;

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
          <BackButton
            onPress={() => {
              setFolderConnections(null);
              setTotalFolderUnreadCount(0);
              navigation.navigate('Folders');
            }}
            style={{
              marginRight: PortSpacing.tertiary.right,
              width: 24,
              alignItems: 'center',
              paddingTop: 13,
            }}
          />
          <View style={styles.menuLeft}>
            <NumberlessText
              numberOfLines={1}
              textColor={Colors.primary.mainelements}
              ellipsizeMode="tail"
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}>
              {showEdit ? `${title}` : `Move chats to ${title}`}
            </NumberlessText>
          </View>
          {showEdit && (
            <View style={{paddingLeft: 4}}>
              {selectedFolderData && (
                <Pressable
                  style={styles.iconWrapper}
                  onPress={() => {
                    navigation.navigate('EditFolder', {
                      selectedFolder: selectedFolderData,
                    });
                  }}>
                  <SettingsIcon
                    style={{marginRight: 4}}
                    width={20}
                    height={20}
                  />
                  <NumberlessText
                    numberOfLines={1}
                    textColor={Colors.text.primary}
                    fontType={FontType.md}
                    fontSizeType={FontSizeType.m}>
                    Edit Settings
                  </NumberlessText>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    bar: {
      height: TOPBAR_HEIGHT,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary.surface,
      borderBottomColor: colors.primary.stroke,
      borderBottomWidth: 0.5,
    },
    selectedBar: {
      height: TOPBAR_HEIGHT,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary.surface,
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
      flex: 1,
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
      borderRadius: PortSpacing.tertiary.uniform,
      borderWidth: 1,
      borderColor: colors.primary.mainelements,
      height: 36,
      justifyContent: 'center',
      paddingHorizontal: PortSpacing.tertiary.uniform,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedCount: {
      color: colors.labels.text,
      overflow: 'hidden',
      width: screen.width / 2,
    },
    crossBox: {
      backgroundColor: colors.primary.surface,
      alignItems: 'flex-end',
      height: 40,
      top: 7,
      width: 40,
    },
  });
