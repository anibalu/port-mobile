import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Move from '@assets/light/icons/folders/MoveChats.svg';
import CreateFolder from '@assets/light/icons/folders/CreateFolder.svg';
import LinkSuperport from '@assets/light/icons/folders/LinkSuperport.svg';
import FolderOptionWithChevron from './FolderOptionWithChevron';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useBottomNavContext} from 'src/context/BottomNavContext';

const DefaultFolderScreen = () => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'Folderinfo',
      light: require('@assets/light/icons/Folderinfo.svg').default,
      dark: require('@assets/dark/icons/Folderinfo.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Folderinfo = results.Folderinfo;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {setSelectedFolderData} = useBottomNavContext();

  return (
    <View
      style={{
        backgroundColor: Colors.primary.surface,
        width: screen.width,
        height: isIOS ? screen.height : screen.height + insets.top,
      }}>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView>
        <View style={styles.top}>
          <NumberlessText
            style={{paddingHorizontal: PortSpacing.secondary.left}}
            textColor={Colors.text.primary}
            fontType={FontType.md}
            fontSizeType={FontSizeType.xl}>
            Folders
          </NumberlessText>
        </View>
        <View style={styles.component}>
          <Folderinfo />
          <NumberlessText
            style={styles.text}
            textColor={Colors.text.primary}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.xl}>
            Organize your chats with Folders
          </NumberlessText>
          <NumberlessText
            style={styles.subtitle}
            textColor={Colors.text.subtitle}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.l}>
            Tag your contacts to folders to better organize and prioritize your
            chats
          </NumberlessText>
          <FolderOptionWithChevron
            Icon={Move}
            text="Move chat to a folder"
            subtitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            onPress={() => console.log('object')}
          />
          <FolderOptionWithChevron
            Icon={CreateFolder}
            text="Create your first folder"
            subtitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            onPress={() =>
              navigation.navigate('CreateFolder', {
                setSelectedFolder: setSelectedFolderData,
              })
            }
          />
          <FolderOptionWithChevron
            Icon={LinkSuperport}
            text="Link a Superport"
            subtitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            onPress={() => console.log('object')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.primary.background,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: PortSpacing.secondary.bottom,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flex: 1,
    },
    top: {
      height: 56,
      backgroundColor: colors.primary.surface,
      justifyContent: 'center',
    },
    component: {
      marginTop: PortSpacing.secondary.top,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.primary.surface,
      marginHorizontal: PortSpacing.secondary.top,
      paddingBottom: PortSpacing.secondary.top,
    },
    text: {
      paddingHorizontal: PortSpacing.secondary.left,
      textAlign: 'left',
      width: '100%',
      marginTop: PortSpacing.secondary.left,
    },
    subtitle: {
      paddingHorizontal: PortSpacing.secondary.left,
      textAlign: 'left',
      width: '100%',
      marginTop: PortSpacing.secondary.left,
      marginBottom: PortSpacing.tertiary.bottom,
    },
  });
export default DefaultFolderScreen;
