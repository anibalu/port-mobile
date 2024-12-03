import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {useNavigation} from '@react-navigation/native';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const FolderPlaceholderQuickActions = ({
  selectedFolder,
  name,
  avatar,
}: {
  selectedFolder: FolderInfo;
  name: string;
  avatar: FileAttributes;
}) => {
  const navigation = useNavigation();
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    // 1.Files
    {
      assetName: 'Files',
      light: require('@assets/light/icons/MoveToFolder.svg').default,
      dark: require('@assets/dark/icons/MoveToFolder.svg').default,
    },
    // 2. Superport
    {
      assetName: 'Superport',
      light: require('@assets/light/icons/CreateSuperport.svg').default,
      dark: require('@assets/dark/icons/CreateSuperport.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Files = results.Files;
  const Superport = results.Superport;
  return (
    <>
      <NumberlessText
        style={{color: Colors.text.primary}}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        Quick actions
      </NumberlessText>
      <View style={styles.row}>
        <View style={styles.button}>
          <OptionWithChevron
            labelActiveState={false}
            IconLeft={Files}
            heading="Move contacts to a chat folder"
            onClick={() =>
              navigation.push('MoveToFolder', {
                selectedFolder: {...selectedFolder},
              })
            }
          />
        </View>
        <View style={styles.button}>
          <OptionWithChevron
            labelActiveState={false}
            IconLeft={Superport}
            heading="Create a new Superport"
            onClick={() =>
              navigation.push('SuperportSetupScreen', {
                name: name,
                avatar: avatar,
                selectedFolder: {...selectedFolder},
              })
            }
          />
        </View>
      </View>
    </>
  );
};

const styling = colors =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.primary.surface,
      paddingVertical: PortSpacing.tertiary.uniform,
      borderRadius: 16,
    },
    row: {
      width: '100%',
      rowGap: 10,
      marginTop: PortSpacing.tertiary.top,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
  });

export default FolderPlaceholderQuickActions;
