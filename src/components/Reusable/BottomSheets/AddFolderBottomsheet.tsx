import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {getAllFolders} from '@utils/Storage/folders';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {moveConnectionToNewFolderWithoutPermissionChange} from '@utils/ChatFolders';
import {useFocusEffect} from '@react-navigation/native';
import DynamicColors from '@components/DynamicColors';

const AddFolderBottomsheet = ({
  chatId,
  visible,
  setVisible,
  selectedFolder,
  setSelectedFolder,
}: {
  chatId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedFolder: FolderInfo;
  setSelectedFolder: (folder: FolderInfo) => void;
}) => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);

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
    try {
      //move chat to the folder
      await moveConnectionToNewFolderWithoutPermissionChange(
        chatId,
        item.folderId,
      );
    } catch (error) {
      console.log('Error moving chat to a folder', error);
    }
    setVisible(false);
  };
  const Colors = DynamicColors();

  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      bgColor="g"
      onClose={() => setVisible(false)}
      title="Move to chat folder">
      <NumberlessText
        textColor={Colors.text.subtitle}
        style={{
          width: '100%',
          marginVertical: PortSpacing.secondary.uniform,
        }}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        Moving this chat to a different folder will not change its settings.
      </NumberlessText>
      <SimpleCard style={styles.cardWrapper}>
        <NumberlessText
          style={{
            marginVertical: PortSpacing.secondary.uniform,
            paddingHorizontal: PortSpacing.secondary.uniform,
          }}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}>
          Choose folder
        </NumberlessText>
        <FlatList
          data={folders}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          horizontal={false}
          keyExtractor={(item: any) => item.folderId}
          renderItem={item => {
            return (
              <>
                <OptionWithRadio
                  onClick={async () => await onRadioClick(item.item)}
                  selectedOption={selectedFolder.folderId}
                  selectedOptionComparision={item.item.folderId}
                  title={item.item.name}
                />
                {!(item.index === folders.length - 1) && <LineSeparator />}
              </>
            );
          }}
        />
      </SimpleCard>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    maxHeight: 250,
    width: '100%',
    paddingVertical: PortSpacing.tertiary.uniform,
    paddingBottom: PortSpacing.secondary.bottom,
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

export default AddFolderBottomsheet;
