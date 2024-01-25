import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import PDF from '@assets/icons/PDF.svg';
import {NumberlessBoldText} from '@components/NumberlessText';
import {getDateStamp} from '@utils/Time';
import FileViewer from 'react-native-file-viewer';
import {MediaEntry} from '@utils/Media/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

export default function FileComponent({media}: {media: MediaEntry[]}) {
  return (
    <View style={styles.files}>
      {media.map(file => {
        const {name, createdOn, filePath} = file;
        return (
          <Pressable
            key={filePath}
            onPress={() => {
              FileViewer.open(getSafeAbsoluteURI(filePath, 'doc'), {
                showOpenWithDialog: true,
              });
            }}>
            <View style={styles.fileBubble}>
              <PDF />
              <NumberlessBoldText style={styles.fileName}>
                {name}
              </NumberlessBoldText>
              <Text>{getDateStamp(createdOn)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  files: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  fileBubble: {
    width: '90%',
    backgroundColor: 'white',
    height: 90,
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 15,
    color: 'black',
    marginLeft: 15,
    width: '60%',
    marginRight: 5,
  },
});
