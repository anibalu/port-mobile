/**
 * Default chat tile displayed when there are no connections
 */
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {
  NumberlessBoldText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import DefaultImage from '@assets/avatars/avatar.png';
import Cross from '@assets/icons/cross.svg';
import {GroupMember} from '@utils/Groups/interfaces';
import {DEFAULT_NAME} from '@configs/constants';
import GenericModal from '@components/GenericModal';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';

function UserTile({member}: {member: GroupMember}) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        style={styles.defaultTileContainer}
        onPress={() => setVisible(true)}>
        <Image
          source={{
            uri: member?.profilePicture
              ? member.profilePicture
              : Image.resolveAssetSource(DefaultImage).uri,
          }}
          style={styles.newIcon}
        />
        <NumberlessRegularText style={styles.defaultTileText} numberOfLines={1}>
          {member?.name ? member.name : DEFAULT_NAME}
        </NumberlessRegularText>
      </Pressable>
      {visible && (
        <GenericModal onClose={() => setVisible(false)} visible={visible}>
          <View style={styles.modal}>
            <View style={styles.row}>
              <Image
                source={{
                  uri: member?.profilePicture
                    ? member.profilePicture
                    : Image.resolveAssetSource(DefaultImage).uri,
                }}
                style={styles.newIcon}
              />
              <View style={styles.textColumn}>
                <NumberlessBoldText style={styles.bold}>
                  {member?.name ? member.name : DEFAULT_NAME}
                </NumberlessBoldText>
                <NumberlessRegularText>Member since:</NumberlessRegularText>
              </View>
              <Cross />
            </View>
            <GenericButton
              onPress={() => console.log('press')}
              buttonStyle={styles.button}>
              Remove Member
            </GenericButton>
          </View>
        </GenericModal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    width: 80,
    marginBottom: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultTileText: {
    color: '#8A8A8AB8',
    marginTop: 12,
  },
  newIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: screen.width,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    paddingVertical: 30,
  },
  row: {
    flexDirection: 'row',
  },
  textColumn: {
    width: '60%',
    marginLeft: 10,
    marginTop: 5,
  },
  bold: {
    color: 'black',
  },
  button: {
    width: '90%',
    backgroundColor: PortColors.primary.red.error,
    marginTop: 20,
    height: 60,
  },
});

export default UserTile;
