import {
  HandshakeA1Params,
  HandshakeB2Params,
} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {
  handshakeActionsA2,
  handshakeActionsB2,
} from '@utils/DirectChats/handshake';

export class HandshakeResponseA1 extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await handshakeActionsB2(
      this.chatId,
      (this.decryptedMessageContent.data as HandshakeA1Params).pubKey,
    );
  }
}

export class HandshakeResponseB2 extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await handshakeActionsA2(
      this.chatId,
      (this.decryptedMessageContent.data as HandshakeB2Params).pubKey,
      (this.decryptedMessageContent.data as HandshakeB2Params).encryptedNonce,
    );
  }
}
