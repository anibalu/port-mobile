import React, {useEffect, useState} from 'react';

import {StyleSheet, View} from 'react-native';
import TextBubble from './BubbleTypes/TextBubble';
import {NumberlessRegularText} from '../../components/NumberlessText';
import {createDateBoundaryStamp} from '../../utils/Time';
import {
  ContentType,
  SavedMessageParams,
} from '../../utils/Messaging/interfaces';
import DataBubble from './BubbleTypes/DataBubble';
import MediaBubble from './BubbleTypes/MediaBubble';
import FileBubble from './BubbleTypes/FileBubble';

interface DirectMessageBubbleProps {
  message: SavedMessageParams;
  selected: string[];
  handlePress: any;
  handleLongPress: any;
}

const DirectMessageBubble: React.FC<DirectMessageBubbleProps> = ({
  message,
  selected,
  handlePress,
  handleLongPress,
}) => {
  const [intitialContainerType, initialBlobType] = initialStylePicker(
    message.contentType,
    message.sender,
  );
  const [containerType] = useState(intitialContainerType);
  const [blobType, setBlobType] = useState(initialBlobType);
  useEffect(() => {
    if (selected.includes(message.messageId)) {
      setBlobType(
        selectedMessageBackgroundStylePicker(
          message.contentType,
          message.sender,
        ),
      );
    } else {
      setBlobType(
        unselectedMessageBackgroundStylePicker(
          message.contentType,
          message.sender,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  return (
    <View style={styles.parentContainer}>
      <View>
        {message.isDateBoundary ? (
          <View style={styles.dateContainer}>
            <NumberlessRegularText style={styles.dateStamp}>
              {createDateBoundaryStamp(message.timestamp)}
            </NumberlessRegularText>
          </View>
        ) : (
          <View />
        )}
      </View>
      <View style={containerType}>
        <View style={blobType}>
          {renderBubbleType(message, handlePress, handleLongPress)}
        </View>
      </View>
    </View>
  );
};

/**
 * Decides the styling of the container - data, sender or receiver container and blobs
 * @param contentType - message content type
 * @param sender - whether message is sent by user
 * @returns - styling
 */
function initialStylePicker(contentType: ContentType, sender: boolean) {
  if (isDataMessage(contentType)) {
    return [styles.DataContainer, styles.DataBlob];
  } else {
    switch (sender) {
      case true:
        return [styles.SenderContainer, styles.SenderBlob];
      case false:
        return [styles.RecieverContainer, styles.ReceiverBlob];
    }
  }
}
function selectedMessageBackgroundStylePicker(
  contentType: ContentType,
  sender: boolean,
) {
  if (isDataMessage(contentType)) {
    return styles.DataBlob;
  }
  switch (sender) {
    case true:
      return styles.SenderSelectedBlob;
    case false:
      return styles.ReceiverSelectedBlob;
  }
}
function unselectedMessageBackgroundStylePicker(
  contentType: ContentType,
  sender: boolean,
) {
  if (isDataMessage(contentType)) {
    return styles.DataBlob;
  }
  switch (sender) {
    case true:
      return styles.SenderBlob;
    case false:
      return styles.ReceiverBlob;
  }
}
function isDataMessage(contentType: ContentType) {
  if (
    contentType === ContentType.newChat ||
    contentType === ContentType.displayImage ||
    contentType === ContentType.handshakeA1 ||
    contentType === ContentType.handshakeB2 ||
    contentType === ContentType.name
  ) {
    return true;
  }
  return false;
}

function renderBubbleType(
  message: SavedMessageParams,
  handlePress: any,
  handleLongPress: any,
) {
  /**
   * @todo add styling properly
   */
  switch (message.contentType) {
    case ContentType.text:
      return (
        <TextBubble
          message={message}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.image:
      return (
        <MediaBubble
          message={message}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.video:
      return (
        <MediaBubble
          message={message}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.file:
      return (
        <FileBubble
          message={message}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    default:
      return <DataBubble {...message} />;
  }
}

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dateContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 8,
  },
  dateStamp: {
    fontSize: 12,
    color: '#83868E',
    backgroundColor: '#EDEDED',
    padding: 8,
    borderRadius: 32,
  },
  SenderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    paddingRight: 5,
    paddingBottom: 3,
    paddingTop: 2,
  },
  RecieverContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 5,
    paddingBottom: 3,
    paddingTop: 2,
  },
  DataContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 3,
    paddingTop: 2,
  },
  SenderBlob: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 20,
    borderWidth: 0.5,
    marginRight: 5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
  },
  ReceiverBlob: {
    backgroundColor: '#D4EBFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 20,
    borderWidth: 0.5,
    marginLeft: 5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
  },
  DataBlob: {
    backgroundColor: '#EFFEE0',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
  },
  SenderSelectedBlob: {
    backgroundColor: '#A3A3A3',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 20,
    borderWidth: 0.5,
    marginRight: 5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
  },
  ReceiverSelectedBlob: {
    backgroundColor: '#A3A3A3',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 20,
    borderWidth: 0.5,
    marginLeft: 5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
  },
  text: {
    color: '#000000',
  },
});

export default DirectMessageBubble;
