import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import PDF from '../../../assets/icons/PDF.svg';
import {NumberlessBoldText} from '../../components/NumberlessText';
import {getDateStamp} from '../../utils/Time';
import FileViewer from 'react-native-file-viewer';

export default function FileComponent({media}) {
  return (
    <View style={styles.files}>
      {media.map(file => {
        const {name, mtime, path} = file;
        return (
          <Pressable
            key={path}
            onPress={() => {
              FileViewer.open('file://' + path, {
                showOpenWithDialog: true,
              });
            }}>
            <View style={styles.fileBubble}>
              <PDF />
              <NumberlessBoldText style={styles.fileName}>
                {name}
              </NumberlessBoldText>
              <Text>{getDateStamp(mtime)}</Text>
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
