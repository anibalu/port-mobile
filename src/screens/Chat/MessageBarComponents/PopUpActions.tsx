import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {ContentType} from '@utils/Messaging/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {Asset, launchImageLibrary} from 'react-native-image-picker';

const PopUpActions = ({
  togglePopUp,
  isGroupChat,
  chatId,
}: {
  togglePopUp: () => void;
  isGroupChat: boolean;
  chatId: string;
}) => {
  const navigation = useNavigation();
  const svgArray = [
    {
      assetName: 'VideoIcon',
      light: require('@assets/light/icons/media/Video.svg').default,
      dark: require('@assets/dark/icons/media/Video.svg').default,
    },
    {
      assetName: 'FileIcon',
      light: require('@assets/light/icons/media/Files.svg').default,
      dark: require('@assets/dark/icons/media/Files.svg').default,
    },
    {
      assetName: 'ImageIcon',
      light: require('@assets/light/icons/media/Gallery.svg').default,
      dark: require('@assets/dark/icons/media/Gallery.svg').default,
    },
    {
      assetName: 'ContactIcon',
      light: require('@assets/light/icons/media/Contact.svg').default,
      dark: require('@assets/dark/icons/media/Contact.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const VideoIcon = results.VideoIcon;
  const FileIcon = results.FileIcon;
  const ImageIcon = results.ImageIcon;
  const ContactIcon = results.ContactIcon;

  // to go to gallery confirmation screen
  const goToConfirmation = (lst: any[]) => {
    if (lst.length > 0) {
      navigation.navigate('GalleryConfirmation', {
        selectedMembers: [{chatId: chatId}],
        shareMessages: lst,
        isChat: true,
        isGroupChat: isGroupChat,
      });
    }
    togglePopUp();
  };

  // image pressed
  const onImagePressed = async (): Promise<void> => {
    try {
      // launch gallery
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 6,
      });
      //images are selected
      const selected: Asset[] = response.assets || [];
      const fileList = [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };

        const msg = {
          contentType: ContentType.image,
          data: {...file},
        };
        fileList.push(msg);
      }
      // goes to gallery confirmation
      goToConfirmation(fileList);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  // video pressed
  const onVideoPressed = async (): Promise<void> => {
    try {
      // launch gallery
      const response = await launchImageLibrary({
        mediaType: 'video',
        includeBase64: false,
        selectionLimit: 6,
      });
      const fileList = [];
      //videos are selected
      const selected: Asset[] = response.assets || [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };
        //video is sent
        const msg = {
          contentType: ContentType.video,
          data: {...file},
        };
        fileList.push(msg);
      }
      // goes to gallery confirmation
      goToConfirmation(fileList);
      //send media message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  // file pressed
  const onFilePressed = async (): Promise<void> => {
    try {
      // open files
      const selected: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.audio,
          DocumentPicker.types.csv,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.pdf,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.zip,
        ],
        //We need to copy documents to a directory locally before sharing on newer Android.
        ...(!isIOS && {copyTo: 'cachesDirectory'}),
      });
      const fileList = [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].fileCopyUri
            ? selected[index].fileCopyUri
            : selected[index].uri,
          fileType: selected[index].type || '',
          fileName: selected[index].name || '',
        };
        //file is sent
        const msg = {
          contentType: ContentType.file,
          data: {...file},
        };
        fileList.push(msg);
      }
      //send file message
      goToConfirmation(fileList);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.popUpContainer}>
      <View style={styles.optionContainer}>
        <Pressable style={styles.optionBox} onPress={onImagePressed}>
          <ImageIcon />
        </Pressable>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          textColor={Colors.text.primary}
          fontType={FontType.rg}>
          Images
        </NumberlessText>
      </View>
      <View style={styles.optionContainer}>
        <Pressable style={styles.optionBox} onPress={onVideoPressed}>
          <VideoIcon />
        </Pressable>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          textColor={Colors.text.primary}
          fontType={FontType.rg}>
          Videos
        </NumberlessText>
      </View>
      <View style={styles.optionContainer}>
        <Pressable style={styles.optionBox} onPress={onFilePressed}>
          <FileIcon />
        </Pressable>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          textColor={Colors.text.primary}
          fontType={FontType.rg}>
          Files
        </NumberlessText>
      </View>
      {!isGroupChat && (
        <View style={styles.optionContainer}>
          <Pressable
            style={styles.optionBox}
            onPress={() => {
              togglePopUp();
              navigation.navigate('ShareContact', {chatId: chatId});
            }}>
            <ContactIcon />
          </Pressable>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            textColor={Colors.text.primary}
            style={{textAlign: 'center'}}
            fontType={FontType.rg}>
            Contact
          </NumberlessText>
        </View>
      )}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    popUpContainer: {
      flexDirection: 'row',
      paddingTop: 20,
      flexWrap: 'wrap',
      paddingLeft: 24,
      paddingRight: 24,
      backgroundColor: colors.primary.surface,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      justifyContent: 'space-between',
      marginHorizontal: 10,
    },
    textInputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginHorizontal: PortSpacing.tertiary.uniform,
      paddingBottom: PortSpacing.tertiary.bottom,
    },
    replyContainerStyle: {
      width: '100%',
      overflow: 'hidden',
      borderRadius: 12,
      minHeight: PortSpacing.primary.uniform,
      backgroundColor: colors.primary.background,
    },
    replyContainer: {
      width: '100%',
      paddingHorizontal: 4,
      paddingTop: 4,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
    },
    textInput: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      overflow: 'hidden',
      borderRadius: 20,
      alignItems: 'center',
    },
    recordingbar: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      overflow: 'hidden',
      width: screen.width - 63,
      borderRadius: 24,
      height: 40,
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    whilerecordingbar: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      overflow: 'hidden',
      width: screen.width - 73,
      borderRadius: 24,
      height: 40,
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },

    recordingmodal: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: '#D8CCF9',
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: 70,
      left: screen.width / 2 - 70,
    },
    plus: {
      width: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    send: {
      width: 40,
      height: 40,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.button.black,
    },
    recording: {
      width: 50,
      height: 50,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.button.black,
    },

    optionContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: 70,
      height: 100,
    },
    optionBox: {
      width: 60,
      height: 60,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      backgroundColor: colors.primary.surface2,
    },
  });
export default PopUpActions;
