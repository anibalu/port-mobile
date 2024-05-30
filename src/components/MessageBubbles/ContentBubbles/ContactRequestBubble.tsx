import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_AVATAR, DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MAX_WIDTH_CONTENT, RenderTimeStamp} from '../BubbleUtils';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {generateBundleForContactSharing} from '@utils/ContactSharing';

import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const ContactRequestBubble = ({message}: {message: SavedMessageParams}) => {
  const [destination, setDestination] = useState(DEFAULT_NAME);

  const [requesterName, setRequesterName] = useState<string>(DEFAULT_NAME);
  const [permissionId, setPermissionId] = useState<string>('');
  const approved = message.data?.approved;

  const {chatId, profileUri, isConnected} = useChatContext();

  useEffect(() => {
    setDestination(message.data?.destinationName);
  }, [message]);

  useEffect(() => {
    (async () => {
      const dataHandler = new DirectChat(chatId);
      const chatData = await dataHandler.getChatData();
      setPermissionId(chatData.permissionsId);
      setRequesterName(chatData.name);
    })();
  }, [chatId]);

  const onSettingsPressed = async () => {
    navigation.navigate('ContactProfile', {
      chatId: chatId,
      name: requesterName,
      profileUri: profileUri || DEFAULT_AVATAR,
      permissionsId: permissionId,
      isConnected: isConnected,
    });
  };

  const navigation = useNavigation();

  const onAllowOnceClicked = async () => {
    await generateBundleForContactSharing({
      approvedMessageId: message.messageId,
      requester: chatId,
      destinationName: message.data?.destinationName,
      source: message.data?.source,
    });
  };

  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'ContactShareIcon',
      light: require('@assets/icons/ContactShareIcon.svg').default,
      dark: require('@assets/dark/icons/ContactShareIcon.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Icon = results.ContactShareIcon;
  return (
    <View style={{padding: 8, width: MAX_WIDTH_CONTENT - 16}}>
      {message.sender ? (
        <>
          <View style={{flexDirection: 'row', gap: 4}}>
            <Icon style={{marginTop: 4}} />
            {approved ? (
              <NumberlessText
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {requesterName}'s{' '}
                </NumberlessText>
                contact was successfully shared with
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {' '}
                  {destination}.
                </NumberlessText>
              </NumberlessText>
            ) : (
              <NumberlessText
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                You shared
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {' '}
                  {requesterName}'s
                </NumberlessText>{' '}
                contact with
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {' '}
                  {destination}{' '}
                </NumberlessText>
                and it is awaiting their approval.
              </NumberlessText>
            )}
          </View>
          <View style={{marginTop: 4}}>
            <RenderTimeStamp message={message} />
          </View>
        </>
      ) : (
        <>
          {approved ? (
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              {requesterName} shared your contact with {destination}
            </NumberlessText>
          ) : (
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              {requesterName} tried to share your contact with {destination}.
              Allow {destination} to connect?
            </NumberlessText>
          )}

          <View style={{marginTop: 4}}>
            <RenderTimeStamp message={message} />
          </View>
          {!approved && (
            <>
              <LineSeparator />

              <Pressable
                onPress={async () => await onAllowOnceClicked()}
                style={styles.receiveMessageStyle}>
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}
                  textColor={Colors.primary.accent}>
                  Allow Once
                </NumberlessText>
              </Pressable>
            </>
          )}

          <LineSeparator />

          <Pressable
            onPress={() => onSettingsPressed()}
            style={styles.receiveMessageStyle}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}
              textColor={Colors.primary.accent}>
              Manage Settings
            </NumberlessText>
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  receiveMessageStyle: {
    paddingVertical: 5,
    width: MAX_WIDTH_CONTENT - 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 12,
    marginTop: 4,
  },
});

export default ContactRequestBubble;
