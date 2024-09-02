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
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {defaultFolderInfo, safeModalCloseDuration} from '@configs/constants';
import PrimaryButton from '../../components/Reusable/LongButtons/PrimaryButton';
import DynamicColors from '@components/DynamicColors';
import {useBottomNavContext} from '../../context/BottomNavContext';
import {
  loadFolderScreenConnections,
  loadHomeScreenConnections,
} from '@utils/Connections/onRefresh';
import {moveConnectionsToNewFolderWithoutPermissionChange} from '@utils/ChatFolders';

const MoveToFolder = ({
  visible,
  onClose,
  buttonText,
  buttonColor,
}: {
  visible: boolean;
  onClose: () => void;
  buttonText: string;
  buttonColor: 'b' | 'r' | 'w';
}) => {
  const {
    selectedFolderData,
    setSelectionMode,
    setIsChatActionBarVisible,
    selectedConnections,
    setSelectedConnections,
    setConnections,
    setFolderConnections,
    setTotalFolderUnreadCount,
    setTotalUnreadCount,
  } = useBottomNavContext();

  const [folders, setFolders] = useState<FolderInfo[]>([
    selectedFolderData ? {...selectedFolderData} : {...defaultFolderInfo},
  ]);
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo>(
    selectedFolderData ? {...selectedFolderData} : {...defaultFolderInfo},
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const Colors = DynamicColors();

  const onConfirm = async () => {
    try {
      await moveConnectionsToNewFolderWithoutPermissionChange(
        selectedConnections,
        selectedFolder.folderId,
      );
    } catch (error) {
      console.log('Error moving chats', error);
    }
    setSelectedConnections([]);
    setSelectionMode(false);
    setIsChatActionBarVisible(false);
    if (selectedFolderData) {
      const outputFolders = await loadFolderScreenConnections(
        selectedFolderData.folderId,
      );
      setFolderConnections(outputFolders.connections);
      setTotalFolderUnreadCount(outputFolders.unread);
    }
    const output = await loadHomeScreenConnections();
    setConnections(output.connections);
    setTotalUnreadCount(output.unread);
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
      title="Move chats to a folder">
      <NumberlessText
        textColor={Colors.text.subtitle}
        style={{
          width: '100%',
          marginVertical: PortSpacing.secondary.uniform,
        }}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        Moving these chats to a different folder will not change their settings.
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
          ref={flatlistScrollViewRef}
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
