// this is to receieve the final contact bundle
import {ContactPortTicketParams} from '@utils/Messaging/interfaces';
import { ContactPort } from '@utils/Ports/ContactPorts/ContactPort';

import DirectReceiveAction from '../DirectReceiveAction';

class ReceiveContactPortTicket extends DirectReceiveAction {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return '';
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();
    //save message to storage
    await this.saveMessage();
    //save contact port bundle to accepted contact ports
    const contactPortTicket = this.decryptedMessageContent
      .data as ContactPortTicketParams;
    const contactPort = await ContactPort.generator.shared.fromPortId(contactPortTicket.contactPortId);
    await contactPort.acceptTicket(contactPortTicket.ticketId, this.chatId);
  }
}

export default ReceiveContactPortTicket;
