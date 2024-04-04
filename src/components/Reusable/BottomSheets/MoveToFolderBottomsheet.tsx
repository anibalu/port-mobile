import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {getAllFolders, getFolderPermissions} from '@utils/ChatFolders';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {updateConnection} from '@utils/Connections';
import {useFocusEffect} from '@react-navigation/native';
import {ChatTileProps} from '@components/ChatTile/ChatTile';
import {defaultFolderInfo} from '@configs/constants';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {updateChatPermissions} from '@utils/ChatPermissions';

const MoveToFolder = ({
  selectedConnections,
  setSelectedConnections,
  setSelectionMode,
  onRefresh,
  visible,
  onClose,
  buttonText,
  buttonColor,
  currentFolder,
}: {
  selectedConnections: ChatTileProps[];
  setSelectedConnections: (x: ChatTileProps[]) => void;
  setSelectionMode: (x: boolean) => void;
  onRefresh: any;
  visible: boolean;
  onClose: () => void;
  buttonText: string;
  buttonColor: 'b' | 'r' | 'w';
  currentFolder: FolderInfo;
}) => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [selectedFolder, setSelectedFolder] =
    useState<FolderInfo>(defaultFolderInfo);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onConfirm = async () => {
    try {
      //get folder permissions
      const folderPermissions = await getFolderPermissions(
        selectedFolder.folderId,
      );
      for (let index = 0; index < selectedConnections.length; index++) {
        if (!selectedConnections[index].isReadPort) {
          //update chat permissions to folder permissions
          await updateChatPermissions(
            selectedConnections[index].chatId,
            folderPermissions,
          );
          //update chat folder Id
          await updateConnection({
            chatId: selectedConnections[index].chatId,
            folderId: selectedFolder.folderId,
          });
        }
      }
    } catch (error) {
      console.log('Error moving chats', error);
    }
    setSelectedConnections([]);
    setSelectionMode(false);
    await onRefresh();
  };

  const onClick = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onClose();
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const fetchedFolders = await getAllFolders();
        setFolders(fetchedFolders);
      };

      fetchData();
    }, []),
  );

  const onRadioClick = async (item: FolderInfo) => {
    setSelectedFolder(item);
  };
  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      bgColor="g"
      onClose={onClose}
      title="Move chats to a folder">
      <NumberlessText
        textColor={PortColors.subtitle}
        style={{
          marginVertical: PortSpacing.secondary.uniform,
        }}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        When you move a chat to a chat folder, its initial settings will be
        inherited from the settings set for the folder.
      </NumberlessText>
      <SimpleCard style={styles.cardWrapper}>
        <NumberlessText
          style={{
            marginVertical: PortSpacing.secondary.uniform,
            paddingHorizontal: PortSpacing.secondary.uniform,
          }}
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}>
          Choose folder
        </NumberlessText>
        <FlatList
          data={
            currentFolder.folderId === 'all'
              ? folders
              : folders.filter(x => x.folderId !== currentFolder.folderId)
          }
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          horizontal={false}
          keyExtractor={(item: any) => item.folderId}
          renderItem={item => {
            const newFolders =
              currentFolder.folderId === 'all'
                ? folders
                : folders.filter(x => x.folderId !== currentFolder.folderId);
            return (
              <>
                <OptionWithRadio
                  onClick={async () => await onRadioClick(item.item)}
                  selectedOption={selectedFolder.folderId}
                  selectedOptionComparision={item.item.folderId}
                  title={item.item.name}
                />
                {!(item.index === newFolders.length - 1) && <LineSeparator />}
              </>
            );
          }}
        />
      </SimpleCard>
      <PrimaryButton
        buttonText={buttonText}
        primaryButtonColor={buttonColor}
        isLoading={isLoading}
        disabled={false}
        onClick={onClick}
      />
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    maxHeight: 250,
    width: '100%',
    paddingVertical: PortSpacing.tertiary.uniform,
    paddingBottom: PortSpacing.secondary.bottom,
    marginBottom: PortSpacing.secondary.bottom,
  },
  optionContainer: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    height: 40,
  },
  optionWrapper: {
    flexDirection: 'row',
    paddingVertical: PortSpacing.tertiary.uniform,
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    paddingRight: 5,
    flexDirection: 'column',
    flex: 1,
  },
});

export default MoveToFolder;
