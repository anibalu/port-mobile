import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {SavedMessageParams, SendStatus} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Sending from '../../../../assets/icons/sending.svg';

export default function JoinGroupBubble({
  message,
  memberName,
  handleButtonPress,
}: {
  message: SavedMessageParams;
  memberName: string;
  handleButtonPress: any;
}) {
  const data = {
    groupName: 'Family forever',
    isGroupChatInvite: true,
    memberName: 'Charlie',
  };
  return (
    <View style={styles.textBubbleContainer}>
      <NumberlessMediumText style={styles.groupName}>
        {data.groupName}
      </NumberlessMediumText>
      {data.isGroupChatInvite && (
        <NumberlessRegularText style={styles.groupInvite}>
          Group Chat Invite
        </NumberlessRegularText>
      )}
      <Text style={styles.inviteMessage}>
        {memberName} has invited you to join {data.groupName} group, Scan qr
        code or click the link below to join
      </Text>
      <View style={styles.timeStampContainer}>
        {message.sendStatus === SendStatus.success || !message.sender ? (
          <View>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTimeStamp(message.timestamp)}
            </NumberlessRegularText>
          </View>
        ) : (
          <View>
            {message.sendStatus === SendStatus.journaled ? (
              <View>
                <Sending />
              </View>
            ) : (
              <View>
                {true ? (
                  <View>
                    <Sending />
                  </View>
                ) : (
                  <View>
                    <NumberlessRegularText style={styles.failedStamp}>
                      {'failed'}
                    </NumberlessRegularText>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
      <Pressable style={styles.buttonContainer} onPress={handleButtonPress}>
        <NumberlessMediumText style={styles.buttonText}>
          Join group
        </NumberlessMediumText>
      </Pressable>
    </View>
  );
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
});
