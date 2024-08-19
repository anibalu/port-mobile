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
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import DynamicColors from '@components/DynamicColors';
import {updateGeneratedSuperportFolder} from '@utils/Ports';

const LinkToFolderBottomSheet = ({
  foldersArray,
  visible,
  onClose,
  currentFolder,
  setSelectedFolderData,
  portId,
  title,
  subtitle,
}: {
  portId?: any;
  foldersArray: FolderInfo[];
  setSelectedFolderData: (folder: FolderInfo | null) => void;
  visible: boolean;
  onClose: () => void;
  currentFolder: FolderInfo | null;
  title: string;
  subtitle?: string;
}) => {
  const Colors = DynamicColors();

  const onRadioClick = async (item: FolderInfo) => {
    if (item.folderId === 'all') {
      setSelectedFolderData(null);
    } else {
      setSelectedFolderData(item);
    }
    if (portId) {
      await updateGeneratedSuperportFolder(portId, item.folderId);
    }
    onClose();
  };

  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      bgColor="g"
      onClose={onClose}
      title={title}>
      <View
        style={{
          marginBottom: PortSpacing.secondary.uniform,
          width: '100%',
        }}>
        {subtitle && (
          <NumberlessText
            textColor={Colors.text.subtitle}
            style={{
              width: '100%',
              marginTop: PortSpacing.secondary.uniform,
            }}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {subtitle}
          </NumberlessText>
        )}
      </View>

      <SimpleCard style={styles.cardWrapper}>
        {foldersArray.length > 0 ? (
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
        ) : (
          <NumberlessText
            style={{
              textAlign: 'center',
              marginVertical: PortSpacing.secondary.uniform,
              paddingHorizontal: PortSpacing.secondary.uniform,
            }}
            textColor={Colors.primary.mediumgrey}
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}>
            No folders data available
          </NumberlessText>
        )}
        <FlatList
          data={foldersArray}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          horizontal={false}
          keyExtractor={(item: any) => item.folderId}
          renderItem={item => {
            return (
              <>
                <OptionWithRadio
                  onClick={async () => await onRadioClick(item.item)}
                  selectedOption={currentFolder?.folderId}
                  selectedOptionComparision={item.item.folderId}
                  title={item.item.name}
                />
                {!(item.index === foldersArray.length - 1) && <LineSeparator />}
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

export default LinkToFolderBottomSheet;
