import {isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {ContentType} from '@utils/Messaging/interfaces';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const PopUpActions = ({
  togglePopUp,
  chatId,
}: {
  togglePopUp: () => void;
  chatId: string;
}) => {
  const navigation = useNavigation();
  // to animate popup actions sliding up
  const translateY = useSharedValue(300);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

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
    {
      assetName: 'Templates',
      light: require('@assets/light/icons/Templates.svg').default,
      dark: require('@assets/dark/icons/Templates.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const VideoIcon = results.VideoIcon;
  const FileIcon = results.FileIcon;
  const ImageIcon = results.ImageIcon;
  const ContactIcon = results.ContactIcon;
  const Templates = results.Templates;

  // to go to gallery confirmation screen
  const goToConfirmation = (lst: any[]) => {
    if (lst.length > 0) {
      navigation.push('GalleryConfirmation', {
        selectedMembers: [{chatId: chatId}],
        shareMessages: lst,
        isChat: true,
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
      const selected: DocumentPicker.DocumentPickerResponse[] = await DocumentPicker.pick({
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
          //file path has encoded characters. However, the resource is only accessible after decoding file path.
          //android uses fileCopyUri, ios uses uri.
          fileUri: decodeURIComponent(
            selected[index].fileCopyUri || selected[index].uri,
          ),
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

  const onTemplatePressed = async (): Promise<void> => {
    // TODO: nuke
    navigation.navigate('Templates', {chatId: chatId});
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <Animated.View style={[styles.mainContainer, animatedStyle]}>
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
        <View style={styles.optionContainer}>
          <Pressable style={styles.optionBox} onPress={onTemplatePressed}>
            <Templates height={30} width={30} />
          </Pressable>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            textColor={Colors.text.primary}
            fontType={FontType.rg}>
            Templates
          </NumberlessText>
        </View>
        <View style={styles.optionContainer}>
          <Pressable
            style={styles.optionBox}
            onPress={() => {
              togglePopUp();
              navigation.push('ShareContact', {chatId: chatId});
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
      </View>
    </Animated.View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    popUpContainer: {
      flexDirection: 'row',
      paddingTop: 20,
      flexWrap: 'wrap',
      borderRadius: 16,
      backgroundColor: colors.primary.surface,
      width: 280,
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
