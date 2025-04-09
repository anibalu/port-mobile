import React from 'react';
import {StyleSheet} from 'react-native';

import {PortColors} from './ComponentUtils';
import {GenericButton} from './GenericButton';

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
    <GenericButton
      buttonStyle={buttonStyle}
      textStyle={{textAlign: 'center', color: PortColors.text.delete}}
      onPress={props.onDelete}>
      Delete history
    </GenericButton>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    flexDirection: 'row',
    height: 60,
    marginHorizontal: 32,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderRadius: 16,
    borderColor: PortColors.primary.red.error,
    marginBottom: 25,
  },
  stripMargin: {
    marginLeft: 0,
  },
});
