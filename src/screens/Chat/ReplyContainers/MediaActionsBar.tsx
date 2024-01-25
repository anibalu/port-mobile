import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import Delete from '@assets/icons/delete.svg';
import Forward from '@assets/icons/forward.svg';
import Info from '@assets/icons/info.svg';

import CustomModal from '@components/CustomModal';
import {NumberlessMediumText} from '@components/NumberlessText';
import {cleanDeleteMessage} from '@utils/Storage/messages';
import {PortColors} from '@components/ComponentUtils';
import {MediaEntry} from '@utils/Media/interfaces';

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
}: {
  chatId: string;
  selectedMedia: MediaEntry[];
  setSelectedMedia: any;
  onForward: any;
}): ReactNode {
  const performDelete = async (): Promise<void> => {
    for (const media of selectedMedia) {
      if (media.chatId) {
        await cleanDeleteMessage(chatId, media.chatId);
        setSelectedMedia((old: MediaEntry[]) =>
          old.filter(item => item.mediaId !== media.mediaId),
        );
      }
    }
    setOpenCustomModal(false);
  };

  const [openCustomModal, setOpenCustomModal] = useState(false);

  return (
    <View style={styles.parentContainer}>
      <CustomModal
        openCustomModal={openCustomModal}
        title={'Delete message'}
        topButton="Delete for me"
        topButtonFunction={performDelete}
        bottomButton="Cancel"
        bottomButtonFunction={() => {
          setOpenCustomModal(false);
        }}
      />
      {selectedMedia.length > 1 ? (
        <View style={styles.multiSelectedContainer}>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Forward
            </NumberlessMediumText>
          </View>

          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                setOpenCustomModal(true);
              }}>
              <Delete />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Delete
            </NumberlessMediumText>
          </View>
        </View>
      ) : (
        <View style={styles.singleSelectedContainer}>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Forward
            </NumberlessMediumText>
          </View>

          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('info pressed');
              }}>
              <Info />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Info
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                setOpenCustomModal(true);
              }}>
              <Delete />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Delete
            </NumberlessMediumText>
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
    width: 55,
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 12,
  },
});
