// import {
//   ContentType,
//   MessageType,
//   SavedMessageParams,
//   SendStatus,
// } from '../Messaging/interfaces';

// export const generateMessages = (count: number) => {
//   const messagesArray: Array<SavedMessageParams> = [];

//   [...Array(count)].map((e, i) => {
//     const id = (Math.random() + 1).toString(36).substring(7);
//     const cn = {
//       sender: false,
//       sendStatus: SendStatus.success,
//       messageId: id,
//       contentType: ContentType.text,
//       messageType: MessageType.new,
//       timestamp: '2023-11-13T05:11:06Z',
//       chatId: id,
//       data: {text: 'hey there'},
//     };
//     messagesArray.push(cn);
//   });

//   return messagesArray;
// };
