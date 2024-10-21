import {PortSpacing, screen} from '@components/ComponentUtils';
import React, {ReactNode, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ImageBackground,
  ScrollView,
} from 'react-native';
import VideoPlayer from 'react-native-video-player';
import NewSuperport from '@assets/dark/icons/NewSuperport.svg';
import DashedLine from '@assets/miscellaneous/DashedLine.svg';
import PlusViolet from '@assets/icons/PlusViolet.svg';
import ShareGreen from '@assets/icons/ShareViolet.svg';
import ScannerGreen from '@assets/icons/ScannerDarkGreen.svg';
import Folder from '@assets/icons/FolderGrey.svg';

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import {BOTTOMBAR_HEIGHT, TOPBAR_HEIGHT} from '@configs/constants';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {useNavigation} from '@react-navigation/native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

//these are the info points being used in 2nd and 3rd slide of UI, text with the icon on left
const InfoItemContent = {
  2: [
    {
      text: 'Safely connect with people without sharing any personal details.',
      Icon: ScannerGreen,
    },
    {text: 'Effortlessly organize connections in one place.', Icon: Folder},
    {
      text: 'Share and manage connections effortlessly with complete control.',
      Icon: ShareGreen,
    },
  ],
  3: [
    {text: 'Create and customize your multi-use QR.', Icon: PlusViolet},
    {text: 'Share it or publish it on any platform.', Icon: ShareGreen},
    {
      text: 'Anyone can scan the QR code or click the link to form a connection with you.',
      Icon: ScannerGreen,
    },
    {
      text: 'Your new connections are automatically funneled into a folder.',
      Icon: Folder,
    },
  ],
};

//renders above info points, used for 2nd and 3rd slide
const renderTabContent = (points: any, Colors: any, styles: any) => {
  return (
    <View style={{gap: PortSpacing.secondary.uniform}}>
      {points.map((point: any, index: any) => (
        <View key={index} style={styles.infoPointWrapper}>
          {point.Icon && (
            <View style={styles.infoPointIconWrapper}>
              <point.Icon height={18} width={18} />
            </View>
          )}
          <NumberlessText
            style={{flex: 1}}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={Colors.text.subtitle}>
            {point.text}
          </NumberlessText>
        </View>
      ))}
      <View
        style={[
          styles.dashedLineWrapper,
          {
            height: points.length * 35,
          },
        ]}>
        <DashedLine />
      </View>
    </View>
  );
};

// Reusable TabButton component
const TabButton = ({
  index,
  label,
  setActiveTabIndex,
  activeTabIndex,
  Colors,
  styles,
}: {
  index: number;
  label: string;
  setActiveTabIndex: (x: number) => void;
  activeTabIndex: number;
  Colors: any;
  styles: any;
}) => (
  <Pressable
    onPress={() => setActiveTabIndex(index)}
    style={StyleSheet.compose(styles.tabWrapper, {
      borderBottomColor:
        activeTabIndex === index
          ? Colors.primary.accent
          : Colors.primary.accentOverlay,
    })}>
    <NumberlessText
      textColor={
        activeTabIndex === index ? Colors.text.primary : Colors.text.placeholder
      }
      style={styles.tabText}
      fontSizeType={FontSizeType.m}
      fontType={FontType.md}>
      {label}
    </NumberlessText>
  </Pressable>
);

const SuperportsEducation = (): ReactNode => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const videoRef = useRef(null);

  const [activeTabIndex, setActiveTabIndex] = useState<number>(1);
  const navigation = useNavigation();

  const onCreateSuperport = () => {
    navigation.navigate('SuperportSetupScreen', {});
  };

  //slide tab headings
  const tabs = [
    {index: 1, label: 'What are \nSuperports?'},
    {index: 2, label: 'Why use \nSuperports?'},
    {index: 3, label: 'How it \nWorks?'},
  ];

  const svgArray = [
    {
      assetName: 'SuperportsInfoVideo',
      light: require('@assets/dark/backgrounds/SuperportsInfoVideo.mp4'),
      dark: require('@assets/dark/backgrounds/SuperportsInfoVideo.mp4'),
    },
    {
      assetName: 'SuperportsInfoThumbnail',
      light: require('@assets/light/backgrounds/SuperportsInfoThumbnail.png'),
      dark: require('@assets/dark/backgrounds/SuperportsInfoThumbnail.png'),
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg'),
      dark: require('@assets/dark/icons/navigation/AngleRight.svg'),
    },
    {
      assetName: 'SuperportCardsBanner',
      light: require('@assets/light/backgrounds/SuperportCardsBanner.png'),
      dark: require('@assets/dark/backgrounds/SuperportCardsBanner.png'),
    },
    {
      assetName: 'SuperportQRBanner',
      light: require('@assets/light/backgrounds/SuperportQRBanner.png'),
      dark: require('@assets/dark/backgrounds/SuperportQRBanner.png'),
    },
  ];
  const results = useDynamicSVG(svgArray);
  const SuperportsInfoThumbnail = results.SuperportsInfoThumbnail;
  const SuperportsInfoVideo = results.SuperportsInfoVideo;
  const SuperportCardsBanner = results.SuperportCardsBanner;
  const SuperportQRBanner = results.SuperportQRBanner;
  const AngleRight = results.AngleRight.default;

  const customStyles = {
    seekBarProgress: {
      backgroundColor: Colors.primary.accent,
      height: 5,
    },
    seekBarKnob: {
      backgroundColor: Colors.primary.accent,
    },
    seekBarBackground: {
      backgroundColor: Colors.primary.white,
      height: 5,
    },
    playButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      width: 60,
      height: 60,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnail: {
      height: 255,
      backgroundColor: Colors.primary.surface2,
      width: screen.width - PortSpacing.secondary.uniform * 2,
    },
    wrapper: {
      height: 253,
    },
    videoWrapper: {
      height: 253,
    },
    video: {
      backgroundColor: '#F3F2F7', //surface2 but same for both theme
      height: 253,
    },
    controls: {
      height: 0,
      width: 0,
    },
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.mainWrapper}>
        <View style={styles.headingTabs}>
          <>
            {tabs.map(({index, label}) => (
              <TabButton
                key={index}
                index={index}
                label={label}
                activeTabIndex={activeTabIndex}
                setActiveTabIndex={setActiveTabIndex}
                Colors={Colors}
                styles={styles}
              />
            ))}
          </>
        </View>
        <ScrollView
          persistentScrollbar
          contentContainerStyle={{
            gap: PortSpacing.secondary.uniform,
          }}>
          <View style={styles.imageContainer}>
            {activeTabIndex === 1 && (
              <VideoPlayer
                ref={videoRef}
                endWithThumbnail={true}
                isControlsVisible={true}
                controlsTimeout={0}
                hideControlsOnStart
                video={SuperportsInfoVideo}
                muted={false}
                ignoreSilentSwitch="ignore"
                customStyles={customStyles}
                pauseOnPress
                videoHeight={253}
                videoWidth={screen.width - PortSpacing.secondary.uniform * 2}
                thumbnail={SuperportsInfoThumbnail}
              />
            )}
            {activeTabIndex === 2 && (
              <ImageBackground
                source={SuperportCardsBanner}
                style={styles.background}
              />
            )}
            {activeTabIndex === 3 && (
              <ImageBackground
                source={SuperportQRBanner}
                style={styles.background}
              />
            )}
          </View>
          <View style={{flex: 1, overflow: 'hidden'}}>
            <>
              {activeTabIndex === 1 && (
                <NumberlessText
                  textColor={Colors.text.subtitle}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.rg}>
                  {`A “Superport” is a multi-use QR or link that is shared to form new connections (unlike “Ports” which are single use). \n \nYou can configure how many times a Superport can be used.`}
                </NumberlessText>
              )}
            </>
            <>
              {activeTabIndex === 2 &&
                renderTabContent(InfoItemContent[2], Colors, styles)}
              {activeTabIndex === 3 &&
                renderTabContent(InfoItemContent[3], Colors, styles)}
            </>
          </View>
        </ScrollView>
        <View style={styles.navigationButtons}>
          {activeTabIndex > 1 && (
            <Pressable
              onPress={() => setActiveTabIndex(prev => prev - 1)}
              style={StyleSheet.compose(styles.navigationButton, {
                marginRight: 'auto',
              })}>
              <AngleRight style={styles.angleIconReversed} />
            </Pressable>
          )}
          {activeTabIndex < 3 && (
            <Pressable
              onPress={() => setActiveTabIndex(prev => prev + 1)}
              style={StyleSheet.compose(styles.navigationButton, {
                marginLeft: 'auto',
              })}>
              <AngleRight />
            </Pressable>
          )}
        </View>
      </View>
      <View style={{marginTop: PortSpacing.secondary.top}}>
        <PrimaryButton
          buttonText="Create a Superport"
          disabled={false}
          isLoading={false}
          onClick={onCreateSuperport}
          primaryButtonColor="p"
          Icon={NewSuperport}
          iconSize="m"
        />
      </View>
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    tabWrapper: {
      textAlign: 'left',
      flex: 1,
      borderBottomWidth: 3,
    },
    tabText: {
      marginBottom: PortSpacing.tertiary.uniform,
    },
    mainContainer: {
      flex: 1,
      height: screen.height - (BOTTOMBAR_HEIGHT + TOPBAR_HEIGHT),
      width: screen.width,
      backgroundColor: colors.primary.surface2,
      padding: PortSpacing.secondary.uniform,
    },
    mainWrapper: {
      flex: 1,
      backgroundColor: colors.primary.surface,
      borderRadius: PortSpacing.secondary.uniform,
      padding: PortSpacing.secondary.uniform,
      gap: PortSpacing.secondary.uniform,
    },
    headingTabs: {
      gap: PortSpacing.medium.uniform,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    background: {
      width: '100%',
      height: 253,
      position: 'absolute',
      resizeMode: 'cover',
      backgroundColor: colors.primary.background,
    },
    imageContainer: {
      height: 253,
      borderRadius: PortSpacing.tertiary.uniform,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoSectionContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: PortSpacing.tertiary.uniform,
      zIndex: 1,
      backgroundColor: colors.primary.surface,
    },
    infoIconWrapper: {
      flexDirection: 'row',
      gap: PortSpacing.tertiary.uniform,
    },
    infoIcon: {
      backgroundColor: colors.lowAccentColors.blue,
      alignItems: 'center',
      justifyContent: 'center',
      height: 32,
      width: 32,
      borderRadius: 100,
    },
    infoText: {
      flex: 1,
    },
    dashedLineWrapper: {
      position: 'absolute',
      overflow: 'hidden',
      top: PortSpacing.secondary.uniform,
      left: PortSpacing.secondary.uniform,
    },
    navigationButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    navigationButton: {
      backgroundColor: colors.primary.surface2,
      borderRadius: 50,
      height: 45,
      width: 45,
      alignItems: 'center',
      justifyContent: 'center',
    },
    angleIconReversed: {
      transform: [{scaleX: -1}],
    },
    infoPointWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: PortSpacing.tertiary.uniform,
      zIndex: 1,
      backgroundColor: colors.primary.surface,
    },
    infoPointIconWrapper: {
      backgroundColor: colors.lowAccentColors.blue,
      alignItems: 'center',
      justifyContent: 'center',
      height: 32,
      width: 32,
      borderRadius: 100,
    },
  });

export default SuperportsEducation;
