import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {MediaEntry} from '@utils/Media/interfaces';
import {getDateStamp} from '@utils/Time';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import ChevronRight from '@assets/icons/navigation/GreyAngleRight.svg';

export default function LinkTile({
  mediaItem,
  selectedMedia,
}: {
  mediaItem: MediaEntry;
  selectedMedia: MediaEntry[];
}) {
  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <View style={styles.previewWrapper}>
          <Image
            source={{
              uri: mediaItem.previewPath
                ? getSafeAbsoluteURI(mediaItem.previewPath, 'cache')
                : getSafeAbsoluteURI(mediaItem.filePath, 'doc'),
            }}
            style={
              selectedMedia.includes(mediaItem)
                ? StyleSheet.compose(styles.previewImage, styles.selectedImage)
                : styles.previewImage
            }
          />
        </View>

        <View style={styles.linkInfoConatiner}>
          <View style={styles.infoMainConatiner}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}>
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                numberOfLines={1}
                textColor={PortColors.title}>
                Meta
              </NumberlessText>
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={PortColors.subtitle}>
                {getDateStamp(mediaItem.createdOn)}
              </NumberlessText>
            </View>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}
              numberOfLines={2}
              textColor={PortColors.subtitle}>
              https://www.meta.com
            </NumberlessText>
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: PortSpacing.secondary.top,
          marginBottom: PortSpacing.tertiary.bottom,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: PortSpacing.secondary.right,
        }}>
        <NumberlessText
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={PortColors.subtitle}>
          https://www.meta.com
        </NumberlessText>
        <ChevronRight width={20} height={20} />
      </View>
      {selectedMedia.includes(mediaItem) && (
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          textColor={PortColors.text.primaryWhite}
          style={styles.countBadge}>
          {selectedMedia.indexOf(mediaItem) + 1}
        </NumberlessText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  previewImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
  },
  previewWrapper: {
    width: 75,
    height: 75,
    backgroundColor: PortColors.background,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  infoMainConatiner: {
    flexDirection: 'column',
    gap: 6,
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  linkInfoConatiner: {
    flexDirection: 'row',
    backgroundColor: PortColors.background,
    gap: 1,
    paddingLeft: PortSpacing.secondary.left,
    paddingRight: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  container: {
    flexDirection: 'column',
    paddingHorizontal: 21,
    width: '100%',
    marginTop: 12,
  },
  countBadge: {
    position: 'absolute',
    bottom: 10,
    right: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: 20,
    height: 20,
    width: 20,
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});
