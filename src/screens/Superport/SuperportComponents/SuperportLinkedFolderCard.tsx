import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React, {useMemo} from 'react';
import {Pressable, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {folderIdToHex} from '@utils/Folders/folderIdToHex';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {SvgXml} from 'react-native-svg';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useNavigation} from '@react-navigation/native';

const SuperportLinkedFolderCard = ({
  title,
  subtitle,
  label,
  setOpenModal,
  selectedFolder,
  showFolderRedirectionIcon = true,
  allowFolderRedirection = false,
}: {
  title: string;
  subtitle: string;
  label: string | number | null;
  setOpenModal: (p: boolean) => void;
  selectedFolder?: FolderInfo | null;
  showFolderRedirectionIcon?: boolean;
  allowFolderRedirection?: boolean;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const navigation = useNavigation();

  const svgArray = [
    {
      assetName: 'PencilFilled',
      light: require('@assets/light/icons/PencilFilled.svg').default,
      dark: require('@assets/dark/icons/PencilFilled.svg').default,
    },
    {
      assetName: 'Plus',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const PencilFilled = results.PencilFilled;
  const Plus = results.Plus;

  const lightFolderColor = useMemo(
    () =>
      selectedFolder &&
      folderIdToHex(selectedFolder.folderId, Colors.lowAccentColors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedFolder],
  );

  const folderColor = useMemo(
    () =>
      selectedFolder &&
      folderIdToHex(selectedFolder.folderId, Colors.boldAccentColors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedFolder],
  );

  const redirectToFolder = () => {
    if (allowFolderRedirection && showFolderRedirectionIcon) {
      navigation.navigate('FolderStack', {
        screen: 'FolderChats',
        params: {
          folder: selectedFolder,
        },
      });
    }
  };

  const getSvgXml = (color: string) => {
    return `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 15L13 10L8 5" stroke=${color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  };

  return (
    <SimpleCard style={styles.mainCard}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <NumberlessText
          style={{flex: 1}}
          textColor={Colors.text.primary}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.l}>
          {title}
        </NumberlessText>
        <TouchableOpacity
          onPress={() => setOpenModal(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.primary.surface2,
            paddingVertical: PortSpacing.tertiary.uniform,
            paddingHorizontal: PortSpacing.medium.uniform,
            borderRadius: 20,
            gap: 4,
          }}>
          {label ? (
            <PencilFilled height={12} width={12} />
          ) : (
            <Plus height={12} width={12} />
          )}
          <NumberlessText
            textColor={Colors.primary.mainelements}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            {label ? 'Change folder' : 'Add Folder'}
          </NumberlessText>
        </TouchableOpacity>
      </View>
      <View>
        <NumberlessText
          style={{color: Colors.text.subtitle}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          {subtitle}
        </NumberlessText>
      </View>
      {label && (
        <Pressable
          onPress={redirectToFolder}
          style={{
            backgroundColor: lightFolderColor ?? Colors.primary.surface2,
            paddingHorizontal: PortSpacing.secondary.uniform,
            paddingVertical: PortSpacing.medium.uniform,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            borderRadius: 40,
            flexDirection: 'row',
          }}>
          <NumberlessText
            textColor={folderColor ?? Colors.text.subtitle}
            fontType={FontType.md}
            fontSizeType={FontSizeType.l}>
            {label}
          </NumberlessText>
          {showFolderRedirectionIcon && (
            <SvgXml
              xml={getSvgXml(folderColor ? folderColor : Colors.text.primary)}
            />
          )}
        </Pressable>
      )}
    </SimpleCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    errorContainer: {
      position: 'absolute',
      top: -PortSpacing.intermediate.top,
      left: 0,
      color: color.primary.red,
      paddingLeft: PortSpacing.tertiary.left,
      paddingTop: 2,
    },
    inputcard: {
      borderWidth: 1,
      borderColor: color.primary.red,
      borderRadius: 16,
      overflow: 'hidden',
    },
    mainCard: {
      paddingVertical: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      gap: PortSpacing.medium.uniform,
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  });

export default SuperportLinkedFolderCard;
