import {PortColors} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AVATAR_ARRAY} from '@configs/constants';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

const ContactCard = ({contactProps, onDelete}) => {
  const {name, date, pendingStatus, expiry, chatStatus, isGroup} = contactProps;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <GenericAvatar
          avatarSize="small"
          profileUri={isGroup ? AVATAR_ARRAY[14] : AVATAR_ARRAY[13]}
        />
        <View style={styles.textrow}>
          <NumberlessText
            fontType={FontType.md}
            fontSizeType={FontSizeType.m}
            style={styles.text}>
            {name}
          </NumberlessText>
          <NumberlessText
            fontType={FontType.md}
            fontSizeType={FontSizeType.m}
            style={styles.subtitle}>
            {date}
          </NumberlessText>
          <NumberlessText
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}
            style={styles.infonote}>
            {pendingStatus}
          </NumberlessText>
        </View>

        <Pressable onPress={onDelete} style={styles.declinebutton}>
          <Text style={styles.buttonText}>DELETE</Text>
        </Pressable>
      </View>
      <View style={styles.buttonrow}>
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.s}
          style={
            chatStatus === 'Initiated' ? styles.initiatedInfo : styles.inforight
          }>
          {chatStatus}
        </NumberlessText>
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.s}
          style={styles.expiry}>
          {expiry}
        </NumberlessText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 10,
  },
  text: {
    color: 'black',
  },
  row: {
    flexDirection: 'row',
  },
  buttonrow: {
    flexDirection: 'row',
    marginLeft: 65,
    marginTop: 5,
  },
  initiatedInfo: {
    color: PortColors.primary.blue.app,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    height: 25,
    marginRight: 2,
  },
  inforight: {
    color: '#868686',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    height: 25,
    marginRight: 2,
  },
  expiry: {
    color: '#EE786B',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    height: 25,
    marginRight: 2,
  },

  textrow: {
    marginLeft: 15,
    marginRight: 5,
  },
  subtitle: {
    color: '#868686',
  },
  infonote: {
    color: '#547CEF',
  },
  declinebutton: {
    backgroundColor: '#EE786B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    height: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ContactCard;
