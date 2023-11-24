import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import DefaultImage from '@assets/avatars/avatar.png';
import {NumberlessMediumText} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import FileIcon from '@assets/icons/File.svg';

export default function FileReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string;
}) {
  const [fileUri, setFileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setFileURI('file://' + message.data.fileUri);
    }
  }, [message]);
  return (
    <Pressable
      style={styles.replyImageContainer}
      onPress={() => {
        FileViewer.open(fileUri, {
          showOpenWithDialog: true,
        });
      }}>
      <View
        style={{
          backgroundColor: '#FEB95A',
          width: 39,
          height: 39,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <FileIcon />
      </View>

      <View style={{marginLeft: 22}}>
        {renderProfileName(
          shouldRenderProfileName(memberName),
          memberName,
          message.sender,
        )}
        <Text style={styles.fileText}>File</Text>
      </View>
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
  replyImageContainer: {
    minWidth: '70%',
    marginRight: 20,
    height: 63,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileText: {
    marginTop: 10,
  },
});
