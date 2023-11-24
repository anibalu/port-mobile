import React from 'react';
import {Modal, Pressable, StyleSheet, Text} from 'react-native';
import {View} from 'react-native';
import CrossIcon from '../../assets/icons/cross.svg';

function CustomModal({
  openCustomModal,
  setOpenCustomModal,
  title,
  question,
  description,
  topButton,
  bottomButton,
  topButtonFunction,
  bottomButtonFunction,
}: {
  openCustomModal: boolean;
  setOpenCustomModal: any;
  title: string;
  question?: string;
  description?: string;
  topButton: string;
  bottomButton: string;
  topButtonFunction: any;
  bottomButtonFunction: any;
}) {
  return (
    <Modal animationType="none" visible={openCustomModal} transparent={true}>
      <Pressable
        style={styles.popUpArea}
        onPress={() => setOpenCustomModal(p => !p)}>
        <View style={styles.mainContainer}>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={styles.titleStyles}>{title}</Text>
            <CrossIcon />
          </View>

          {question != undefined && (
            <Text style={styles.questionStyles}>{question}</Text>
          )}
          {description != undefined && (
            <Text style={styles.descriptionStyles}>{description}</Text>
          )}

          <Pressable
            style={styles.topButtonContainer}
            onPress={topButtonFunction}>
            <Text style={styles.topButtonText}>{topButton}</Text>
          </Pressable>
          <Pressable
            style={styles.bottomButtonContainer}
            onPress={bottomButtonFunction}>
            <Text style={styles.bottomButtonText}>{bottomButton}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  popUpArea: {
    backgroundColor: '#0005',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupPosition: {},
  mainContainer: {
    backgroundColor: 'white',
    width: '90%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  titleStyles: {
    fontSize: 17,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
    width: '90%',
  },
  questionStyles: {
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
    textAlign: 'left',
    marginBottom: 10,
  },
  descriptionStyles: {
    fontSize: 15,
    fontWeight: '400',
    color: '#606060',
    textAlign: 'left',
    marginBottom: 30,
  },
  topButtonContainer: {
    width: '100%',
    backgroundColor: '#547CEF',
    borderRadius: 8,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  topButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  bottomButtonContainer: {
    width: '100%',
    backgroundColor: '#EBEBEB',
    borderRadius: 8,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
});

export default CustomModal;
