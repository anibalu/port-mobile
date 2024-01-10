import {PortColors} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AVATAR_ARRAY} from '@configs/constants';
import {cleanDeletePort} from '@utils/Ports';
import {
  BundleTarget,
  PendingCardInfo,
  PortTable,
} from '@utils/Ports/interfaces';
import {getExpiryTag, getReadableTimestamp} from '@utils/Time';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

const ContactCard = (props: PendingCardInfo) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <GenericAvatar
          avatarSize="small"
          profileUri={
            props.target === BundleTarget.group
              ? AVATAR_ARRAY[14]
              : AVATAR_ARRAY[13]
          }
        />
        <View style={styles.textrow}>
          <NumberlessText
            fontType={FontType.md}
            ellipsizeMode="tail"
            numberOfLines={1}
            fontSizeType={FontSizeType.m}
            style={styles.text}>
            {props.name}
          </NumberlessText>
          <NumberlessText
            fontType={FontType.md}
            fontSizeType={FontSizeType.s}
            style={styles.subtitle}>
            {getReadableTimestamp(props.usedOnTimestamp)}
          </NumberlessText>
          <NumberlessText
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}
            style={styles.infonote}>
            {props.stage}
          </NumberlessText>
        </View>

        <Pressable
          onPress={async () => {
            await cleanDeletePort(props.portId, props.table);
          }}
          style={styles.declinebutton}>
          <Text style={styles.buttonText}>DELETE</Text>
        </Pressable>
      </View>
      <View style={styles.buttonrow}>
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.s}
          style={
            props.table === PortTable.generated
              ? styles.initiatedInfo
              : styles.inforight
          }>
          {props.channelDescription}
        </NumberlessText>
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.s}
          style={styles.expiry}>
          {getExpiryTag(props.expiryTimestamp)}
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
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginRight: 5,
    width: '60%',
    marginLeft: 5,
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
