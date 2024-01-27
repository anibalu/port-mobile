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
import Delete from '../../../assets/icons/Trashwhite.svg';

const ContactCard = (props: PendingCardInfo) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{flexDirection: 'row'}}>
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
              fontType={FontType.rg}
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
            <View style={styles.buttonrow}>
              <NumberlessText
                fontType={FontType.rg}
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
        </View>

        <Pressable
          onPress={async () => {
            await cleanDeletePort(props.portId, props.table);
          }}
          style={styles.declinebutton}>
          <Delete />
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    justifyContent: 'center',
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
  },
  initiatedInfo: {
    color: PortColors.primary.blue.app,
    paddingVertical: 5,
    borderRadius: 8,
    height: 25,
    marginRight: 2,
  },
  inforight: {
    color: '#868686',
    paddingVertical: 5,
    borderRadius: 8,
    height: 25,
    marginRight: 2,
  },
  expiry: {
    color: '#EE786B',
    paddingVertical: 5,
    borderRadius: 8,
    height: 25,
    marginRight: 2,
    paddingLeft: 8,
  },

  textrow: {
    marginRight: 5,
    marginLeft: 12,
  },
  subtitle: {
    color: '#868686',
  },
  infonote: {
    color: '#547CEF',
  },
  declinebutton: {
    backgroundColor: '#EE786B',
    justifyContent: 'center',
    borderRadius: 4,
    height: 32,
    width: 74,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ContactCard;
