import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useTheme} from 'src/context/ThemeContext';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import getPermissionIcon from '@components/getPermissionIcon';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';

const SuperportLinkedFolderCard = ({
  toggleState,
  label,
  chosenFolder,
  onChooseFolder,
  onEditFolder,
  permissionsArray,
  autoFolderCreateToggle,
}: {
  autoFolderCreateToggle: boolean;
  permissionsArray: PermissionsStrict;
  chosenFolder: FolderInfo;
  onChooseFolder: () => void;
  onEditFolder: () => void;
  toggleState: boolean;
  label: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'FilterIcon',
      light: require('@assets/light/icons/Folder.svg').default,
      dark: require('@assets/dark/icons/Folder.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const FilterIcon = results.FilterIcon;
  const AngleRight = results.AngleRight;

  const {themeValue} = useTheme();

  return (
    <View
      style={{
        padding: PortSpacing.secondary.uniform,
        borderWidth: 0.5,
        borderColor: Colors.primary.stroke,
        borderRadius: PortSpacing.secondary.uniform,
        gap: PortSpacing.medium.uniform,
      }}>
      <View style={styles.headingWrapper}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <FilterIcon width={20} height={20} />
          <NumberlessText
            style={{
              color: Colors.text.primary,
              marginLeft: PortSpacing.tertiary.left,
            }}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Linked folder
          </NumberlessText>
        </View>
        <TouchableOpacity
          onPress={
            toggleState && autoFolderCreateToggle
              ? onEditFolder
              : onChooseFolder
          }
          style={{
            flexDirection: 'row',
            gap: 4,
            alignItems: 'center',
            backgroundColor: Colors.primary.surface2,
            borderRadius: PortSpacing.secondary.uniform,
            padding: PortSpacing.tertiary.uniform,
          }}>
          <NumberlessText
            style={{
              color: Colors.text.primary,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            {!autoFolderCreateToggle
              ? 'change '
              : toggleState
              ? 'Edit '
              : 'Choose folder'}
          </NumberlessText>
          <AngleRight width={16} height={16} />
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <NumberlessText
          style={{flex: 1}}
          textColor={Colors.text.primary}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          Contacts will be added to :
        </NumberlessText>
        <View
          style={{
            backgroundColor:
              themeValue === 'light'
                ? Colors.lowAccentColors.violet
                : Colors.primary.accent,
            borderRadius: PortSpacing.secondary.uniform,
            padding: PortSpacing.tertiary.uniform,
            maxWidth: 110,
          }}>
          <NumberlessText
            numberOfLines={1}
            style={{width: '100%'}}
            ellipsizeMode="tail"
            textColor={
              themeValue === 'dark'
                ? Colors.primary.white
                : Colors.primary.accent
            }
            fontType={FontType.sb}
            fontSizeType={FontSizeType.s}>
            {toggleState && autoFolderCreateToggle ? label : chosenFolder.name}
          </NumberlessText>
        </View>
      </View>
      <View style={{gap: PortSpacing.secondary.bottom}}>
        <NumberlessText
          style={{flex: 1}}
          textColor={Colors.text.primary}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          Access levels :
        </NumberlessText>
        <View
          style={{
            flexDirection: 'row',
            gap: PortSpacing.tertiary.uniform,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
          {Object.entries(permissionsArray)
            .filter(([key]) => key !== 'disappearingMessages')
            .map(permission => {
              const PermissionIcon = getPermissionIcon([
                permission[0],
                permission[1],
                themeValue,
              ]);
              return (
                <View
                  key={permission[0]}
                  style={{
                    flexDirection: 'row',
                    gap: PortSpacing.tertiary.uniform,
                    alignItems: 'center',
                  }}>
                  <View>{PermissionIcon}</View>
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    headingWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: PortSpacing.tertiary.bottom,
      borderBottomWidth: 0.5,
      borderBottomColor: color.primary.stroke,
      paddingBottom: PortSpacing.medium.bottom,
    },
  });

export default SuperportLinkedFolderCard;
