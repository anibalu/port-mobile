import React from 'react';
import {StyleSheet, View} from 'react-native';

import {MediaStream, RTCView} from 'react-native-webrtc';

import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';

import {DEFAULT_AVATAR} from '@configs/constants';

import {CallUIState} from '../OngoingCall';

export const MyStream = ({
  myStream,
  myAvatar = DEFAULT_AVATAR,
  myVideoSize = MyVideoSize.small,
  callUIState,
  showAvatar = false,
  onTop = true,
}: {
  myStream: MediaStream | undefined;
  myAvatar?: string;
  myVideoSize?: MyVideoSize;
  callUIState: CallUIState;
  showAvatar?: boolean;
  onTop?: boolean;
}) => {
  return (
    <>
      {callUIState.myVideo && myStream ? (
        <VideoView
          myMediaStream={myStream}
          myVideoSize={myVideoSize}
          onTop={onTop}
        />
      ) : showAvatar ? (
        <AvatarView myAvatar={myAvatar} myVideoSize={myVideoSize} />
      ) : (
        <></>
      )}
    </>
  );
};

const AvatarView = ({
  myAvatar,
  myVideoSize,
}: {
  myAvatar: string;
  myVideoSize: MyVideoSize;
}) => {
  const myVideoDimensions = getMyVideoDimensions(myVideoSize);
  const colors = DynamicColors();
  return (
    <View
      style={
        styles(
          myVideoDimensions,
          myVideoSize === MyVideoSize.small
            ? colors.primary.genericGrey
            : colors.primary.genericDark,
        ).myVideoContainer
      }>
      <View
        style={
          styles(
            myVideoDimensions,
            myVideoSize === MyVideoSize.small
              ? colors.primary.genericGrey
              : colors.primary.genericDark,
          ).myAvatar
        }>
        <AvatarBox
          profileUri={myAvatar}
          avatarSize={myVideoSize === MyVideoSize.small ? 's' : 'l'}
        />
      </View>
    </View>
  );
};

const VideoView = ({
  myMediaStream,
  myVideoSize,
  onTop = true,
}: {
  myMediaStream: MediaStream;
  myVideoSize: MyVideoSize;
  onTop?: boolean;
}) => {
  const myVideoDimensions = getMyVideoDimensions(myVideoSize);
  const colors = DynamicColors();
  // Decide if my view should be mirrored or not. When facing me, yes, Otherwise no.
  let mirrored = true;
  try {
    mirrored =
      myMediaStream.getVideoTracks()[0].getConstraints().facingMode === 'user';
  } catch {
    // Leave the stream mirroring as is
    console.error('Could not switch camera mirroring');
  }
  return (
    <View
      style={
        styles(
          myVideoDimensions,
          myVideoSize === MyVideoSize.small
            ? colors.primary.genericGrey
            : colors.primary.genericDark,
        ).myVideoContainer
      }>
      <View
        style={
          styles(
            myVideoDimensions,
            myVideoSize === MyVideoSize.small
              ? colors.primary.genericGrey
              : colors.primary.genericDark,
          ).myVideo
        }>
        <RTCView
          streamURL={myMediaStream.toURL()}
          mirror={mirrored}
          style={{
            ...myVideoDimensions,
            position: 'absolute',
          }}
          objectFit={'cover'}
          zOrder={onTop ? 1 : 0}
        />
      </View>
    </View>
  );
};

const myVideoLargeDimensions = {
  height: screen.height - 90,
  width: screen.width,
};
const myVideoSmallDimensions = {
  height: 200,
  width: 120,
};

export enum MyVideoSize {
  small = 's',
  large = 'l',
}

function getMyVideoDimensions(size: MyVideoSize) {
  if (size === MyVideoSize.small) {
    return myVideoSmallDimensions;
  }
  return myVideoLargeDimensions;
}

const styles = (
  myVideoDimensions: {height: number; width: number},
  backgroundColor: string,
) =>
  StyleSheet.create({
    myVideoContainer: {
      ...myVideoDimensions,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      backgroundColor: backgroundColor,
    },
    myVideo: {
      ...myVideoDimensions,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
    },
    myAvatar: {
      ...myVideoDimensions,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
