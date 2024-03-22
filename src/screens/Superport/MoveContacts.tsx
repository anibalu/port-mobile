import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Folder from '@assets/icons/Folder.svg';
import FolderPill from '@components/Reusable/Pill/FolderPill';
import {FolderInfo} from '@utils/ChatFolders/interfaces';

const MoveContacts = ({
  foldersArray,
  setSelectedFolder,
  selectedFolder,
  onAddNewFolder,
}: {
  foldersArray: FolderInfo[];
  setSelectedFolder: (x: FolderInfo) => void;
  selectedFolder: FolderInfo;
  onAddNewFolder: () => void;
}) => {
  const [showAll, setShowAll] = useState(false);

  const renderFolders = () => {
    if (showAll) {
      return foldersArray.map(folder => (
        <FolderPill
          selectedFolder={selectedFolder}
          key={folder.folderId}
          value={folder}
          onClick={setSelectedFolder}
        />
      ));
    } else {
      return foldersArray
        .slice(0, 6)
        .map(folder => (
          <FolderPill
            selectedFolder={selectedFolder}
            key={folder.folderId}
            value={folder}
            onClick={setSelectedFolder}
          />
        ));
    }
  };

  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: PortSpacing.tertiary.bottom,
        }}>
        <Folder width={20} height={20} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          <NumberlessText
            style={{
              color: PortColors.title,
              marginLeft: PortSpacing.tertiary.left,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            Move new contacts to a folder
          </NumberlessText>
          <Pressable onPress={onAddNewFolder}>
            <NumberlessText
              style={{
                color: PortColors.primary.blue.app,
                marginLeft: PortSpacing.tertiary.left,
              }}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              + Add
            </NumberlessText>
          </Pressable>
        </View>
      </View>
      <View style={{marginBottom: PortSpacing.secondary.bottom}}>
        <NumberlessText
          style={{color: PortColors.subtitle}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          All new contacts added using this Superport will be moved to the
          selected folder and inherit the folder's contact settings.
        </NumberlessText>
      </View>
      <View style={styles.pillrow}>
        {renderFolders()}
        {foldersArray.length > 6 && !showAll && (
          <NumberlessText
            onPress={() => setShowAll(true)}
            style={{
              color: PortColors.primary.blue.app,
              marginLeft: PortSpacing.tertiary.left,
              marginTop: PortSpacing.tertiary.top,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            +{foldersArray.slice(6, foldersArray.length).length} more
          </NumberlessText>
        )}
        {foldersArray.length > 6 && showAll && (
          <NumberlessText
            onPress={() => setShowAll(false)}
            style={{
              color: PortColors.primary.blue.app,
              marginLeft: PortSpacing.tertiary.left,
              marginTop: PortSpacing.tertiary.top,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            show less
          </NumberlessText>
        )}
      </View>
    </SimpleCard>
  );
};
const styles = StyleSheet.create({
  pillrow: {
    flexDirection: 'row',
    rowGap: 12,
    columnGap: 12,
    flexWrap: 'wrap',
  },
});

export default MoveContacts;
