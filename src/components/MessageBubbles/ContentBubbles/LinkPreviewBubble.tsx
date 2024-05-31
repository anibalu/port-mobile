import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {LinkParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {Image, Linking, Pressable, StyleSheet, View} from 'react-native';
import {IMAGE_DIMENSIONS} from '../BubbleUtils';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {PortSpacing} from '@components/ComponentUtils';
import {TextBubble} from './TextBubble';
import DynamicColors from '@components/DynamicColors';

/**
 * Extend supported content types to support more types of content bubbles.
 */
export const LinkPreviewBubble = ({
  message,
  handleLongPress,
}: {
  message: SavedMessageParams;
  handleLongPress: any;
}): ReactNode => {
  const data = message.data as LinkParams;
  const {description, title, linkUri, fileUri} = data;

  const handleLinkPress = async (url: string) => {
    try {
      // Check if the device supports the specified URL
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        // Open the URL in the device's default browser
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open URL: ", url);
      }
    } catch (error) {
      console.error('Error opening URL: ', error);
    }
  };
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View>
      <Pressable
        onPress={() => handleLinkPress(linkUri)}
        onLongPress={handleLongPressFunction}
        style={styles.previewContainer}>
        {fileUri && (
          <Image
            resizeMode="contain"
            source={{
              uri: getSafeAbsoluteURI(fileUri!, 'doc'),
            }}
            style={styles.previewImage}
          />
        )}
        {(description || title) && (
          <View style={styles.linkDataContainer}>
            {title && (
              <NumberlessText
                numberOfLines={2}
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                {title}
              </NumberlessText>
            )}
            {description && (
              <NumberlessText
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.s}
                numberOfLines={1}
                fontType={FontType.rg}>
                {description}
              </NumberlessText>
            )}

            {linkUri && (
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                {linkUri}
              </NumberlessText>
            )}
          </View>
        )}
      </Pressable>
      <View style={{width: IMAGE_DIMENSIONS, paddingTop: 4}}>
        <TextBubble message={message} />
      </View>
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    previewContainer: {
      borderRadius: 12,
      backgroundColor: colors.primary.lightgrey,
      flexDirection: 'column',
      width: IMAGE_DIMENSIONS,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    linkDataContainer: {
      width: '100%',
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.tertiary.uniform,
      gap: 4,
    },
    textBubbleColumnContainer: {
      width: IMAGE_DIMENSIONS,

      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    previewImage: {
      width: IMAGE_DIMENSIONS,
      height: 150,
      borderTopLeftRadius: PortSpacing.medium.left,
      borderTopRightRadius: PortSpacing.medium.right,
    },
    textBubbleRowContainer: {
      flexDirection: 'row',

      columnGap: 4,
      justifyContent: 'center',
    },
  });
