import React from 'react';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {StyleSheet, View} from 'react-native';
import {PortColors, screen} from './ComponentUtils';
import {NumberlessMediumText} from './NumberlessText';

function ErrorModal() {
  const {modalVisible, errorToShow} = useErrorModal();
  const {Icon, text} = errorToShow;

  return (
    <>
      {modalVisible && (
        <View style={styles.modalView}>
          {Icon && <Icon />}
          <NumberlessMediumText style={styles.modaltext}>
            {text}
          </NumberlessMediumText>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: PortColors.primary.red.light,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: screen.width - 70,
    marginTop: 100,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 20,
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: PortColors.primary.red.error,
  },
  modaltext: {
    fontSize: 12,
    color: '#D84646',
    marginLeft: 5,
    lineHeight: 15,
  },
});
export default ErrorModal;
