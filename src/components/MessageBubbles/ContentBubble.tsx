import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ContentType} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import AudioBubble from './ContentBubbles/AudioBubble';
import ContactBubble from './ContentBubbles/ContactBubble';
import {DeletedBubble} from './ContentBubbles/DeletedBubble';
import {FileBubble} from './ContentBubbles/FileBubble';
import {ImageBubble} from './ContentBubbles/ImageBubble';
import {LinkPreviewBubble} from './ContentBubbles/LinkPreviewBubble';
import {TextBubble} from './ContentBubbles/TextBubble';
import {VideoBubble} from './ContentBubbles/VideoBubble';
import ContactInfoBubble from './ContentBubbles/ContactInfoBubble';
import ContactRequestBubble from './ContentBubbles/ContactRequestBubble';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';
import {CallBubble} from './ContentBubbles/CallBubble';
/**
 * Extend supported content types to support more types of content bubbles.
 */
export const ContentBubble = ({
  message,
  handlePress,
  handleLongPress,
}: {
  message: LoadedMessage;
  handlePress: any;
  handleLongPress: any;
}): ReactNode => {
  switch (message.contentType) {
    case ContentType.text:
      return <TextBubble message={message} />;
    case ContentType.link:
      return (
        <LinkPreviewBubble
          handleLongPress={handleLongPress}
          message={message}
        />
      );
    case ContentType.contactBundle:
      return <ContactBubble message={message} />;
    case ContentType.contactBundleRequest:
      return <ContactRequestBubble message={message} />;
    case ContentType.contactBundleRequestInfo:
      return <ContactInfoBubble message={message} />;
    case ContentType.deleted:
      return <DeletedBubble message={message} />;
    case ContentType.image:
      return (
        <ImageBubble
          message={message}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );

    case ContentType.video:
      return (
        <VideoBubble
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
    case ContentType.audioRecording:
      return (
        <AudioBubble
          message={message}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.call:
      return <CallBubble message={message} />;
    default:
      return (
        <View style={styles.container}>
          <NumberlessText
            style={{color: PortColors.primary.body}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            This is an unsupported content type.
          </NumberlessText>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
