import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import NewPortIcon from 'assets/icons/NewPortBlack.svg';
import NewSuperportIcon from '@assets/icons/NewSuperportBlack.svg';
import ScanIcon from '@assets/icons/ScanThinBlack.svg';
import {useNavigation} from '@react-navigation/native';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import TouchableOption from './TouchableOption';
import {FileAttributes} from '@utils/Storage/interfaces';

interface ConnectionOptionsProps {
  setVisible: (isShown: boolean) => void;
  visible: boolean;
  name: string;
  avatar: FileAttributes;
}

export default function ConnectionOptions(props: ConnectionOptionsProps) {
  const {setVisible, visible} = props;
  const navigation = useNavigation();

  const openNewPortScreen = () => {
    setVisible(false);
    navigation.navigate('NewPortScreen', {
      name: props.name,
      avatar: props.avatar,
    });
  };

  // const handleOpenNewGroup = () => {
  //   setVisible(false);
  //   navigation.navigate('CreateNewGroup');
  // };

  const handleOpenSuperport = () => {
    setVisible(false);
    navigation.navigate('SuperportScreen', {
      name: props.name,
      avatar: props.avatar,
    });
  };

  const handleOpenScan = () => {
    setVisible(false);
    navigation.navigate('Scan');
  };

  return (
    <PrimaryBottomSheet
      showClose={false}
      bgColor={'w'}
      visible={visible}
      showNotch={true}
      onClose={() => setVisible(false)}>
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
          {/* <TouchableOption
            title={'New Group'}
            subtitle={'A private group with other Port users'}
            IconLeft={NewGroupIcon}
            onClick={handleOpenNewGroup}
          /> */}
          <TouchableOption
            showBorderBottom={false}
            title={'Scan QR'}
            subtitle={' Scan a QR to add a contact or join a group'}
            IconLeft={ScanIcon}
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
  listItem: {
    paddingVertical: PortSpacing.secondary.uniform,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderBottomColor: PortColors.stroke,
    borderBottomWidth: 1,
    borderBottomEndRadius: 8,
  },
  listContentWrapper: {
    marginLeft: PortSpacing.secondary.uniform,
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
