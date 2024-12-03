import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PortSpacing, screen} from '@components/ComponentUtils';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import TouchableOption from './TouchableOption';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useBottomNavContext} from 'src/context/BottomNavContext';
import {useNavigation} from '@react-navigation/native';
import {defaultFolderInfo} from '@configs/constants';

export default function ConnectionOptions({
  selectedTab,
}: {
  selectedTab?: string;
}) {
  const {
    isConnectionOptionsModalOpen,
    setIsConnectionOptionsModalOpen,
    selectedFolderData,
  } = useBottomNavContext();

  const navigation = useNavigation();

  const openNewPortScreen = () => {
    setIsConnectionOptionsModalOpen(false);
    navigation.push('NewPortScreen', {
      folder:
        selectedTab === 'FolderStack' ? selectedFolderData : defaultFolderInfo,
    });
  };

  const handleOpenNewGroup = () => {
    setIsConnectionOptionsModalOpen(false);
    navigation.push('CreateNewGroup');
  };

  const handleOpenSuperport = () => {
    setIsConnectionOptionsModalOpen(false);
    navigation.push('SuperportSetupScreen', {});
  };

  const handleOpenScan = () => {
    setIsConnectionOptionsModalOpen(false);
    navigation.push('Scan');
  };

  const svgArray = [
    {
      assetName: 'NewSuperportIcon',
      light: require('@assets/icons/OrangeSuperport.svg').default,
      dark: require('assets/icons/OrangeSuperport.svg').default,
    },
    {
      assetName: 'NewPortIcon',
      light: require('@assets/light/icons/NewPort.svg').default,
      dark: require('assets/dark/icons/NewPort.svg').default,
    },
    {
      assetName: 'NewGroupIcon',
      light: require('@assets/light/icons/NewGroup.svg').default,
      dark: require('assets/dark/icons/NewGroup.svg').default,
    },
    {
      assetName: 'ScanQRIcon',
      light: require('@assets/light/icons/ScanQR.svg').default,
      dark: require('assets/dark/icons/ScanQR.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const NewSuperportIcon = results.NewSuperportIcon;
  const NewPortIcon = results.NewPortIcon;
  const NewGroupIcon = results.NewGroupIcon;
  const ScanQRIcon = results.ScanQRIcon;

  return (
    <PrimaryBottomSheet
      showClose={false}
      bgColor={'w'}
      visible={isConnectionOptionsModalOpen}
      showNotch={true}
      onClose={() => setIsConnectionOptionsModalOpen(false)}>
      <View style={styles.connectionOptionsRegion}>
        <View style={styles.mainContainer}>
          <TouchableOption
            title={'New Port'}
            subtitle={'A one-time use QR/link to add a contact'}
            IconLeft={NewPortIcon}
            onClick={openNewPortScreen}
          />
          <TouchableOption
            title={'New Superport'}
            subtitle={'A multi-use QR/link to add contacts'}
            IconLeft={NewSuperportIcon}
            onClick={handleOpenSuperport}
          />
          <TouchableOption
            title={'New Group'}
            subtitle={'A private group with other Port users'}
            IconLeft={NewGroupIcon}
            onClick={handleOpenNewGroup}
          />
          <TouchableOption
            showBorderBottom={false}
            title={'Scan QR'}
            subtitle={'Scan a QR to add a contact or join a group'}
            IconLeft={ScanQRIcon}
            onClick={handleOpenScan}
          />
        </View>
      </View>
    </PrimaryBottomSheet>
  );
}

const styles = StyleSheet.create({
  connectionOptionsRegion: {
    width: screen.width,
  },
  mainContainer: {
    paddingTop: PortSpacing.tertiary.top,
    flexDirection: 'column',
  },
});
