import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {disconnectConnection} from '../../utils/Connections';

/**
 * When clicked, marks the line as disconnected and redirects to the home page
 * @param props Includes the lineId to delete, if the button is pressed
 */
export default function DisconnectButton(props: {chatId: string}) {
  const navigation = useNavigation();
  const invokeConnectionDisconnect = async () => {
    await disconnectConnection(props.chatId);
    navigation.navigate('HomeTab');
  };

  return (
    <Pressable onPress={invokeConnectionDisconnect} style={styles.buttonStyle}>
      <NumberlessSemiBoldText style={styles.textStyle}>
        Disconnect
      </NumberlessSemiBoldText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    width: '90%',
    height: 70,
    backgroundColor: '#EE786B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  textStyle: {
    color: 'white',
    fontWeight: '500',
    fontSize: 17,
  },
});
