import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import Play from '@assets/icons/videoPlay.svg';
import {StyleSheet, View, FlatList, Pressable} from 'react-native';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {MediaEntry} from '@utils/Storage/DBCalls/media';
import {ContentType} from '@utils/Messaging/interfaces';
import {useNavigation} from '@react-navigation/native';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {getMessage} from '@utils/Storage/messages';
import {isGroupChat} from '@utils/Storage/connections';
import {getGroupMessage} from '@utils/Storage/groupMessages';

const SharedMediaCard = ({
  chatId,
  media,
}: {
  chatId: string;
  media: MediaEntry[];
}) => {
  const navigation = useNavigation();
  const Colors = DynamicColors();
  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const RightChevron = results.RightChevron;
  const renderSelectedPhoto = ({item}: {item: MediaEntry}) => {
    const onClickMedia = async item => {
      const isGroup = await isGroupChat(item.chatId);
      const media = isGroup
        ? await getGroupMessage(item.chatId, item.messageId)
        : await getMessage(item.chatId, item.messageId);
      if (media) {
        navigation.navigate('MediaViewer', {
          isGroup: isGroup,
          message: media,
        });
      }
    };
    return (
      <View
        key={item.mediaId}
        style={{marginRight: PortSpacing.tertiary.right}}>
        <AvatarBox
          avatarSize="i"
          onPress={() => {
            onClickMedia(item);
          }}
          profileUri={
            item.type === ContentType.video && item.previewPath != undefined
              ? getSafeAbsoluteURI(item.previewPath, 'cache')
              : getSafeAbsoluteURI(item.filePath, 'doc')
          }
        />
        {item.type === ContentType.video && (
          <Play
            style={{
              height: 40,
              width: 40,
              position: 'absolute',
              top: 12,
              left: 12,
            }}
          />
        )}
      </View>
    );
  };

  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
      }}>
      <View style={styles.headerWrapper}>
        <NumberlessText
          textColor={Colors.labels.text}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          Shared media
        </NumberlessText>
        <Pressable
          onPress={() => navigation.navigate('SharedMedia', {chatId: chatId})}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <NumberlessText
            style={{
              color: Colors.labels.text,
              paddingRight: 4,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            See all
          </NumberlessText>
          <RightChevron width={20} height={20} />
        </Pressable>
      </View>
      <View style={{marginTop: 12}}>
        {media.length > 0 ? (
          <FlatList
            data={media.slice(0, 10)}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            horizontal={true}
            renderItem={renderSelectedPhoto}
          />
        ) : (
          <View style={styles.noSharedmediaWrapper}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={Colors.labels.text}
              style={styles.noSharedMediaText}>
              No shared media
            </NumberlessText>
          </View>
        )}
      </View>
    </SimpleCard>
  );
};
const styles = StyleSheet.create({
  noSharedmediaWrapper: {
    alignSelf: 'center',
    marginTop: PortSpacing.tertiary.top,
  },
  noSharedMediaText: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    textAlign: 'center',
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default SharedMediaCard;
