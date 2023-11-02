import {ChatCrypto} from '../Crypto/interfaces';
import {
  getChatCryptoRNFS,
  saveChatCryptoRNFS,
} from './StorageRNFS/cryptoHandlers';

/**
 * saves cryptographic information pertaining to a chat to storage.
 * @param {string} chatId - chat id for a chat.
 * @param {ChatCrypto} chatCrypto - cryptographic information for a chat.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveChatCrypto(
  chatId: string,
  chatCrypto: ChatCrypto,
  blocking: boolean = false,
) {
  await saveChatCryptoRNFS(chatId, chatCrypto, blocking);
}

/**
 * reads crypto data from storage
 * @param {string} chatId - chat id for a chat.
 * @param {boolean} blocking - whether the function should block operations until completed. default = false
 * @returns {ChatCrypto} - crypto data saved in storage
 */
export async function getChatCrypto(
  chatId: string,
  blocking: boolean = false,
): Promise<ChatCrypto> {
  return await getChatCryptoRNFS(chatId, blocking);
}
