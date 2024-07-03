import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import ShareIcon from '@assets/icons/ShareBold.svg';
import Delete from '@assets/icons/delete.svg';
import Forward from '@assets/icons/forward.svg';

import {PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {MediaEntry} from '@utils/Media/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {cleanDeleteMessage, getMessage} from '@utils/Storage/messages';
import Share from 'react-native-share';
import DeleteModal from '@components/Modals/DeleteModal';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {ToastType, useToast} from 'src/context/ToastContext';

/**
 * Renders action bar based on messages that are selected
 * @param chatId,
 * @param selectedMessages, messages selected
 * @param postDelete,
 * @param onForward,
 * @returns {ReactNode} action bar that sits above the message bar
 */

export function MediaActionsBar({
  chatId,
  selectedMedia,
  setSelectedMedia,
  onForward,
  postDelete,
}: {
  chatId: string;
  selectedMedia: MediaEntry[];
  setSelectedMedia: any;
  onForward: any;
  postDelete: any;
}): ReactNode {
  const getMessageIds = (data: MediaEntry[]): string[] => {
    return data.flatMap(item => (item.messageId ? item.messageId : []));
  };

  const performDelete = async (): Promise<void> => {
    for (const media of selectedMedia) {
      if (media.chatId) {
        await cleanDeleteMessage(chatId, media.chatId);
        setSelectedMedia((old: MediaEntry[]) =>
          old.filter(item => item.mediaId !== media.mediaId),
        );
      }
    }
    const messageId: string[] = getMessageIds(selectedMedia);

    postDelete(messageId);
    setOpenDeleteModal(false);
  };

  const determineModalDisplay = async () => {
    setOpenDeleteModal(true);
    for (const media of selectedMedia) {
      if (media.messageId) {
        const message = await getMessage(chatId, media.messageId);
        //If sender is false for all selected, we can then allow the messsages to be deleted for all
        if (!message?.sender) {
          return;
        }
      } else {
        return;
      }
    }
    setShowDeleteForEveryone(true);
  };

  const performGlobalDelete = async (): Promise<void> => {
    for (const media of selectedMedia) {
      if (media.chatId) {
        if (media.messageId) {
          const sender = new SendMessage(chatId, ContentType.deleted, {
            messageIdToDelete: media.messageId,
          });
          sender.send();
          await cleanDeleteMessage(chatId, media.messageId);
        }
        setSelectedMedia((old: MediaEntry[]) =>
          old.filter(item => item.mediaId !== media.mediaId),
        );
      }
    }

    setOpenDeleteModal(false);
  };

  const handleShare = async () => {
    const uriFilePath = selectedMedia.map(mediax => {
      return getSafeAbsoluteURI(mediax.filePath, 'doc');
    });
    try {
      setLoadingShare(true);
      const shareOptions: any = {
        urls: uriFilePath,
        failOnCancel: false,
      };
      await Share.open(shareOptions);
    } catch (error) {
      showToast(
        'Unable to share link. Please try again when online.',
        ToastType.error,
      );
      console.log('Error sharing content: ', error);
    } finally {
      setLoadingShare(false);
    }
  };

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [showDeleteForEveryone, setShowDeleteForEveryone] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);
  const {showToast} = useToast();

  return (
    <View style={styles.parentContainer}>
      <DeleteModal
        showMore={showDeleteForEveryone}
        openDeleteModal={openDeleteModal}
        title={'Delete message'}
        topButton="Delete for me"
        topButtonFunction={performDelete}
        middleButton="Delete for everyone"
        middleButtonFunction={performGlobalDelete}
        bottomButton="Cancel"
        bottomButtonFunction={() => {
          setOpenDeleteModal(false);
        }}
      />
      {selectedMedia.length > 1 ? (
        <View style={styles.multiSelectedContainer}>
          <View style={styles.optionContainer}>
            <GenericButton
              onPress={handleShare}
              IconLeft={ShareIcon}
              iconStyleLeft={{alignItems: 'center'}}
              loading={loadingShare}
              buttonStyle={StyleSheet.compose(styles.optionBox, {
                backgroundColor: PortColors.primary.grey.light,
                color: PortColors.primary.black,
              })}
            />

            <NumberlessText
              fontSizeType={FontSizeType.xs}
              fontType={FontType.md}>
              Share
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.xs}
              fontType={FontType.md}>
              Forward
            </NumberlessText>
          </View>

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={determineModalDisplay}>
              <Delete />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.xs}
              fontType={FontType.md}>
              Delete
            </NumberlessText>
          </View>
        </View>
      ) : (
        <View style={styles.singleSelectedContainer}>
          <View style={styles.optionContainer}>
            <GenericButton
              onPress={handleShare}
              IconLeft={ShareIcon}
              loading={loadingShare}
              buttonStyle={StyleSheet.compose(styles.optionBox, {
                backgroundColor: PortColors.primary.grey.light,
                color: PortColors.primary.black,
              })}
            />
            <NumberlessText
              fontSizeType={FontSizeType.xs}
              fontType={FontType.md}>
              Share
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.xs}
              fontType={FontType.md}>
              Forward
            </NumberlessText>
          </View>

          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={determineModalDisplay}>
              <Delete />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.xs}
              fontType={FontType.md}>
              Delete
            </NumberlessText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    paddingBottom: 20,
    backgroundColor: PortColors.primary.white,
  },
  singleSelectedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  multiSelectedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  optionContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  optionBox: {
    backgroundColor: PortColors.primary.grey.light,
    width: 55,
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
});
