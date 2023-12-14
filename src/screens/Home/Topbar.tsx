/**
 * Top Bar of the home screen containing profile picture and unread count
 */
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '@components/NumberlessText';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {getProfilePicture} from '@utils/Profile';
import ProfileBackground from '@assets/backgrounds/profileBackground.svg';
import {GenericAvatar} from '@components/GenericAvatar';

type TopbarProps = {
  toptitleMessage: String;
  unread: Number | undefined;
};

function Topbar({unread, toptitleMessage = 'All'}: TopbarProps) {
  const [profileURI, setProfileURI] = useState('avatar://1');

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
  const navigation = useNavigation();
  return (
    <View style={styles.bar}>
      <View style={styles.sidebarIcon} />
      <NumberlessSemiBoldText style={styles.title}>
        {title}
      </NumberlessSemiBoldText>
      <View style={styles.profileImageContainer}>
        <ProfileBackground style={styles.backgroundImage} />
        <GenericAvatar
          onPress={() => navigation.navigate('MyProfile')}
          profileUri={profileURI}
          avatarSize={'extraSmall'}
        />
      </View>
    </View>
  ); // TODO: Add sidebar icon when decided
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 65,
  },
  imageNavigation: {
    width: 42,
    height: 42,
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
  title: {
    fontSize: 21,
    lineHeight: 28,
    color: 'black',
  },
  sidebarIcon: {
    width: 80,
    height: 65,
  },
});

export default Topbar;
