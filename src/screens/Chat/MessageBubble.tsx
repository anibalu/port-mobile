import React, {useEffect, useState} from 'react';

import {Image, StyleSheet, View} from 'react-native';
import DefaultImage from '../../../assets/avatars/avatar.png';
import {NumberlessRegularText} from '../../components/NumberlessText';
import {DEFAULT_NAME} from '../../configs/constants';
import {extractMemberInfo} from '../../utils/Groups';
import {
  ContentType,
  SavedMessageParams,
} from '../../utils/Messaging/interfaces';
import {createDateBoundaryStamp} from '../../utils/Time';
import DataBubble from './BubbleTypes/DataBubble';
import FileBubble from './BubbleTypes/FileBubble';
import ImageBubble from './BubbleTypes/ImageBubble';
import ReplyBubble from './BubbleTypes/ReplyBubble';
import TextBubble from './BubbleTypes/TextBubble';
import VideoBubble from './BubbleTypes/VideoBubble';

interface MessageBubbleProps {
  message: SavedMessageParams;
  isDateBoundary: boolean;
  selected: string[];
  handlePress: any;
  handleLongPress: any;
  isGroupChat: boolean;
  groupInfo: any;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isDateBoundary,
  selected,
  handlePress,
  handleLongPress,
  isGroupChat,
  groupInfo,
}) => {
  const [intitialContainerType, initialBlobType] = initialStylePicker(
    message.contentType,
    message.sender,
  );
  const [containerType] = useState(intitialContainerType);
  const [blobType, setBlobType] = useState(initialBlobType);
  const [memberInfo, setMemberInfo] = useState({});

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
    if (isGroupChat && !message.sender) {
      setMemberInfo(extractMemberInfo(groupInfo, message.memberId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  return (
    <View style={styles.parentContainer}>
      <View>
        {isDateBoundary ? (
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
        <View>
          {!isDataMessage(message.contentType) &&
            isGroupChat &&
            !message.sender && (
              <Image
                source={{uri: chooseProfileURI()}}
                style={styles.displayPicContainer}
              />
            )}
        </View>
        <View style={blobType}>
          {renderBubbleType(
            message,
            isGroupChat,
            handlePress,
            handleLongPress,
            findMemberName(memberInfo),
            groupInfo,
          )}
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
function findMemberName(memberInfo: any) {
  if (memberInfo.memberId) {
    return memberInfo.name || DEFAULT_NAME;
  }
  return '';
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
  isGroup: boolean,
  handlePress: any,
  handleLongPress: any,
  memberName: string = '',
  groupInfo: any,
) {
  /**
   * @todo add styling properly
   */
  switch (message.contentType) {
    case ContentType.text: {
      if (message.replyId && message.replyId != '') {
        return (
          <ReplyBubble
            message={message}
            memberName={memberName}
            isGroup={isGroup}
            groupInfo={groupInfo}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
          />
        );
      } else {
        return (
          <TextBubble
            message={message}
            memberName={memberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
          />
        );
      }
    }
    case ContentType.image:
      return (
        <ImageBubble
          message={message}
          memberName={memberName}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.video:
      return (
        <VideoBubble
          message={message}
          memberName={memberName}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.file:
      return (
        <FileBubble
          message={message}
          memberName={memberName}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    default:
      return <DataBubble {...message} />;
  }
}
function chooseProfileURI(imageUri: string = '') {
  if (imageUri !== undefined && imageUri !== '') {
    return `file://${imageUri}`;
  } else {
    return Image.resolveAssetSource(DefaultImage).uri;
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
    alignItems: 'flex-start',
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
    backgroundColor: '#81C2FF',
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
    borderWidth: 2,
    marginRight: 5,
    borderColor: '#547CEF',
    maxWidth: '70%',
  },
  ReceiverSelectedBlob: {
    backgroundColor: '#81C2FF',
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
    borderWidth: 2,
    marginLeft: 5,
    borderColor: '#547CEF',
    maxWidth: '70%',
  },
  text: {
    color: '#000000',
  },
  displayPicContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  displayPicParent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default MessageBubble;
