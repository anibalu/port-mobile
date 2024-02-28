import {PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import BlackAngleRight from '@assets/icons/BlackAngleRight.svg';
import {GenericAvatar} from '@components/GenericAvatar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {AVATAR_ARRAY, DEFAULT_NAME} from '@configs/constants';
import NewSuperportIcon from '@assets/icons/NewSuperportBlack.svg';
import PendingRequestIcon from '@assets/icons/pendingRequestThin.svg';
import {getProfileName, getProfilePictureUri} from '@utils/Profile';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useConnectionModal} from 'src/context/ConnectionModalContext';

function SideDrawer({setOpenSideDrawer}: any) {
  const navigation = useNavigation();
  const [profileURI, setProfileURI] = useState(AVATAR_ARRAY[0]);
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const {showSuperportModal} = useConnectionModal();
  useFocusEffect(
    React.useCallback(() => {
      //updates profile picture with user set profile picture
      (async () => {
        const profilePictureURI = await getProfilePictureUri();
        const fetchedName = await getProfileName();
        if (fetchedName) {
          setName(fetchedName ? fetchedName : DEFAULT_NAME);
        }
        if (profilePictureURI) {
          setProfileURI(profilePictureURI);
        }
      })();
    }, []),
  );

  const drawerItemClick = (screenName: string) => {
    if (screenName) {
      navigation.navigate(screenName);
    }
    setOpenSideDrawer(false);
  };

  const handleNewSuperportsClick = () => {
    setOpenSideDrawer(false);
    showSuperportModal();
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.myprofileWrapper}>
        <GenericAvatar profileUri={profileURI} avatarSize={'xxsmall'} />
        <GenericButton
          buttonStyle={styles.mrpyofileButton}
          onPress={() => drawerItemClick('MyProfile')}
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
            onPress={() => drawerItemClick('PendingRequests')}
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
