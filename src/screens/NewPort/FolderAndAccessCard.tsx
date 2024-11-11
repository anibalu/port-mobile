import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {useTheme} from 'src/context/ThemeContext';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import getPermissionIcon from '@components/getPermissionIcon';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const FolderAndAccessCard = ({
  chosenFolder,
  onEditClick,
  permissionsArray,
}: {
  permissionsArray: PermissionsStrict;
  chosenFolder: FolderInfo;
  onEditClick: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const {themeValue} = useTheme();

  //whether folder and access should be hidden
  const [hideAccess, setHideAccess] = useState(false);

  const svgArray = [
    {
      assetName: 'EyeIcon',
      light: require('@assets/light/icons/EyeIcon.svg').default,
      dark: require('@assets/dark/icons/EyeIcon.svg').default,
    },
    {
      assetName: 'PencilIcon',
      light: require('@assets/light/icons/PencilIcon.svg').default,
      dark: require('@assets/dark/icons/PencilIcon.svg').default,
    },
    {
      assetName: 'EyeDisabled',
      light: require('@assets/light/icons/EyeDisabled.svg').default,
      dark: require('@assets/dark/icons/EyeDisabled.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const EyeIcon = results.EyeIcon;
  const PencilIcon = results.PencilIcon;
  const EyeDisabled = results.EyeDisabled;

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
        <NumberlessText
          style={{
            color: Colors.text.primary,
          }}
          fontType={FontType.sb}
          fontSizeType={FontSizeType.l}>
          Folder and Access
        </NumberlessText>
        <View
          style={{
            flexDirection: 'row',
            gap: PortSpacing.tertiary.uniform,
          }}>
          <TouchableOpacity
            onPress={() => {
              setHideAccess(p => !p);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              width: 40,
              borderRadius: 40,
              borderWidth: 0.5,
              borderColor: Colors.primary.stroke,
            }}>
            {!hideAccess ? (
              <EyeIcon width={20} height={20} />
            ) : (
              <EyeDisabled width={20} height={20} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEditClick}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              width: 40,
              borderRadius: 40,
              borderWidth: 0.5,
              borderColor: Colors.primary.stroke,
            }}>
            <PencilIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>
      {!hideAccess && (
        <>
          <View style={styles.folderWrapper}>
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
                {chosenFolder.name}
              </NumberlessText>
            </View>
          </View>
          <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
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
                marginTop: PortSpacing.medium.top,
              }}>
              {Object.entries(permissionsArray)
                .filter(([key]) => key !== 'favourite') // Exclude 'favourite'
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
        </>
      )}
    </View>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    headingWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    folderWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 0.5,
      borderTopColor: color.primary.stroke,
      paddingTop: PortSpacing.medium.top,
    },
  });

export default FolderAndAccessCard;
