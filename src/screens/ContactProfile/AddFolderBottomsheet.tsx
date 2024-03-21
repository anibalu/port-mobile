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
import {getAllFolders} from '@utils/ChatFolders';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import BluePlus from '@assets/icons/bluePlusWithCircle.svg';
import {moveConnectionToNewFolder} from '@utils/Connections';
import {useNavigation} from '@react-navigation/native';

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

  useEffect(() => {
    const fetchData = async () => {
      const fetchedFolders = await getAllFolders();
      setFolders(fetchedFolders);
    };

    fetchData();
  }, []);

  const onRadioClick = async (item: FolderInfo) => {
    setSelectedFolder(item);
    try {
      //move chat to the folder
      await moveConnectionToNewFolder(chatId, item.folderId);
    } catch (error) {
      console.log('Error moving chat to a folder', error);
    }
    setVisible(false);
  };
  const navigation = useNavigation();
  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      bgColor="g"
      onClose={() => setVisible(false)}
      title="Move to chat folder">
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
                <LineSeparator />
                {item.index === folders.length - 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      setVisible(false);
                      navigation.navigate('CreateFolder', {
                        setSelectedFolder: setSelectedFolder,
                        chatId: chatId,
                      });
                    }}
                    accessibilityIgnoresInvertColors
                    activeOpacity={0.6}>
                    <View style={styles.optionContainer}>
                      <View style={styles.optionWrapper}>
                        <View style={styles.textContainer}>
                          <NumberlessText
                            fontSizeType={FontSizeType.m}
                            fontType={FontType.rg}>
                            Create a folder
                          </NumberlessText>
                        </View>
                        <View>
                          <BluePlus width={20} height={20} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
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
