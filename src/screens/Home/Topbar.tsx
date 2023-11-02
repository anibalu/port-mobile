/**
 * Top Bar of the home screen containing profile picture and unread count
 */
import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View, Image} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DefaultImage from '../../../assets/avatars/avatar.png';
import {getProfilePicture} from '../../utils/Profile';
import ProfileBackground from '../../../assets/backgrounds/profileBackground.svg';

type TopbarProps = {
  filter: String | undefined;
  unread: Number | undefined;
};

function Topbar(props: TopbarProps) {
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  const title = props.unread
    ? `${props.filter || 'All'} (${props.unread})`
    : `${props.filter || 'All'}`;
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
        <Pressable onPress={() => navigation.navigate('MyProfile')}>
          <Image source={{uri: profileURI}} style={styles.image} />
        </Pressable>
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
    height: 60,
  },
  imageNavigation: {
    width: 42,
    height: 42,
  },
  profileImageContainer: {
    width: 80,
    height: 50,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 42,
    height: 42,
    borderRadius: 14,
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
    height: 42,
  },
});

export default Topbar;
