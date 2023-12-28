/**
 * Top Bar of the home screen containing profile picture and unread count
 */
import ProfileBackground from '@assets/backgrounds/profileBackground.svg';
import PendingConnectionsIcon from '@assets/icons/PendingConnectionsIcon.svg';
import {PortColors} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AVATAR_ARRAY, TOPBAR_HEIGHT} from '@configs/constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {getProfilePicture} from '@utils/Profile';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

type TopbarProps = {
  toptitleMessage: String;
  unread: Number | undefined;
};

function HomeTopbar({unread, toptitleMessage = 'All'}: TopbarProps): ReactNode {
  const [profileURI, setProfileURI] = useState(AVATAR_ARRAY[0]);

  const title = unread
    ? `${toptitleMessage} (${unread})`
    : `${toptitleMessage}`;
  useFocusEffect(
    React.useCallback(() => {
      //updates profile picture with user set profile picture
      (async () => {
        const profilePictureURI = await getProfilePicture();
        if (profilePictureURI) {
          setProfileURI(profilePictureURI);
        }
      })();
    }, []),
  );
  const navigation = useNavigation<any>();
  return (
    <View style={styles.bar}>
      <Pressable
        style={styles.iconWrapper}
        onPress={() => console.log('open pending connections screen')}>
        <NumberlessText
          fontType={FontType.md}
          textColor={PortColors.text.primaryWhite}
          fontSizeType={FontSizeType.s}
          style={styles.redWrapper}>
          2
        </NumberlessText>
        <PendingConnectionsIcon />
      </Pressable>
      <NumberlessText
        style={{left: 20}}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        {title}
      </NumberlessText>
      <View style={styles.profileImageContainer}>
        <ProfileBackground style={styles.backgroundImage} />
        <GenericAvatar
          onPress={() => navigation.navigate('ShareImage', [])}
          profileUri={profileURI}
          avatarSize={'extraSmall'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: TOPBAR_HEIGHT,
  },
  profileImageContainer: {
    width: 80,
    height: 65,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: 50,
    height: 50,
    position: 'absolute',
    resizeMode: 'cover',
  },
  iconWrapper: {
    backgroundColor: PortColors.primary.grey.light,
    padding: 6,
    marginLeft: 15,
    borderRadius: 8,
  },
  redWrapper: {
    width: 18,
    height: 18,
    borderRadius: 8,
    backgroundColor: PortColors.primary.red.error,
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 4,
  },
});

export default HomeTopbar;
