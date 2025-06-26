import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import BaseBottomSheet from '@components/BaseBottomsheet';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing, Width } from '@components/spacingGuide';

import {moveConnectionToNewFolderWithoutPermissionChange} from '@utils/ChatFolders';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {getAllFolders} from '@utils/Storage/folders';




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
  const Colors = useColors();

  return (
    <BaseBottomSheet
      visible={visible}
      bgColor="w"
      onClose={() => setVisible(false)}
>

<View style={styles.titleContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            Move to chat folder
          </NumberlessText>
          <LineSeparator style={{ width: Width.screen }} />
        </View>
      <NumberlessText
        textColor={Colors.text.subtitle}
        style={{
          width: '100%',
          marginVertical: Spacing.l,
        }}
        fontSizeType={FontSizeType.m}
        fontWeight={FontWeight.rg}>
        Moving this chat to a different folder will not change its settings.
      </NumberlessText>
      <SimpleCard style={styles.cardWrapper}>
        <NumberlessText
          style={{
            marginVertical: Spacing.l,
            paddingHorizontal: Spacing.l,
          }}
          textColor={Colors.text.title}
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
    </BaseBottomSheet>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    maxHeight: 250,
    width: '100%',
    paddingVertical: Spacing.s,
  },
  optionContainer: {
    paddingHorizontal: Spacing.l,
    height: 40,
  },
  optionWrapper: {
    flexDirection: 'row',
    paddingVertical: Spacing.s,
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    paddingRight: 5,
    flexDirection: 'column',
    flex: 1,
  },
  titleContainer: {
    width: '100%',
    paddingTop: Spacing.s,
    paddingBottom: Spacing.l,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.m,
  },
});

export default AddFolderBottomsheet;
