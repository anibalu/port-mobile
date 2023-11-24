import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import DefaultImage from '../../../../assets/avatars/avatar.png';
import {NumberlessMediumText} from '../../../components/NumberlessText';
import {DEFAULT_NAME} from '../../../configs/constants';
import {SavedMessageParams} from '../../../utils/Messaging/interfaces';

export default function VideoReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string;
}) {
  const [videoUri, setVideoURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setVideoURI('file://' + message.data.fileUri);
    }
  }, [message]);
  return (
    <Pressable
      style={styles.replyImageContainer}
      onPress={() => {
        FileViewer.open(videoUri, {
          showOpenWithDialog: true,
        });
      }}>
      <View>
        {renderProfileName(
          shouldRenderProfileName(memberName),
          memberName,
          message.sender,
        )}
        <Text style={styles.imageText}>Video</Text>
      </View>
      <Image source={{uri: videoUri}} style={styles.replyImage} />
    </Pressable>
  );
}

function shouldRenderProfileName(memberName: string) {
  if (memberName === '') {
    return false;
  } else {
    return true;
  }
}

function renderProfileName(
  shouldRender: boolean,
  name: string = DEFAULT_NAME,
  isSender: boolean,
) {
  return (
    <View>
      {isSender ? (
        <NumberlessMediumText>You</NumberlessMediumText>
      ) : shouldRender ? (
        <NumberlessMediumText>{name}</NumberlessMediumText>
      ) : (
        <View />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  replyImage: {
    height: 65,
    width: 65,
    right: '-100%',
    borderRadius: 16,
  },
  replyImageContainer: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageText: {
    marginTop: 10,
  },
});
