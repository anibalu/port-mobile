/**
 * Help with managing local files outside of the app.
 */

import * as DocumentPicker from '@react-native-documents/picker';

const acceptedFileTypes = [
  DocumentPicker.types.audio,
  DocumentPicker.types.csv,
  DocumentPicker.types.doc,
  DocumentPicker.types.docx,
  DocumentPicker.types.json,
  DocumentPicker.types.pdf,
  DocumentPicker.types.plainText,
  DocumentPicker.types.ppt,
  DocumentPicker.types.pptx,
  DocumentPicker.types.xls,
  DocumentPicker.types.xlsx,
  DocumentPicker.types.zip,
];

type SelectedFile = {
  fileName: string;
  fileUri: string;
  fileType: string;
};

/**
 * Select files from outside the app and save a copy in the cachesDirectrory
 * @returns a list of selected files
 */
export async function selectFiles(): Promise<SelectedFile[]> {
  const selectedFiles = await DocumentPicker.pick({
    allowMultiSelection: true,
    type: acceptedFileTypes,
  });
  if (selectedFiles.length < 1) {
    return [];
  }
  const localFiles = await DocumentPicker.keepLocalCopy({
    files: selectedFiles.map(file => {
      return {
        uri: file.uri,
        fileName: file.name ?? 'fallbackName',
      };
    }),
    destination: 'cachesDirectory',
  });
  console.log('localCopy: ', localFiles);
  //send file message
  const fileForwardList: SelectedFile[] = [];

  for (let i = 0; i < selectedFiles.length; i++) {
    const copyResult = localFiles[i];
    if (copyResult.status !== 'success') {
      continue;
    }
    fileForwardList.push({
      fileName: selectedFiles[i].name || 'file',
      fileType: selectedFiles[i].type || '',
      fileUri: copyResult.localUri,
    });
  }
  return fileForwardList;
}
