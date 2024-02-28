/**
 * Default chat tile displayed when there are no connections
 */
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import ScanIcon from '@assets/icons/scanBlue.svg';
import NewContactIcon from '@assets/icons/newContact.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import {TOPBAR_HEIGHT} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';

function HomescreenPlaceholder(): ReactNode {
  const {showNewPortModal: showModal} = useConnectionModal();
  const navigation = useNavigation();
  const handleNavigate = (): void => {
    showModal();
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <NumberlessText fontSizeType={FontSizeType.xl} fontType={FontType.sb}>
          Start connecting differently
        </NumberlessText>
        <NumberlessText
          style={{color: PortColors.text.secondary}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          On Port, you create a connection by sharing a “Port” instead of your
          phone number, email or username. This way, you always control who
          docks in your conversation space.
        </NumberlessText>
      </View>
      <View>
        <GenericButton
          buttonStyle={styles.buttonWrapper}
          IconLeft={NewContactIcon}
          iconSize={20}
          onPress={handleNavigate}>
          New Port
        </GenericButton>
        <NumberlessText
          style={{textAlign: 'center'}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          Or
        </NumberlessText>
        <GenericButton
          buttonStyle={StyleSheet.compose(styles.buttonWrapper, {
            backgroundColor: 'transparent',
          })}
          textStyle={{color: PortColors.primary.blue.app}}
          onPress={() => navigation.navigate('Scan')}
          IconLeft={ScanIcon}
          iconSize={20}>
          Scan QR
        </GenericButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: screen.height - TOPBAR_HEIGHT,
    flexDirection: 'column',
    gap: 34,
    justifyContent: 'center',
    flex: 1,
  },
  headingWrapper: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 8,
    height: 50,
  },
});

export default HomescreenPlaceholder;
