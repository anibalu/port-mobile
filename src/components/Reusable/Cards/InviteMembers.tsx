import React, {useState} from 'react';
import {ActivityIndicator, Pressable} from 'react-native';

import Share from 'react-native-share';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {safeModalCloseDuration} from '@configs/constants';

import { GroupPort } from '@utils/Ports/GroupPorts/GroupPort';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {wait} from '@utils/Time';

import {useTheme} from 'src/context/ThemeContext';

import SimpleCard from './SimpleCard';

const InviteMembers = ({chatData}: {chatData: any}) => {
  const Colors = DynamicColors();

  //whether qr code generation has failed
  const [hasFailed, setHasFailed] = useState(false);

  //whether is error bottom sheet should open
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const fetchPort = async () => {
    try {
      setHasFailed(false);
      //use this function to generate and fetch QR code data.
      const groupPort = await GroupPort.generator.create(chatData.groupId);
      const bundle = await groupPort.getShareableBundle();

      return bundle;
    } catch (error) {
      console.log('Failed to fetch group port: ', error);
      setHasFailed(true);
      return null;
    }
  };

  const onShareClicked = async () => {
    const qrData = await fetchPort();
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openErrorModal) {
      setOpenErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsLinkLoading(true);
      if (qrData && qrData.portId) {
        // generates clickable link for sharing
        const groupPort = await GroupPort.generator.fromPortId(qrData.portId);
        const link = await groupPort.getShareableLink();
        setIsLinkLoading(false);
        try {
          const shareContent = {
            title: 'Share a group link',
            message:
              `Hey! Click the link to join this group ${chatData.name} on Port.\n` +
              link,
          };
          await Share.open(shareContent);
        } catch (error) {
          console.log('Link not shared', error);
        }
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLinkLoading(false);
      setOpenErrorModal(true);
    }
  };
  const {themeValue} = useTheme();

  const svgArray = [
    {
      assetName: 'ShareIcon',
      light: require('@assets/light/icons/ShareGrey.svg').default,
      dark: require('@assets/dark/icons/ShareGrey.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const ShareIcon = results.ShareIcon;
  return (
    <SimpleCard
      style={{
        margin: PortSpacing.secondary.uniform,
        padding: PortSpacing.secondary.uniform,
        gap: PortSpacing.tertiary.uniform,
        marginBottom: 0,
      }}>
      <NumberlessText
        textColor={Colors.labels.text}
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        Invite friends outside of Port!
      </NumberlessText>
      <NumberlessText
        textColor={Colors.text.subtitle}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.s}>
        You can use a one-time use shareable link to invite people outside of
        Port to this group. Tap below to create a one-time link and share it
        with your favourite people.
      </NumberlessText>

      <Pressable
        disabled={isLinkLoading || hasFailed}
        onPress={onShareClicked}
        style={{
          flexDirection: 'row',
          height: 50,
          borderRadius: PortSpacing.medium.uniform,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.primary.surface2,
          gap: 5,
        }}>
        {isLinkLoading ? (
          <ActivityIndicator
            color={
              themeValue === 'light'
                ? Colors.primary.darkgrey
                : Colors.text.primary
            }
          />
        ) : (
          <ShareIcon height={20} width={20} />
        )}
        <NumberlessText
          style={{
            textAlign: 'center',
            color:
              themeValue === 'light'
                ? Colors.primary.darkgrey
                : Colors.text.primary,
          }}
          fontType={FontType.sb}
          fontSizeType={FontSizeType.l}>
          Share one-time link
        </NumberlessText>
      </Pressable>
    </SimpleCard>
  );
};

export default InviteMembers;
