/**
 * Types for the call work queue to ensure compatibility between entities
 */

import RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';

export type WorkTarget = 'coordinator' | 'signaller' | 'peerConnection';

export type SignallingWorkItem = {
  type: 'signal';
  message: SignallingPayload;
};

export type SignallingPayload = {
  type: 'offer' | 'candidate' | 'acceptance';
  message: any;
};

export type CoordinatorWorkItem =
  | 'closed_signaller'
  | 'peer_stream_track_update'
  | 'peer_connected'
  | 'peer_connection_ended'
  | 'peer_mic_turned_on'
  | 'peer_mic_turned_off'
  | 'peer_video_turned_on'
  | 'peer_video_turned_off';

export type PeerConnectionWorkItem =
  | {type: 'user_joined'}
  | {
      type: 'webrtc_offer' | 'webrtc_acceptance' | 'webrtc_candidate';
      info: any;
    }
  | {
      type: 'data_channel';
      info: RTCDataChannel;
    };

export type CallWorkItem =
  | {
      target: 'signaller'; // Who is the message meant for?
      item: SignallingWorkItem;
    }
  | {target: 'coordinator'; item: CoordinatorWorkItem}
  | {
      target: 'peerConnection';
      item: PeerConnectionWorkItem;
    };

export type DispatchWorkItem = (callWorkItem: CallWorkItem) => void;
