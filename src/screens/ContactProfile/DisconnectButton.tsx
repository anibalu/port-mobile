import {PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import React, {useState} from 'react';
import {useErrorModal} from 'src/context/ErrorModalContext';

/**
 * When clicked, marks the line as disconnected and redirects to the home page
 * @param props Includes the lineId to delete, if the button is pressed
 */
export default function DisconnectButton(props: {chatId: string}) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const {unableToDisconnectError} = useErrorModal();
  const invokeConnectionDisconnect = async () => {
    setLoading(true);
    const chat = new DirectChat(props.chatId);
    const resp = await chat.disconnect();
    if (!resp) {
      //show error modal for failure to disconnect
      unableToDisconnectError();
    } else {
      navigation.navigate('HomeTab');
    }
    setLoading(false);
  };

  return (
    <GenericButton
      loading={loading}
      buttonStyle={{
        flexDirection: 'row',
        height: 60,
        marginHorizontal: 32,
        alignSelf: 'stretch',
        backgroundColor: PortColors.primary.red.error,
      }}
      textStyle={{textAlign: 'center', color: PortColors.text.primaryWhite}}
      onPress={invokeConnectionDisconnect}>
      Disconnect
    </GenericButton>
  );
}
