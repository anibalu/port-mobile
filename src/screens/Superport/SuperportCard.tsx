import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import {SuperportData} from '@utils/Storage/DBCalls/ports/superPorts';
import {defaultFolderInfo} from '@configs/constants';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {formatTimeAgo} from '@utils/Time';
import {SvgXml} from 'react-native-svg';
import DynamicColors from '@components/DynamicColors';
import {folderIdToHex} from '@utils/Folders/folderIdToHex';

const SuperportCard = ({
  superportData,
  selectedFolder = defaultFolderInfo,
  onClick,
}: {
  selectedFolder?: FolderInfo;
  superportData: SuperportData;
  onClick: () => void;
}) => {
  const getSvgXml = (color: string) => {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="folder-add">
    <path id="Vector" d="M14.6693 7.33301V11.333C14.6693 13.9997 14.0026 14.6663 11.3359 14.6663H4.66927C2.0026 14.6663 1.33594 13.9997 1.33594 11.333V4.66634C1.33594 1.99967 2.0026 1.33301 4.66927 1.33301H5.66927C6.66927 1.33301 6.88927 1.62634 7.26927 2.13301L8.26927 3.46634C8.5226 3.79967 8.66927 3.99967 9.33594 3.99967H11.3359C14.0026 3.99967 14.6693 4.66634 14.6693 7.33301Z" stroke=${color} stroke-width="1.5" stroke-miterlimit="10"/>
    </g>
    </svg>`;
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);
  const folderColor =
    selectedFolder &&
    folderIdToHex(selectedFolder?.folderId, Colors.boldAccentColors);

  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.8}>
      <SimpleCard
        style={{
          paddingVertical: PortSpacing.secondary.uniform,
          marginBottom: PortSpacing.tertiary.bottom,
        }}>
        <View style={styles.headerContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <SvgXml xml={getSvgXml(folderColor)} />
            <NumberlessText
              style={{
                color: folderColor,
                marginLeft: PortSpacing.tertiary.left,
              }}
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}>
              {selectedFolder.name}
            </NumberlessText>
          </View>
          <NumberlessText
            style={{
              color: Colors.text.subtitle,
              marginLeft: PortSpacing.tertiary.left,
            }}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {formatTimeAgo(superportData.usedOnTimestamp)}
          </NumberlessText>
        </View>
        <View style={styles.titleWrapper}>
          <NumberlessText
            textColor={Colors.text.primary}
            fontSizeType={FontSizeType.l}
            fontType={FontType.rg}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {superportData.label === ''
              ? 'Superport #' + superportData.portId
              : superportData.label}
          </NumberlessText>
        </View>
        <View style={styles.footerContainer}>
          <NumberlessText
            style={{
              color: true ? Colors.text.subtitle : Colors.primary.red,
              paddingTop: PortSpacing.tertiary.uniform,
            }}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {`Connections: ${superportData.connectionsMade}/${superportData.connectionsLimit}   •   `}
          </NumberlessText>
          <NumberlessText
            style={{
              color: superportData.paused
                ? Colors.primary.red
                : Colors.text.subtitle,
              paddingTop: PortSpacing.tertiary.uniform,
            }}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {!superportData.paused
              ? `${
                  superportData.connectionsLimit - superportData.connectionsMade
                } left until paused`
              : 'Paused'}
          </NumberlessText>
        </View>
      </SimpleCard>
    </TouchableOpacity>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    footerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexWrap: 'wrap',
    },
    titleWrapper: {
      color: PortColors.title,
      paddingVertical: PortSpacing.tertiary.uniform,
      borderBottomColor: colors.primary.stroke,
      borderBottomWidth: 0.5,
      marginHorizontal: PortSpacing.secondary.uniform,
    },
    headerContainer: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

export default SuperportCard;
