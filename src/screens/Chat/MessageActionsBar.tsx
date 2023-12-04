import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Copy from '@assets/icons/copy.svg';
import Delete from '@assets/icons/delete.svg';
import Forward from '@assets/icons/forward.svg';
import Info from '@assets/icons/info.svg';
import Reply from '@assets/icons/reply.svg';
import CustomModal from '@components/CustomModal';
import {NumberlessMediumText} from '@components/NumberlessText';
import {getMessage, updateMessage} from '@utils/Storage/messages';

export function MessageActionsBar({
  chatId,
  selectedMessages,
  setReplyTo,
  postDelete,
  onCopy,
  onForward,
}: {
  chatId: string;
  selectedMessages: string[];
  setReplyTo: any;
  postDelete: any;
  onCopy: any;
  onForward: any;
}) {
  const performReply = async () => {
    setReplyTo(await getMessage(chatId, selectedMessages[0]));
  };
  const performDelete = async () => {
    for (const msg of selectedMessages) {
      const message = await getMessage(chatId, msg);
      await updateMessage(chatId, msg, {
        ...message?.data,
        deleted: true,
      });
    }
    postDelete(selectedMessages);
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
          console.log('Pressing bro');
          setOpenCustomModal(false);
        }}
      />
      {selectedMessages.length > 1 ? (
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
            <Pressable style={styles.optionBox} onPress={onCopy}>
              <Copy />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Copy
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
            <Pressable style={styles.optionBox} onPress={performReply}>
              <Reply />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Reply
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onForward}>
              <Forward />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Forward
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onCopy}>
              <Copy />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Copy
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
    backgroundColor: '#FFFFFF',
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
