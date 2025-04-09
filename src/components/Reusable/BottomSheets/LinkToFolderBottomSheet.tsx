import React, {useEffect, useRef} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';

import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';

import {safeModalCloseDuration} from '@configs/constants';

import {updateGeneratedSuperportFolder} from '@utils/Ports';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';

import AddCircle from '@assets/icons/bluePlusWithCircle.svg';

import {ToastType, useToast} from 'src/context/ToastContext';

/**
 * LinkToFolderBottomSheet
 *
 * This component renders a bottom sheet that allows users to select a folder from a list.
 * The selected folder is linked to a specified port ID
 *
 * Props:
 * - foldersArray: Array of FolderInfo objects representing the list of available folders.
 * - visible: Boolean indicating whether the bottom sheet is visible or not.
 * - onClose: Function to be called when the bottom sheet is closed.
 * - currentFolder: The currently selected folder, used to indicate which option is selected.
 * - setSelectedFolderData: Function to update the selected folder data in the parent component.
 * - portId: (Optional) The ID of the port to be linked to the selected folder.
 * - title: The title displayed at the top of the bottom sheet.
 * - subtitle: (Optional) A subtitle displayed below the title.
 */

const LinkToFolderBottomSheet = ({
  foldersArray,
  visible,
  onClose,
  currentFolder,
  setSelectedFolderData,
  portId,
  title,
  subtitle,
  createfolder = false,
  onCreateFolder,
}: {
  portId?: any;
  foldersArray: FolderInfo[];
  setSelectedFolderData?: (folder: FolderInfo) => void;
  visible: boolean;
  onClose: () => void;
  currentFolder: FolderInfo;
  title: string;
  subtitle?: string;
  createfolder?: boolean;
  onCreateFolder?: () => void;
}) => {
  const Colors = DynamicColors();
  const {showToast} = useToast();

  const onRadioClick = async (item: FolderInfo) => {
    if (portId) {
      try {
        await updateGeneratedSuperportFolder(portId, item.folderId);
        setSelectedFolderData?.(item);
      } catch {
        showToast(
          'Error updating chosen folder. Please check your internet connection and try again!',
          ToastType.error,
        );
      }
    } else {
      setSelectedFolderData?.(item);
    }
    onClose();
  };

  const flatlistScrollViewRef = useRef<FlatList>(null);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (visible) {
      timerId = setTimeout(() => {
        // Flash scroll indicators when the bottom sheet opens
        flatlistScrollViewRef?.current?.flashScrollIndicators();
      }, safeModalCloseDuration);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [visible]);

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
          ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
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
          ref={flatlistScrollViewRef}
          data={foldersArray}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
          horizontal={false}
          keyExtractor={(item: any) => item.folderId}
          renderItem={({item, index}) => {
            return (
              <>
                {index === 0 && createfolder && (
                  <>
                    <TouchableOpacity
                      onPress={onCreateFolder}
                      accessibilityIgnoresInvertColors
                      activeOpacity={0.6}>
                      <View
                        style={[
                          styles.optionWrapper,
                          {paddingHorizontal: PortSpacing.secondary.uniform},
                        ]}>
                        <View style={styles.textContainer}>
                          <NumberlessText
                            textColor={Colors.text.primary}
                            fontSizeType={FontSizeType.m}
                            fontType={FontType.rg}>
                            Create a new folder
                          </NumberlessText>
                        </View>
                        <AddCircle width={20} height={20} />
                      </View>
                    </TouchableOpacity>
                    <LineSeparator />
                  </>
                )}
                <OptionWithRadio
                  onClick={async () => await onRadioClick(item)}
                  selectedOption={currentFolder?.folderId}
                  selectedOptionComparision={item.folderId}
                  title={item.name}
                />
                {!(index === foldersArray.length - 1) && <LineSeparator />}
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
