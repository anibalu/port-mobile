import {PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import BlackAngleRight from '@assets/icons/BlackAngleRight.svg';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import NewSuperportIcon from '@assets/icons/NewSuperportBlack.svg';
import PendingRequestIcon from '@assets/icons/pendingRequestThin.svg';
import {getProfileName, getProfilePicture, processName} from '@utils/Profile';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';

function SideDrawer({setOpenSideDrawer}: any) {
  const navigation = useNavigation();
  const [profilePicAttr, setProfilePicAttr] = useState(
    DEFAULT_PROFILE_AVATAR_INFO,
  );
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const {showSuperportModal} = useConnectionModal();
  useFocusEffect(
    React.useCallback(() => {
      //updates profile picture with user set profile picture
      (async () => {
        const profilePictureURI = await getProfilePicture();
        const fetchedName = await getProfileName();
        if (fetchedName) {
          setName(fetchedName ? fetchedName : DEFAULT_NAME);
        }
        if (profilePictureURI) {
          setProfilePicAttr(profilePictureURI);
        }
      })();
    }, []),
  );

  const navigateToMyprofile = () => {
    navigation.navigate('MyProfile', {
      name: processName(name),
      avatar: profilePicAttr,
    });
    setOpenSideDrawer(false);
  };

  const navigateToPendingReq = () => {
    navigation.navigate('PendingRequests');
    setOpenSideDrawer(false);
  };

  const handleNewSuperportsClick = () => {
    setOpenSideDrawer(false);
    showSuperportModal();
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.myprofileWrapper}>
        <AvatarBox profileUri={profilePicAttr.fileUri} avatarSize={'s'} />
        <GenericButton
          buttonStyle={styles.mrpyofileButton}
          onPress={navigateToMyprofile}
          iconSize={20}
          IconRight={BlackAngleRight}>
          <NumberlessText
            style={{marginLeft: 8}}
            textColor={PortColors.primary.black}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.l}>
            {name}
          </NumberlessText>
        </GenericButton>
      </View>
      <View style={styles.newOptionsWrapper}>
        <View style={styles.listItemWrapper}>
          <NewSuperportIcon width={20} height={20} />
          <GenericButton
            buttonStyle={styles.listItemButton}
            onPress={handleNewSuperportsClick}
            iconSize={20}
            IconRight={BlackAngleRight}>
            <NumberlessText
              textColor={PortColors.primary.black}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              Superports
            </NumberlessText>
          </GenericButton>
        </View>
        <View style={styles.listItemWrapper}>
          <PendingRequestIcon width={20} height={20} />
          <GenericButton
            buttonStyle={styles.listItemButton}
            onPress={navigateToPendingReq}
            iconSize={20}
            IconRight={BlackAngleRight}>
            <NumberlessText
              style={{flex: 1, textAlign: 'left'}}
              textColor={PortColors.primary.black}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              Pending ports
            </NumberlessText>
          </GenericButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: PortColors.primary.white,
  },
  newOptionsWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomColor: PortColors.primary.border.dullGrey,
    borderBottomWidth: 1,
  },
  mrpyofileButton: {
    borderRadius: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingLeft: 8,
  },
  myprofileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PortColors.primary.grey.light,
  },
  listItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  listItemButton: {
    borderRadius: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
});

export default SideDrawer;
