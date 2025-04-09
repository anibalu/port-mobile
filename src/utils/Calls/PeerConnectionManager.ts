/**
 * Class responsible for managing the peer connection for a line call
 */
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

import {
  DispatchWorkItem,
  PeerConnectionWorkItem,
  SignallingPayload,
  SignallingWorkItem,
} from './CallWorkQueue';
import {getPeerRtcConfig} from '@utils/Calls/APICalls';
import RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';

export enum CallEvents {
  micOn = 'mic_on',
  micOff = 'mic_off',
  videoOn = 'video_on',
  videoOff = 'video_off',
}

export interface CallRequestEvents {
  requestState: boolean; //true if the peer is requesting the state of the call
  micOn: boolean; //true if the peer has microphone enabled
  videoOn: boolean; //true if the peer has video enabled
}

/**
 * We make incredibly heavy use of dependency injection to set up our listeners.
 * This way we can maintain references to assist in cleanup, without having them
 * tied to instance attributes of the manager
 */

/**
 * Create a callback for when peer negotiation is needed
 * @param peerConnection
 * @param dispatchWorkItem
 * @returns
 */
function createNegotiationNeededListener(
  peerConnection: RTCPeerConnection,
  dispatchWorkItem: DispatchWorkItem,
) {
  return async (_event: any): Promise<void> => {
    // Session constraints are what we're asking for from the peer
    const sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    };
    const offerDescription = await peerConnection.createOffer(
      sessionConstraints,
    );
    await peerConnection.setLocalDescription(offerDescription);
    const msg: SignallingWorkItem = {
      type: 'signal',
      message: {
        type: 'offer',
        message: offerDescription,
      },
    };
    dispatchWorkItem({target: 'signaller', item: msg});
  };
}

/**
 * Create a callback for when a new candidate is discovered
 * @param dispatchWorkItem
 * @returns
 */
function createIceCandidateListener(dispatchWorkItem: DispatchWorkItem) {
  return (event: any) => {
    if (!event.candidate) {
      return;
    }
    const candidatePayload: SignallingPayload = {
      type: 'candidate',
      message: event.candidate,
    };
    dispatchWorkItem({
      target: 'signaller',
      item: {
        type: 'signal',
        message: candidatePayload,
      },
    });
  };
}

/**
 * Create a callback for when peer media stream tracks change
 * @param peerMediaStream
 * @param dispatchWorkItem
 * @returns
 */
function createTrackListener(
  peerMediaStream: MediaStream,
  dispatchWorkItem: DispatchWorkItem,
) {
  return (event: any) => {
    peerMediaStream.addTrack(event.track);
    dispatchWorkItem({target: 'coordinator', item: 'peer_stream_track_update'});
  };
}

/**
 * Create callback for when the ice connection state changes
 * @param peerConnection
 * @param dispatchWorkItem
 * @returns
 */
function createIceConnectionStateChangeListener(
  peerConnection: RTCPeerConnection,
  dispatchWorkItem: DispatchWorkItem,
) {
  return (_event: any) => {
    switch (peerConnection.iceConnectionState) {
      case 'connected':
        console.log('Peer connection established');
        dispatchWorkItem({target: 'coordinator', item: 'peer_connected'});
        break;
      case 'completed':
        console.log(
          'Completed peer connection with the most suitible candidate',
        );
        // Close the signaller since we're done
        dispatchWorkItem({target: 'coordinator', item: 'closed_signaller'});
        break;
      case 'disconnected':
      case 'closed':
        console.log('The peer connection is ended');
        dispatchWorkItem({
          target: 'coordinator',
          item: 'peer_connection_ended',
        });
        break;
      default:
        console.warn(
          'Unhandled peer connection state',
          peerConnection.iceConnectionState,
        );
    }
  };
}

/**
 * Setup a listener to react to various call events.
 * @param dispatchWorkItem - dispatcher function.
 */
function createCallEventListener(dispatchWorkItem: DispatchWorkItem) {
  return (event: {data: string}) => {
    console.log('Received call event: ', event);
    try {
      const callRequest = JSON.parse(event.data);
      if (
        typeof callRequest === 'object' &&
        callRequest !== null &&
        'requestState' in callRequest
      ) {
        console.log('Processing call request');
        processCallRequest(callRequest, dispatchWorkItem);
        return;
      }
      throw new Error('Invalid call request');
    } catch (error) {
      console.log('Error parsing call request. Defaulting call events');
      processCallEvent(event.data as CallEvents, dispatchWorkItem);
    }
  };
}

/**
 * Process a call request.
 * @param callRequest - call request to process.
 * @param dispatchWorkItem - dispatcher function.
 */
function processCallRequest(
  callRequest: CallRequestEvents,
  dispatchWorkItem: DispatchWorkItem,
) {
  if (callRequest.requestState) {
    dispatchWorkItem({
      target: 'peerConnection',
      item: {type: 'send_initial_state', info: {}},
    });
  }
  dispatchWorkItem({
    target: 'coordinator',
    item: callRequest?.micOn ? 'peer_mic_turned_on' : 'peer_mic_turned_off',
  });
  dispatchWorkItem({
    target: 'coordinator',
    item: callRequest?.videoOn
      ? 'peer_video_turned_on'
      : 'peer_video_turned_off',
  });
}

/**
 * Process a call event.
 * @param callEvent - call event to process.
 * @param dispatchWorkItem - dispatcher function.
 */
function processCallEvent(
  callEvent: CallEvents,
  dispatchWorkItem: DispatchWorkItem,
) {
  switch (callEvent) {
    case CallEvents.micOn:
      dispatchWorkItem({target: 'coordinator', item: 'peer_mic_turned_on'});
      break;
    case CallEvents.micOff:
      dispatchWorkItem({target: 'coordinator', item: 'peer_mic_turned_off'});
      break;
    case CallEvents.videoOn:
      dispatchWorkItem({target: 'coordinator', item: 'peer_video_turned_on'});
      break;
    case CallEvents.videoOff:
      dispatchWorkItem({
        target: 'coordinator',
        item: 'peer_video_turned_off',
      });
      break;
    default:
      console.warn('Unknown call event received', callEvent);
  }
}

export class PeerConnectionManager {
  private peerConnection?: RTCPeerConnection;
  private dispatchWorkItem: DispatchWorkItem;
  private mediaStream: MediaStream; // We don't want the media stream to be managed outside this class
  // which is why we make it private

  // References to listeners for cleanup
  private negotiationNeededListener?: (event: any) => Promise<void>;
  private iceCandidateListener?: (event: any) => void;
  private trackListener?: (event: any) => void;
  private iceConnectionStateChangeListener?: (event: any) => void;
  private savedICECandidates: any[];
  private myMediaStream?: MediaStream; // We need a reference to this to be able to add our streams for

  //data channel to communicate video and mute states.
  private dataChannel?: RTCDataChannel;
  private callEventListener?: (event: any) => void;

  /**
   * Create a new peer connection manager to connect to another Port instance over WebRTC
   * @param dispatchWorkItem Function to dispatch jobs to related components
   */
  constructor(dispatchWorkItem: DispatchWorkItem) {
    this.dispatchWorkItem = dispatchWorkItem;
    this.mediaStream = new MediaStream();
    this.savedICECandidates = [];
  }
  /**
   * Initialise the peer connection manager. Fetches configurations and initializes a peer connection.
   */
  async init(myMediaStream: MediaStream) {
    // Create a new peer connection based on the configuration provided to us from the back end.
    // This includes TURN and stun servers that we can use
    const rtcConfig = await getPeerRtcConfig();
    this.peerConnection = new RTCPeerConnection(rtcConfig);
    this.myMediaStream = myMediaStream;

    // Set up listeners for key actions
    this.setUpSDPListeners();

    // Set up data channel to handle call events
    this.setUpDataChannelReceiver();
  }

  /**
   * Set up ley listeners on the peer connection
   */
  private setUpSDPListeners() {
    // Validate that the peer connection exists
    if (!this.peerConnection) {
      throw Error('Tried setting up listeners before initialization');
    }

    this.negotiationNeededListener = createNegotiationNeededListener(
      this.peerConnection,
      this.dispatchWorkItem,
    );
    this.peerConnection.addEventListener(
      'negotiationneeded',
      this.negotiationNeededListener,
    );

    this.iceCandidateListener = createIceCandidateListener(
      this.dispatchWorkItem,
    );
    this.peerConnection.addEventListener(
      'icecandidate',
      this.iceCandidateListener,
    );

    this.trackListener = createTrackListener(
      this.mediaStream,
      this.dispatchWorkItem,
    );
    this.peerConnection.addEventListener('track', this.trackListener);

    this.iceConnectionStateChangeListener =
      createIceConnectionStateChangeListener(
        this.peerConnection,
        this.dispatchWorkItem,
      );
    this.peerConnection.addEventListener(
      'iceconnectionstatechange',
      this.iceConnectionStateChangeListener,
    );
  }

  /**
   * Go over any saved ice candidates and add them to the peer connection.
   * This is necessary since we may have, through the signalling process,
   * received candidates before receiving an offer or acceptance description.
   */
  private async processSavedIceCandidates() {
    // Go over the saved ice candidates and add them to the peer connection
    let savedICECandidate = this.savedICECandidates.pop();
    while (savedICECandidate) {
      await this.peerConnection?.addIceCandidate(savedICECandidate);
      savedICECandidate = this.savedICECandidates.pop();
    }
  }

  private addMyMediaStreamsToPeer() {
    this.myMediaStream
      ?.getTracks()
      .forEach(track => this.peerConnection?.addTrack(track));
  }

  async processMessage(workItem: PeerConnectionWorkItem) {
    switch (workItem.type) {
      case 'user_joined':
        // We are the person who initiated the call, and our peer has accepted

        // Add the tracks for our media stream, so that when a connection is formed, the
        // peer can see/hear us
        this.openDataChannel();
        this.addMyMediaStreamsToPeer();
        break;
      case 'webrtc_acceptance':
        try {
          const acceptanceResponse = new RTCSessionDescription(workItem.info);
          await this.peerConnection?.setRemoteDescription(acceptanceResponse);
          await this.processSavedIceCandidates();
        } catch (e) {
          console.error('Acceptance failed: ', e);
        }
        break;
      case 'webrtc_candidate':
        try {
          const candidate = new RTCIceCandidate(workItem.info);
          // If we don't yet have the ability to process remote ice candidates, cache it so we
          // can do so when ready. See case webrtc_acceptance
          if (!this.peerConnection?.remoteDescription) {
            this.savedICECandidates.push(candidate);
            return;
          }
          await this.peerConnection.addIceCandidate(candidate);
        } catch (e) {
          console.error('new candidate failed: ', e);
        }
        break;
      case 'webrtc_offer': {
        // We are the person who got called, and have received an offer to start a peer
        // connection from the person who called us. Wow...

        // Add the tracks for our media stream, so that when a connection is formed, the
        // peer can see/hear us
        try {
          this.addMyMediaStreamsToPeer();
        } catch (e) {
          // Don't have a clean way to handle this
          console.error('[PEER CONNECTION] could not add my stream to peer connection')
        }

        // Accept the offer, if possible
        const offerDescription = new RTCSessionDescription(workItem.info);
        await this.peerConnection?.setRemoteDescription(offerDescription);
        const answerDescription = await this.peerConnection?.createAnswer();
        await this.peerConnection?.setLocalDescription(answerDescription);

        await this.processSavedIceCandidates();

        // Send across our answer to the peer over the signaller
        const acceptanceMessage: SignallingWorkItem = {
          type: 'signal',
          message: {
            type: 'acceptance',
            message: answerDescription,
          },
        };
        this.dispatchWorkItem({target: 'signaller', item: acceptanceMessage});
        break;
      }
      case 'data_channel':
        this.dataChannel = workItem.info;
        this.callEventListener = createCallEventListener(this.dispatchWorkItem);
        this.dataChannel.addEventListener('message', this.callEventListener);
        console.log('Got a channel; created by a peer');
        //share and request audio and video state from peer
        this.sendInitialState(true);
        break;
      case 'send_initial_state':
        // send audio and video state to peer
        this.sendInitialState(false);
        break;
      default:
        console.warn('Unknown peer connection work item received', workItem);
    }
  }

  /**
   * Get the peer's media stream.
   * @returns The media stream for the peer
   */
  getMediaStream(): MediaStream {
    return this.mediaStream;
  }

  /**
   * Remove all listeners from the peer connection.
   * This helps prevent memory leaks and gradually decresing performance.
   */
  private removeSDPListeners() {
    if (this.negotiationNeededListener) {
      this.peerConnection?.removeEventListener(
        'negotiationneeded',
        this.negotiationNeededListener,
      );
      this.negotiationNeededListener = undefined;
    }

    if (this.iceCandidateListener) {
      this.peerConnection?.removeEventListener(
        'icecandidate',
        this.iceCandidateListener,
      );
      this.iceCandidateListener = undefined;
    }

    if (this.trackListener) {
      this.peerConnection?.removeEventListener('track', this.trackListener);
      this.trackListener = undefined;
    }

    if (this.iceConnectionStateChangeListener) {
      this.peerConnection?.removeEventListener(
        'iceconnectionstatechange',
        this.iceConnectionStateChangeListener,
      );
      this.iceConnectionStateChangeListener = undefined;
    }
  }

  /**
   * Set's up a listener for if the peer sets up a data channel
   */
  setUpDataChannelReceiver() {
    if (!this.peerConnection || this.dataChannel) {
      return;
    }
    this.peerConnection.addEventListener('datachannel', event => {
      event.channel.addEventListener('open', () =>
        this.dispatchWorkItem({
          target: 'peerConnection',
          item: {
            type: 'data_channel',
            info: event.channel,
          },
        }),
      );
    });
  }

  openDataChannel() {
    if (!this.peerConnection || this.dataChannel) {
      return;
    }
    this.dataChannel = this.peerConnection.createDataChannel('call_events');
    this.dataChannel.addEventListener('open', event =>
      console.log('Data channel open', event),
    );
    this.dataChannel.addEventListener('close', event =>
      console.log('Data channel closed', event),
    );
    this.callEventListener = createCallEventListener(this.dispatchWorkItem);
    this.dataChannel.addEventListener('message', this.callEventListener);
  }

  /**
   * Close the data channel.
   */
  closeDataChannel() {
    this.dataChannel?.removeEventListener('message', this.callEventListener);
    this.callEventListener = undefined;
    this.dataChannel?.close();
    this.dataChannel = undefined;
  }

  /**
   * Send a call event over the data channel.
   * @param callEvent - call event to send.
   */
  sendEvent(callEvent: CallEvents) {
    console.log('Sending data channel event');
    this.dataChannel?.send(callEvent);
  }

  /**
   * Send a call request over the data channel.
   * @param callRequest - call request to send.
   */
  sendInitialState(requestState: boolean): CallRequestEvents {
    console.log('Sending data channel initial state event');
    const videoTrack = this.myMediaStream?.getVideoTracks()[0];
    const audioTrack = this.myMediaStream?.getAudioTracks()[0];
    const request: CallRequestEvents = {
      requestState,
      videoOn: videoTrack?.enabled ? true : false,
      micOn: audioTrack?.enabled ? true : false,
    };
    this.dataChannel?.send(JSON.stringify(request));
    return request;
  }
  /**
   * Once a call is ended call before letting this object be garbage collected
   */
  cleanup() {
    // Remove listeners to prevent leaks
    this.removeSDPListeners();
    this.closeDataChannel();
    this.peerConnection?.close();
  }
}
