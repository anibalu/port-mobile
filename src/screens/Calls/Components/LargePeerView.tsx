// import React from 'react';
// import {useCallContext} from '../CallContext';
// import {DEFAULT_AVATAR} from '@configs/constants';
// import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
// import {StyleSheet, View} from 'react-native';
// import {PortSpacing, screen} from '@components/ComponentUtils';
// import {MediaStream, RTCView} from 'react-native-webrtc';
// import DynamicColors from '@components/DynamicColors';

// export const LargePeerView = ({
//   peerStream,
//   peerAvatar = DEFAULT_AVATAR,
//   myStream,
//   myAvatar = DEFAULT_AVATAR,
// }: {
//   peerStream: MediaStream | undefined;
//   peerAvatar?: string;
//   myStream: MediaStream | undefined;
//   myAvatar?: string;
// }) => {
//   const {callUIState} = useCallContext();
//   return (
//     <View>
//       {callUIState.peerVideo && peerStream ? (
//         <VideoView
//           peerMediaStream={peerStream}
//           myStream={myStream}
//           myAvatar={myAvatar}
//         />
//       ) : (
//         <AvatarView
//           peerAvatar={peerAvatar}
//           myStream={myStream}
//           myAvatar={myAvatar}
//         />
//       )}
//     </View>
//   );
// };

// const MyView = ({
//   myStream,
//   myAvatar,
// }: {
//   myStream: MediaStream | undefined;
//   myAvatar: string;
// }) => {
//   const colors = DynamicColors();
//   const {callUIState} = useCallContext();
//   return (
//     <View style={styles(colors).myVideoContainer}>
//       {callUIState.myVideo && myStream ? (
//         <View style={styles(colors).myVideo}>
//           <RTCView
//             streamURL={myStream.toURL()}
//             style={{
//               ...myVideoSmallDimensions,
//               position: 'absolute',
//             }}
//           />
//         </View>
//       ) : (
//         <View style={styles(colors).myAvatar}>
//           <AvatarBox profileUri={myAvatar} avatarSize={'s'} />
//         </View>
//       )}
//     </View>
//   );
// };

// const AvatarView = ({
//   peerAvatar,
//   myStream,
//   myAvatar,
// }: {
//   peerAvatar: string;
//   myStream: MediaStream | undefined;
//   myAvatar: string;
// }) => {
//   const colors = DynamicColors();

//   return (
//     <View>
//       <View style={styles(colors).peerVideoContainer}>
//         <View style={styles(colors).peerAvatar}>
//           <AvatarBox profileUri={peerAvatar} avatarSize={'l'} />
//         </View>
//       </View>
//       <MyView myStream={myStream} myAvatar={myAvatar} />
//     </View>
//   );
// };

// const VideoView = ({
//   peerMediaStream,
//   myStream,
//   myAvatar,
// }: {
//   peerMediaStream: MediaStream;
//   myStream: MediaStream | undefined;
//   myAvatar: string;
// }) => {
//   const colors = DynamicColors();

//   return (
//     <View>
//       <View style={styles(colors).peerVideoContainer}>
//         <View style={styles(colors).peerVideo}>
//           <RTCView
//             streamURL={peerMediaStream.toURL()}
//             style={{
//               ...peerVideoLargeDimensions,
//               position: 'absolute',
//             }}
//           />
//         </View>
//       </View>
//       <MyView myStream={myStream} myAvatar={myAvatar} />
//     </View>
//   );
// };

// const peerVideoLargeDimensions = {
//   height: screen.height - 90,
//   width: screen.width,
// };
// const myVideoSmallDimensions = {
//   height: 200,
//   width: 110,
// };

// const styles = (colors: any) =>
//   StyleSheet.create({
//     peerVideoContainer: {
//       ...peerVideoLargeDimensions,
//       justifyContent: 'center',
//       alignItems: 'center',
//       position: 'absolute',
//       backgroundColor: 'transparent',
//     },
//     peerVideo: {
//       ...peerVideoLargeDimensions,
//       justifyContent: 'center',
//       alignItems: 'center',
//       position: 'absolute',
//     },
//     peerAvatar: {
//       ...peerVideoLargeDimensions,
//       position: 'absolute',
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     myVideoContainer: {
//       ...myVideoSmallDimensions,
//       justifyContent: 'center',
//       alignItems: 'center',
//       position: 'absolute',
//       bottom: 90 + PortSpacing.secondary.bottom,
//       right: PortSpacing.secondary.right,
//     },
//     myVideo: {
//       ...myVideoSmallDimensions,
//       justifyContent: 'center',
//       alignItems: 'center',
//       position: 'absolute',
//     },
//     myAvatar: {
//       ...myVideoSmallDimensions,
//       position: 'absolute',
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: colors.primary.genericDark,
//     },
//   });
