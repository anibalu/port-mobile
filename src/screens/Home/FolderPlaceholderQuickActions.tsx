import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import OptionWithChevron from '@components/Reusable/OptionButtons/OptionWithChevron';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Files from '@assets/icons/FolderBlack.svg';
import Superport from '@assets/icons/NewSuperportBlack.svg';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import {useNavigation} from '@react-navigation/native';
import {FileAttributes} from '@utils/Storage/interfaces';

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
  return (
    <>
      <NumberlessText
        style={{color: PortColors.primary.black}}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        Quick actions
      </NumberlessText>
      <View style={styles.row}>
        <View style={styles.button}>
          <OptionWithChevron
            labelActiveState={false}
            IconLeft={Files}
            heading="Move contacts to this folder"
            onClick={() =>
              navigation.navigate('MoveToFolder', {
                selectedFolder: {...selectedFolder},
              })
            }
          />
        </View>
        <View style={styles.button}>
          <OptionWithChevron
            labelActiveState={false}
            IconLeft={Superport}
            heading="Create a Superport for this folder"
            onClick={() =>
              navigation.navigate('SuperportScreen', {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: PortColors.background,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: PortColors.primary.white,
    paddingVertical: PortSpacing.tertiary.uniform,
    borderRadius: 16,
  },
  row: {
    width: '100%',
    rowGap: 10,
    marginTop: PortSpacing.tertiary.top,
  },
});

export default FolderPlaceholderQuickActions;
