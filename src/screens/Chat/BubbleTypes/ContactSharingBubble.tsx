import {NumberlessRegularText} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {DEFAULT_NAME} from '@configs/constants';
import {GenericButton} from '@components/GenericButton';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import {DirectConnectionBundle} from '@utils/Bundles/interfaces';
import {useErrorModal} from 'src/context/ErrorModalContext';

export default function ContactSharingBubble({
  message,
}: {
  message: SavedMessageParams;
}) {
  const {setFemaleModal, setConnectionQRData, showConnectionModal} =
    useConnectionModal();
  const {portConnectionError} = useErrorModal();
  const handleConnect = () => {
    const bundle: DirectConnectionBundle = message.data;
    if (bundle) {
      setConnectionQRData(bundle);
      setFemaleModal(true);
      showConnectionModal();
    } else {
      portConnectionError();
    }
  };
  if (message.sender) {
    return (
      <Pressable style={styles.textBubbleContainer}>
        <NumberlessRegularText style={styles.text}>
          {'You have shared the contact of ' +
            (message.data.fromName || DEFAULT_NAME)}
        </NumberlessRegularText>
        <View style={styles.timeStampContainer}>
          <View>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTimeStamp(message.timestamp)}
            </NumberlessRegularText>
          </View>
        </View>
      </Pressable>
    );
  } else {
    return (
      <View style={styles.textBubbleContainer}>
        <NumberlessRegularText style={styles.text}>
          {'You have been shared the contact of ' +
            (message.data.fromName || DEFAULT_NAME)}
        </NumberlessRegularText>
        <GenericButton
          onPress={handleConnect}
          buttonStyle={styles.connectButton}>
          Connect
        </GenericButton>
        <View style={styles.timeStampContainer}>
          <View>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTimeStamp(message.timestamp)}
            </NumberlessRegularText>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    width: '100%',
  },
  groupName: {
    fontSize: 17,
    color: 'black',
  },
  groupInvite: {
    fontSize: 12,
  },
  inviteMessage: {
    fontSize: 12,
    color: 'black',
    marginTop: 15,
  },
  timeStampContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeStamp: {
    fontSize: 10,
    color: '#868686',
  },
  failedStamp: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  text: {
    color: '#000000',
  },
  buttonContainer: {
    backgroundColor: '#D2F2FF',
    paddingVertical: 12,
    justifyContent: 'center',
    marginHorizontal: -20,
    marginBottom: -5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#547CEF',
    fontSize: 15,
  },
  connectButton: {
    marginTop: 10,
    marginBottom: 10,
  },
});
