/**
 * Class responsible for managing signalling for a call
 */

import {CALL_URL} from '@configs/api';

import {getToken} from '@utils/ServerAuth';

import {
  CallWorkItem,
  DispatchWorkItem,
  SignallingWorkItem,
} from './CallWorkQueue';

function createOnOpen(socket: WebSocket) {
  return async () => {
    console.log('Socket opened');
    try {
      const token = await getToken();
      socket.send(token);
    } catch (error) {
      console.error('Error on socket open: ', error);
    }
  };
}

function createOnClose(dispatchWorkItem: DispatchWorkItem) {
  return (e: WebSocketMessageEvent) => {
    console.log('Socket closed', e);
    dispatchWorkItem({target: 'coordinator', item: 'closed_signaller'});
  };
}

let receive_cnt = 0;
function createOnMessage(dispatchWorkItem: DispatchWorkItem) {
  return (e: WebSocketMessageEvent) => {
    let message: any;
    try {
      message = JSON.parse(e.data);
      receive_cnt += 1;
      console.log('Received signalling message: ', receive_cnt, message);
    } catch (error) {
      console.error('Could not deserialize signalling message:', error);
    }

    switch (message.event) {
      case 'user_joined':
        // Pass this information on to the peer connection to manage
        dispatchWorkItem({
          target: 'peerConnection',
          item: {type: 'user_joined'},
        });
        break;
      case 'webrtc_offer':
        // Simply pass this information to the peer connection, it will dispatch a
        // message to the signaller with the answer description when needed
        dispatchWorkItem({
          target: 'peerConnection',
          item: {
            type: 'webrtc_offer',
            info: message.message,
          },
        });
        break;
      case 'webrtc_acceptance':
        /**
         * We accept the peer's SDP info answer received as a response to our offer.
         */
        // Let the peer connection know about the acceptance so it can process the answer description
        dispatchWorkItem({
          target: 'peerConnection',
          item: {
            type: 'webrtc_acceptance',
            info: message.message,
          },
        });
        break;
      case 'webrtc_candidate':
        // Let the peer connection know about the new candidate
        dispatchWorkItem({
          target: 'peerConnection',
          item: {
            type: 'webrtc_candidate',
            info: message.message,
          },
        });
        break;
      default:
        console.warn('UNHANDLED SIGNALLING MESSAGE: ', message.event);
    }
  };
}

function createOnError() {
  return (error: WebSocketErrorEvent) => {
    console.error('Signalling error: ', error);
  };
}

export default class Signaller {
  private socket: WebSocket;
  constructor(
    lineId: string,
    dispatchWorkItem: (callWorkItem: CallWorkItem) => void,
  ) {
    console.log('Creating new calling socket for line: ', lineId);
    this.socket = new WebSocket(`${CALL_URL}/line/${lineId}`);
    this.socket.onopen = createOnOpen(this.socket);
    this.socket.onmessage = createOnMessage(dispatchWorkItem);
    this.socket.onclose = createOnClose(dispatchWorkItem);
    this.socket.onerror = createOnError();
  }
  /**
   * Process a work item intended for the signaller
   * @param signallingWorkItem
   */
  processMessage(signallingWorkItem: SignallingWorkItem) {
    switch (signallingWorkItem.type) {
      case 'signal': {
        const payload = JSON.stringify(signallingWorkItem.message);
        this.socket.send(payload);
        break;
      }
      default:
        console.warn(
          '[SIGNALLING] unhandled work item type, ',
          signallingWorkItem.type,
        );
    }
  }

  cleanup() {
    console.log('Cleaning up signaller');
    this.socket.onopen = null;
    this.socket.onmessage = null;
    this.socket.onclose = null;
    this.socket.onerror = null;
    this.socket.close();
  }
}
