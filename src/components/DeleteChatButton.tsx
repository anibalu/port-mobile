import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {NumberlessSemiBoldText} from './NumberlessText';

/**
 * When clicked, deletes the history of the chat and redirects to the home page
 * @param props Includes the lineId to delete, if the button is pressed
 */
export default function DeleteChatButton(props: {
  onDelete: () => void;
  stripMargin?: boolean;
}) {
  const buttonStyle = StyleSheet.compose(
    styles.buttonStyle,
    props.stripMargin ? styles.stripMargin : {},
  );
  return (
    <Pressable onPress={props.onDelete} style={buttonStyle}>
      <NumberlessSemiBoldText style={styles.textStyle}>
        Delete history
      </NumberlessSemiBoldText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    width: '90%',
    height: 70,
    borderColor: '#EE786B',
    backgroundColor: '#FFF9',
    borderWidth: 3,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: '5%',
  },
  textStyle: {
    color: '#EE786B',
    fontWeight: '500',
    fontSize: 17,
  },
  stripMargin: {
    marginLeft: 0,
  },
});
