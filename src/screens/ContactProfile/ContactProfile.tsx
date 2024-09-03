import {AppStackParamList} from '@navigation/AppStackTypes';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  ScrollViewProps,
} from 'react-native';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {PortSpacing, screen} from '@components/ComponentUtils';
import EditIcon from '@assets/icons/PencilCircleAccent.svg';
import Alert from '@assets/icons/Alert.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {useFocusEffect} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import EditName from '@components/Reusable/BottomSheets/EditName';
import {DEFAULT_AVATAR, DEFAULT_NAME} from '@configs/constants';

import UserInfoTopbar from '@components/Reusable/TopBars/UserInfoTopbar';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import * as storage from '@utils/Storage/blockUsers';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {getChatTileTimestamp} from '@utils/Time';
import ProfilePictureBlurViewModal from '@components/Reusable/BlurView/ProfilePictureBlurView';
import Notes from '@components/Notes';
import {ToastType, useToast} from 'src/context/ToastContext';
import ContactSharingBottomsheet from '@components/Reusable/BottomSheets/ContactSharingBottomsheet';

type Props = NativeStackScreenProps<AppStackParamList, 'ContactProfile'>;

const ContactProfile = ({route, navigation}: Props) => {
  const {chatId, chatData} = route.params;
  const [showUserInfoInTopbar, setShowUserInfoInTopbar] = useState(false);
  const userAvatarViewRef = useRef<View>(null);
  const [displayName, setDisplayName] = useState<string>(
    chatData.name || DEFAULT_NAME,
  );
  const displayPic = chatData.displayPic || DEFAULT_AVATAR;

  const {showToast} = useToast();
  const [editingName, setEditingName] = useState(false);
  const [confirmBlockUserSheet, setConfirmBlockUserSheet] = useState(false);
  const pairHash = chatData.pairHash;
  const [isBlocked, setIsBlocked] = useState(false);

  const connected = !chatData.disconnected;
  const [focusProfilePicture, setFocusProfilePicture] =
    useState<boolean>(false);
  const [isSharingContact, setIsSharingContact] = useState(false);
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
    {
      assetName: 'ContactShareIcon',
      dark: require('@assets/light/icons/ContactShareIcon.svg').default,
      light: require('@assets/dark/icons/ContactShareIcon.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const ContactShareIcon = results.ContactShareIcon;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const userBlocked = await storage.isUserBlocked(pairHash);
          setIsBlocked(userBlocked);
        } catch (error) {
          console.log('Error running initial effect', error);
          showToast(
            'Error fetching information regarding this contact',
            ToastType.error,
          );
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected]),
  );

  const onSaveName = async () => {
    const chatHandler = new DirectChat(chatId);
    await chatHandler.updateName(displayName);
    setEditingName(false);
  };
  useMemo(() => {
    onSaveName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName]);

  const handleScroll = (event: NativeSyntheticEvent<ScrollViewProps>) => {
    const {contentOffset} = event.nativeEvent;
    if (contentOffset) {
      const {y} = contentOffset;
      if (y >= 120) {
        setShowUserInfoInTopbar(true);
      } else {
        setShowUserInfoInTopbar(false);
      }
    }
  };

  const blockUser = async () => {
    try {
      await storage.blockUser({
        name: displayName,
        pairHash: pairHash,
        blockTimestamp: new Date().toISOString(),
      });
      setIsBlocked(true);
    } catch {
      console.log('Error in blocking user');
    }
  };

  const unblockUser = async () => {
    try {
      await storage.unblockUser(pairHash);
      setIsBlocked(false);
    } catch {
      console.log('Error in unblocking user');
    }
  };

  const onProfilePictureClick = () => {
    setFocusProfilePicture(true);
  };

  const onShareContactPressed = () => {
    setIsSharingContact(true);
  };

  return (
    <>
      <CustomStatusBar
        backgroundColor={
          showUserInfoInTopbar
            ? Colors.primary.surface
            : Colors.primary.background
        }
      />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <UserInfoTopbar
          backgroundColor={showUserInfoInTopbar ? 'w' : 'g'}
          heading={displayName}
          avatarUri={displayPic}
          showUserInfo={showUserInfoInTopbar}
          IconRight={ContactShareIcon}
          onIconRightPress={onShareContactPressed}
        />
        <View style={styles.mainContainer}>
          <ScrollView
            contentContainerStyle={{height: connected ? 'auto' : '100%'}}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <View style={styles.avatarContainer} ref={userAvatarViewRef}>
              <AvatarBox
                isHomeContact={false}
                onPress={() => onProfilePictureClick()}
                profileUri={displayPic}
                avatarSize="m"
              />

              <Pressable
                style={styles.nameEditHitbox}
                onPress={() => setEditingName(true)}>
                <NumberlessText
                  style={{
                    maxWidth:
                      screen.width - 2 * PortSpacing.secondary.uniform - 30,
                    marginRight: 4,
                  }}
                  textColor={Colors.labels.text}
                  fontSizeType={FontSizeType.xl}
                  fontType={FontType.sb}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {displayName}
                </NumberlessText>
                <EditIcon height={20} width={20} />
              </Pressable>

              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                {chatData.connectedOn
                  ? 'Connection since : ' +
                    getChatTileTimestamp(chatData.connectedOn)
                  : ''}
              </NumberlessText>
            </View>
            <Notes pairHash={pairHash} note={chatData.notes || ''} />

            {connected ? (
              <View
                style={{
                  gap: 10,
                  marginTop: PortSpacing.primary.top,
                }}>
                <PrimaryButton
                  primaryButtonColor="p"
                  buttonText="Go to chat"
                  isLoading={false}
                  disabled={false}
                  onClick={() => {
                    navigation.navigate('DirectChat', {
                      chatId,
                      isConnected: true,
                      profileUri: chatData.displayPic,
                      name: chatData.name,
                      isAuthenticated: chatData.authenticated,
                    });
                  }}
                />
                <View
                  style={{
                    paddingTop: PortSpacing.primary.top,
                  }}>
                  <NumberlessText
                    fontSizeType={FontSizeType.l}
                    textColor={Colors.text.primary}
                    fontType={FontType.sb}>
                    Contacts in Port are completely identifierless
                  </NumberlessText>
                  <NumberlessText
                    fontSizeType={FontSizeType.m}
                    textColor={Colors.text.primary}
                    fontType={FontType.it}>
                    No sensitive personal information or personal identifiers
                    are used to connect with any contact over Port. This means
                    that you never have to worry about your contact being shared
                    without your permission, being spammed incessantly, or
                    having people circuvent being blocked by using another app.
                  </NumberlessText>
                </View>
              </View>
            ) : (
              <View style={styles.disconnectedwrapper}>
                <View style={styles.alertwrapper}>
                  <Alert style={{alignSelf: 'center'}} />
                  <NumberlessText
                    style={{
                      alignSelf: 'center',
                      textAlign: 'center',
                      width: '100%',
                      marginTop: PortSpacing.secondary.top,
                    }}
                    textColor={Colors.text.subtitle}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.rg}>
                    Your chat has been disconnected. If you block this contact
                    they cannot connect with you using Ports, Superports or
                    contact sharing.
                  </NumberlessText>
                </View>
                <View
                  style={{
                    gap: 10,
                    marginBottom: PortSpacing.intermediate.top,
                  }}>
                  <PrimaryButton
                    primaryButtonColor={isBlocked ? 'w' : 'r'}
                    buttonText={isBlocked ? 'Unblock contact' : 'Block contact'}
                    onClick={() => setConfirmBlockUserSheet(true)}
                    isLoading={false}
                    disabled={false}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
        <EditName
          visible={editingName}
          onClose={() => setEditingName(false)}
          name={displayName}
          setName={setDisplayName}
          title="Update this contact's name"
        />
        <ConfirmationBottomSheet
          visible={confirmBlockUserSheet}
          onClose={() => setConfirmBlockUserSheet(false)}
          onConfirm={async () => {
            isBlocked ? await unblockUser() : await blockUser();
          }}
          title={
            isBlocked
              ? `Are you sure you want to unblock ${displayName}?`
              : `Are you sure you want to block ${displayName}?`
          }
          description={
            isBlocked
              ? `After you unblock ${displayName}, you may connect with them over Ports or Superports.`
              : `Blocking ${displayName} will prevent them from connecting with you over Ports, Superports or contact sharing until you unblock them.`
          }
          buttonText={isBlocked ? 'Unblock contact' : 'Block contact'}
          buttonColor="r"
        />
        {isSharingContact && (
          <ContactSharingBottomsheet
            visible={isSharingContact}
            onClose={() => setIsSharingContact(false)}
            contactShareParams={{name: displayName, pairHash: pairHash}}
          />
        )}
        {focusProfilePicture && (
          <ProfilePictureBlurViewModal
            avatarUrl={displayPic}
            onClose={() => setFocusProfilePicture(false)}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styling = (_colors: any) =>
  StyleSheet.create({
    mainContainer: {
      padding: PortSpacing.secondary.uniform,
      paddingTop: 0,
      paddingBottom: 0,
      flex: 1,
    },
    disconnectedwrapper: {
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      flex: 1,
    },
    nameEditHitbox: {
      marginTop: PortSpacing.secondary.top,
      flexDirection: 'row',
      alignItems: 'center',
    },
    alertwrapper: {flex: 1, justifyContent: 'center'},
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: PortSpacing.primary.bottom,
    },
  });

export default ContactProfile;
