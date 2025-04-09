import React from 'react';
import {StyleSheet, View} from 'react-native';

import {MediaStream, RTCView} from 'react-native-webrtc';

import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';

import {DEFAULT_AVATAR} from '@configs/constants';

import {CallUIState} from '../OngoingCall';

export const PeerStream = ({
  peerStream,
  peerAvatar = DEFAULT_AVATAR,
  peerVideoSize = PeerVideoSize.large,
  callUIState,
  onTop = false,
}: {
  peerStream: MediaStream | undefined;
  peerAvatar?: string;
  peerVideoSize?: PeerVideoSize;
  callUIState: CallUIState;
  onTop?: boolean;
}) => {
  return (
    <>
      {callUIState.peerVideo && peerStream ? (
        <VideoView
          peerMediaStream={peerStream}
          peerVideoSize={peerVideoSize}
          onTop={onTop}
        />
      ) : (
        <AvatarView peerAvatar={peerAvatar} peerVideoSize={peerVideoSize} />
      )}
    </>
  );
};

const AvatarView = ({
  peerAvatar,
  peerVideoSize,
}: {
  peerAvatar: string;
  peerVideoSize: PeerVideoSize;
}) => {
  const peerVideoDimensions = getPeerVideoDimensions(peerVideoSize);
  const colors = DynamicColors();
  return (
    <View
      style={
        styles(
          peerVideoDimensions,
          peerVideoSize === PeerVideoSize.small
            ? colors.primary.genericGrey
            : colors.primary.genericDark,
        ).peerVideoContainer
      }>
      <View
        style={
          styles(
            peerVideoDimensions,
            peerVideoSize === PeerVideoSize.small
              ? colors.primary.genericGrey
              : colors.primary.genericDark,
          ).peerAvatar
        }>
        <AvatarBox
          profileUri={peerAvatar}
          avatarSize={peerVideoSize === PeerVideoSize.small ? 's' : 'l'}
        />
      </View>
    </View>
  );
};

const VideoView = ({
  peerMediaStream,
  peerVideoSize,
  onTop = false,
}: {
  peerMediaStream: MediaStream;
  peerVideoSize: PeerVideoSize;
  onTop?: boolean;
}) => {
  const peerVideoDimensions = getPeerVideoDimensions(peerVideoSize);
  const colors = DynamicColors();
  return (
    <View
      style={
        styles(
          peerVideoDimensions,
          peerVideoSize === PeerVideoSize.small
            ? colors.primary.genericGrey
            : colors.primary.genericDark,
        ).peerVideoContainer
      }>
      <View
        style={
          styles(
            peerVideoDimensions,
            peerVideoSize === PeerVideoSize.small
              ? colors.primary.genericGrey
              : colors.primary.genericDark,
          ).peerVideo
        }>
        <RTCView
          streamURL={peerMediaStream.toURL()}
          style={{
            ...peerVideoDimensions,
            position: 'absolute',
          }}
          objectFit={'cover'}
          zOrder={onTop ? 1 : 0}
          iosPIP={{
            enabled: true,
            startAutomatically: true,
            stopAutomatically: true,
            preferredSize: {
              width: 120,
              height: 200,
            },
          }}
        />
      </View>
    </View>
  );
};

const peerVideoLargeDimensions = {
  height: screen.height,
  width: screen.width,
};
const peerVideoSmallDimensions = {
  height: 200,
  width: 120,
};

export enum PeerVideoSize {
  small = 's',
  large = 'l',
}

function getPeerVideoDimensions(size: PeerVideoSize) {
  if (size === PeerVideoSize.small) {
    return peerVideoSmallDimensions;
  }
  return peerVideoLargeDimensions;
}

const styles = (
  peerVideoDimensions: {height: number; width: number},
  backgroundColor: string,
) =>
  StyleSheet.create({
    peerVideoContainer: {
      ...peerVideoDimensions,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      backgroundColor: backgroundColor,
    },
    peerVideo: {
      ...peerVideoDimensions,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
    },
    peerAvatar: {
      ...peerVideoDimensions,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
