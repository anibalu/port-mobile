/**
 * Top Bar of the home screen containing profile picture and unread count
 */
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
import {numberOfPendingRequests} from '@utils/Ports';
import {getProfilePictureUri} from '@utils/Profile';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';

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
        const profilePictureURI = await getProfilePictureUri();
        if (profilePictureURI) {
          setProfileURI(profilePictureURI);
        }
      })();
    }, []),
  );
  const navigation = useNavigation<any>();

  const reloadTrigger = useSelector(
    state => state.triggerPendingRequestsReload.change,
  );

  const [pendingRequestsLength, setPendingRequestsLength] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setPendingRequestsLength(await numberOfPendingRequests());
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadTrigger]),
  );

  return (
    <View style={styles.bar}>
      <Pressable
        style={styles.iconWrapper}
        onPress={() => navigation.navigate('PendingRequests')}>
        {pendingRequestsLength > 0 && (
          <NumberlessText
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}
            fontSizeType={FontSizeType.s}
            style={styles.redWrapper}>
            {pendingRequestsLength}
          </NumberlessText>
        )}
        <PendingConnectionsIcon />
      </Pressable>
      <NumberlessText
        style={styles.maintitle}
        numberOfLines={1}
        ellipsizeMode="tail"
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        {title}
      </NumberlessText>
      <View style={styles.profileImageContainer}>
        <GenericAvatar
          onPress={() => navigation.navigate('MyProfile')}
          profileUri={profileURI}
          avatarSize={'xxsmall'}
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backgroundImage: {
    width: 50,
    height: 50,
    position: 'absolute',
    resizeMode: 'cover',
  },
  maintitle: {
    flex: 1,
    textAlign: 'center',
    left: 7,
    marginHorizontal: 10,
  },
  iconWrapper: {
    backgroundColor: PortColors.primary.grey.light,
    padding: 8,
    marginLeft: 15,
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  redWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PortColors.primary.red.error,
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden',
    textAlignVertical: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -4,
    right: -4,
    paddingTop: 2,
    paddingHorizontal: 4,
  },
});

export default HomeTopbar;
