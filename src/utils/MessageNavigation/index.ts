import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';

/**
 * Scrolls to a particular message item in the provided FlatList reference.
 * currently being used for reply navigation and search
 * @param message - The target message to scroll to.
 * @param flatlistRef - A reference to the FlatList component.
 * @param messages - The array of LoadedMessage items currently rendered in the FlatList.
 */

export const scrollToMessage = (
  message: LoadedMessage | LoadedGroupMessage,
  flatlistRef: any,
  messages: LoadedMessage[] | LoadedGroupMessage[],
) => {
  if (flatlistRef.current) {
    // Get the top 10 messages from the messages array
    const top10Messages = messages.slice(-10);

    // Check if the target message is within the top 10 messages
    const isWithinLastItems = top10Messages.some(
      msg => msg.messageId === message.messageId,
    );

    flatlistRef.current.scrollToItem({
      animation: true,
      item: message,
      viewPosition: isWithinLastItems ? 0 : 0.4, // If the message is in the top 10, viewPosition is 0
    });
  }
};

// turns off list window mode (fetches latest messages set) and scroll to the bottom of the list
export const exitWindowModeAndScrollDown = (
  flatlistRef: any,
  setListWindowMode: (x: boolean) => void,
) => {
  setListWindowMode(false);
  if (flatlistRef) {
    flatlistRef.current.scrollToOffset({animated: true, offset: 0});
  }
};
