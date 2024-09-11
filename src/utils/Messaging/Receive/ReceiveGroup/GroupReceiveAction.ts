import {
  ContentType,
  DataType,
  MessageStatus,
  PayloadMessageParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/groupMessages';
import {DEFAULT_GROUP_MEMBER_NAME} from '@configs/constants';
import Group from '@utils/Groups/Group';
import {GroupMessageData} from '@utils/Storage/DBCalls/groupMessage';
import {generateRandomHexId} from '@utils/IdGenerator';

class GroupReceiveAction {
  protected message: any;
  protected chatId: string;
  protected groupId: string;
  protected receiveTime: string;
  protected senderId: string;
  protected content: any;
  protected decryptedMessageContent: PayloadMessageParams | null;
  constructor(
    chatId: string,
    groupId: string,
    senderId: string,
    message: any,
    receiveTime: string,
    content: any = null,
    decryptedMessageContent: PayloadMessageParams | null = null,
  ) {
    this.chatId = chatId;
    this.groupId = groupId;
    this.senderId = senderId;
    this.message = message;
    this.receiveTime = receiveTime;
    this.content = content;
    this.decryptedMessageContent = decryptedMessageContent;
  }
  /**
   * Default validation steps. This may differ for some classes like new chat creation classes.
   */
  async validate(): Promise<void> {}
  async performAction(): Promise<void> {}
  decryptedMessageContentNotNullRule(): PayloadMessageParams {
    if (!this.decryptedMessageContent) {
      throw new Error('NullDecryptedMessageContent');
    }
    return this.decryptedMessageContent as PayloadMessageParams;
  }

  /**
   * Save message to group messages storage.
   * @param data
   */
  async saveMessage(data?: DataType) {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const savedMessage: GroupMessageData = {
      chatId: this.chatId,
      messageId: this.decryptedMessageContent.messageId,
      data: data || this.decryptedMessageContent.data,
      contentType: this.decryptedMessageContent.contentType,
      timestamp: this.receiveTime,
      sender: false,
      memberId: this.senderId,
      messageStatus: MessageStatus.delivered,
      replyId: this.decryptedMessageContent.replyId,
      expiresOn: this.decryptedMessageContent.expiresOn,
    };
    await storage.saveGroupMessage(savedMessage);
  }

  /**
   * Save info message to group message storage.
   * @param info
   */
  async saveInfoMessage(info: string) {
    const savedMessage: GroupMessageData = {
      chatId: this.chatId,
      messageId: generateRandomHexId(),
      data: {info: info},
      contentType: ContentType.info,
      timestamp: this.receiveTime,
      sender: false,
      messageStatus: MessageStatus.delivered,
    };
    await storage.saveGroupMessage(savedMessage);
  }

  /**
   * checks if a message is already saved. If it is, throws an error.
   * This is used to guard against multi-processing of messages.
   */
  async doubleProcessingGuard() {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const msg = await storage.getGroupMessage(
      this.chatId,
      this.decryptedMessageContent.messageId,
    );
    if (msg) {
      throw new Error('AttemptedReprocessingError');
    }
  }

  /**
   * Get the sender's name using sender Id
   * @returns
   */
  async getSenderName() {
    const group = new Group(this.chatId);
    const memberData = await group.getMember(this.senderId);
    if (memberData) {
      return memberData.name || DEFAULT_GROUP_MEMBER_NAME;
    }
    return DEFAULT_GROUP_MEMBER_NAME;
  }
}

export default GroupReceiveAction;
