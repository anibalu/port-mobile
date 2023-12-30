/**
 * QR scanner used in the App.
 */
import Groups from '@assets/icons/GroupsBlue.svg';
import SuperPorts from '@assets/icons/SuperportsBlue.svg';
import Cross from '@assets/icons/cross.svg';
import Link from '@assets/icons/linkGrey.svg';
import Person from '@assets/icons/personBlue.svg';
import SuccessQR from '@assets/icons/successqr.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import GenericModal from '@components/GenericModal';
import GenericModalTopBar from '@components/GenericModalTopBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {processConnectionBundle} from '@utils/Bundles';
import {BundleReadResponse} from '@utils/Bundles/interfaces';
import {ConnectionType} from '@utils/Connections/interfaces';
import React, {ReactNode, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import {useErrorModal} from 'src/context/ErrorModalContext';

export default function ScannerModal() {
  const {
    connectionModalVisible: modalVisible,
    hideConnectionModal: hideConnectionModal,
    setFemaleModal,
    femaleModal,
    connectionQRData,
    setConnectionQRData,
  } = useConnectionModal();

  const {portCreationError, incorrectQRError} = useErrorModal();

  const [loading, setLoading] = useState(false);

  //@ani convert this to a useState again.
  const permissionPresets = [
    'None',
    'Friends',
    'Family',
    'Housing community',
    'Instagram biz',
    'Family group presets',
  ];

  const [selectedPreset, setSelectedPreset] = useState(permissionPresets[0]);

  const navigation = useNavigation<any>();
  const [label, setLabel] = useState(
    connectionQRData?.data.name ? connectionQRData?.data.name : '',
  );

  const cleanScanModal = () => {
    setLabel('');
    setFemaleModal(false);
    setConnectionQRData(undefined);
    hideConnectionModal();
  };
  //shows an alert if there is an issue creating a new Port after scanning a QR code.
  const showAlertAndWait = (bundleReadResponse: BundleReadResponse) => {
    if (bundleReadResponse === BundleReadResponse.networkError) {
      portCreationError();
    } else {
      incorrectQRError();
    }
    cleanScanModal();
  };

  const saveNewConnection = async () => {
    setLoading(true);
    if (connectionQRData) {
      const saveResponse = await processConnectionBundle(
        connectionQRData,
        label,
      );
      if (saveResponse === BundleReadResponse.networkError) {
        showAlertAndWait(BundleReadResponse.networkError);
      }
      if (saveResponse === BundleReadResponse.success) {
        navigation.navigate('HomeTab', {screen: 'ChatTab'});
        cleanScanModal();
      }
    } else {
      showAlertAndWait(BundleReadResponse.formatError);
    }
    setLoading(false);
  };
  const checkSavePossible = () => {
    if (connectionQRData) {
      switch (connectionQRData.connectionType) {
        case ConnectionType.direct:
          if (label.trim().length > 0) {
            return true;
          }
          return false;
        case ConnectionType.group:
          return true;
        case ConnectionType.superport:
          if (label.trim().length > 0) {
            return true;
          }
          return false;
        default:
          return false;
      }
    }
    return false;
  };
  return (
    <GenericModal
      avoidKeyboard={false}
      visible={modalVisible}
      onClose={cleanScanModal}>
      <View style={styles.successIndicatorArea}>
        <GenericModalTopBar
          RightOptionalIcon={Cross}
          onBackPress={() => cleanScanModal()}
        />

        {femaleModal ? (
          <>
            <View
              style={{
                backgroundColor: PortColors.primary.success,
                padding: 17,
                borderRadius: 16,
              }}>
              <Link
                height={45}
                width={45}
                color={PortColors.primary.red.error}
              />
            </View>
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}
              style={styles.scanSuccessTextStyle}
              textColor={PortColors.text.alertGreen}>
              Link successfully opened
            </NumberlessText>
          </>
        ) : (
          <>
            <SuccessQR />
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}
              style={styles.scanSuccessTextStyle}
              textColor={PortColors.text.alertGreen}>
              Scan successful
            </NumberlessText>
          </>
        )}

        <View style={styles.newPortArea}>
          {connectionQRData != undefined && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    padding: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {connectionQRData.connectionType === ConnectionType.direct ? (
                    <Person />
                  ) : connectionQRData.connectionType ===
                    ConnectionType.superport ? (
                    <SuperPorts />
                  ) : (
                    <Groups />
                  )}
                </View>

                <NumberlessText
                  fontSizeType={FontSizeType.l}
                  fontType={FontType.sb}
                  textColor={PortColors.text.title}>
                  {(() => {
                    if (connectionQRData) {
                      switch (connectionQRData.connectionType) {
                        case ConnectionType.direct:
                          return 'Connected port with';
                        case ConnectionType.group:
                          return 'Join GroupPort';
                        case ConnectionType.superport:
                          return 'Connecting over SuperPort with';
                        default:
                          return 'Connection type unknown';
                      }
                    } else {
                      return 'Connection type unknown';
                    }
                  })()}
                </NumberlessText>
              </View>
              {(connectionQRData.connectionType === ConnectionType.direct ||
                connectionQRData.connectionType ===
                  ConnectionType.superport) && (
                <>
                  <GenericInput
                    text={label}
                    inputStyle={{
                      marginVertical: 19,
                      height: 50,
                      borderRadius: 8,
                      paddingHorizontal: 20,
                    }}
                    setText={setLabel}
                    placeholder="Contact Name"
                  />
                </>
              )}

              {connectionQRData.connectionType === ConnectionType.group && (
                <>
                  <NumberlessText
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.md}
                    style={StyleSheet.compose(styles.paddedTextBoxStyle, {
                      textAlign: 'center',
                    })}
                    textColor={PortColors.text.title}>
                    {connectionQRData.data.name || 'group'}
                  </NumberlessText>

                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    style={styles.paddedTextBoxStyle}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    textColor={PortColors.text.secondary}>
                    {connectionQRData.data.description ||
                      'No description available'}
                  </NumberlessText>
                </>
              )}

              <View style={styles.customiseBoxStyle}>
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}
                  textColor={PortColors.text.title}>
                  Customise connections
                </NumberlessText>
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.rg}
                  style={{marginTop: 16}}
                  textColor={PortColors.text.secondary}>
                  Permission preset set to:
                </NumberlessText>
                <View style={styles.tileContainerStyle}>
                  {permissionPresets.map(permission => {
                    return (
                      <Tile
                        title={permission}
                        isActive={permission === selectedPreset}
                        onPress={() => {
                          setSelectedPreset(permission);
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            </>
          )}

          <GenericButton
            buttonStyle={StyleSheet.compose(
              styles.button,
              !checkSavePossible() ? {opacity: 0.7} : {},
            )}
            textStyle={{textAlign: 'center'}}
            loading={loading}
            onPress={saveNewConnection}>
            Save
          </GenericButton>
        </View>
      </View>
    </GenericModal>
  );
}

const Tile = ({
  title,
  isActive,
  onPress,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}): ReactNode => {
  return (
    <NumberlessText
      onPress={onPress}
      key={title}
      style={{
        backgroundColor: isActive
          ? PortColors.primary.blue.app
          : PortColors.primary.white,
        padding: 8,
        overflow: 'hidden',
        borderRadius: 8,
      }}
      fontSizeType={FontSizeType.s}
      fontType={FontType.md}
      textColor={
        isActive ? PortColors.text.primaryWhite : PortColors.text.labels
      }>
      {title}
    </NumberlessText>
  );
};

const styles = StyleSheet.create({
  successIndicatorArea: {
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    backgroundColor: PortColors.primary.grey.light,
    width: screen.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanSuccessTextStyle: {
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  tileContainerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    columnGap: 8,
    rowGap: 8,
  },
  newPortArea: {
    backgroundColor: PortColors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 42,
  },
  customiseBoxStyle: {
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginTop: 22,
    padding: 24,
    borderRadius: 13,
  },
  paddedTextBoxStyle: {
    padding: 20,
    width: '100%',
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PortColors.primary.grey.light,
  },
  button: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    marginTop: 32,
  },
});
