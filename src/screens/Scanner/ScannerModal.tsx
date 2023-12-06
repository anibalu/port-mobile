/**
 * QR scanner used in the App.
 */
import Cross from '@assets/icons/cross.svg';
import Link from '@assets/icons/linkGrey.svg';
import SuccessQR from '@assets/icons/successqr.svg';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import GenericInput from '@components/GenericInput';
import GenericModal from '@components/GenericModal';
import {
  NumberlessBoldText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {processConnectionBundle} from '@utils/Bundles';
import {BundleReadResponse} from '@utils/Bundles/interfaces';
import {ConnectionType} from '@utils/Connections/interfaces';
import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
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
    <GenericModal visible={modalVisible} onClose={cleanScanModal}>
      <View style={styles.successIndicatorArea}>
        <Pressable style={styles.closeButton} onPress={() => cleanScanModal()}>
          <Cross />
        </Pressable>
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
            <NumberlessRegularText style={styles.scanSuccessText}>
              Link successfully opened
            </NumberlessRegularText>
          </>
        ) : (
          <>
            <SuccessQR />
            <NumberlessRegularText style={styles.scanSuccessText}>
              Scan successful
            </NumberlessRegularText>
          </>
        )}

        <View style={styles.newPortArea}>
          <NumberlessBoldText>
            {(() => {
              if (connectionQRData) {
                switch (connectionQRData.connectionType) {
                  case ConnectionType.direct:
                    return 'Connecting over Port with';
                  case ConnectionType.group:
                    return 'Joining group';
                  case ConnectionType.superport:
                    return 'Connecting over SuperPort with';
                  default:
                    return 'Connection type unknown';
                }
              } else {
                return 'Connection type unknown';
              }
            })()}
          </NumberlessBoldText>
          {connectionQRData !== undefined &&
            connectionQRData.connectionType === ConnectionType.group && (
              <View style={styles.savedInput}>
                <NumberlessBoldText style={styles.savedInputText}>
                  {connectionQRData.data.name || 'group'}
                </NumberlessBoldText>
              </View>
            )}
          {connectionQRData !== undefined &&
            connectionQRData.connectionType !== ConnectionType.group && (
              <GenericInput
                text={label}
                wrapperStyle={{marginVertical: 15, paddingHorizontal: '8%'}}
                inputStyle={{...FontSizes[15].medium}}
                setText={setLabel}
                placeholder="Contact Name"
              />
            )}
          {connectionQRData !== undefined &&
            connectionQRData.connectionType === ConnectionType.group && (
              <View style={styles.savedDescription}>
                <NumberlessRegularText
                  style={styles.savedDescriptionText}
                  numberOfLines={5}
                  ellipsizeMode="tail">
                  {connectionQRData.data.description ||
                    'No description available'}
                </NumberlessRegularText>
              </View>
            )}
          <Pressable
            style={!checkSavePossible() ? styles.disabledbutton : styles.button}
            disabled={!checkSavePossible()}
            onPress={saveNewConnection}>
            <NumberlessMediumText style={styles.buttontext}>
              Save
            </NumberlessMediumText>
          </Pressable>
        </View>
      </View>
    </GenericModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  permissionDenied: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '5%',
    paddingRight: '5%',
    paddingBottom: 100,
    width: '100%',
  },
  successIndicatorArea: {
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    backgroundColor: PortColors.primary.grey.light,
    width: screen.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanSuccessText: {
    color: PortColors.primary.success,
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  newPortArea: {
    backgroundColor: PortColors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 30,
    paddingBottom: 30,
  },
  groupName: {
    textAlign: 'center',
    color: '#547CEF',
  },
  text: {
    color: '#FFFFFF',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  cameraOptions: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    marginBottom: 100,
    borderRadius: 14,
  },
  torch: {
    position: 'absolute',
    paddingBottom: 150,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  input: {
    width: '85%',
    height: 60,
    ...FontSizes[17].bold,
    backgroundColor: '#F6F6F6',
    textAlign: 'center',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  roundButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'black',
    borderRadius: 50,
    opacity: 0.5,
  },
  popUpArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  saveButton: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  disabledbutton: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    opacity: 0.7,
    flexDirection: 'row',
  },
  buttontext: {
    color: 'white',
    fontSize: 15,
    width: '80%',
    textAlign: 'center',
  },
  savedInput: {
    width: '85%',
    height: 60,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 15,
  },
  savedInputText: {
    textAlign: 'center',
    color: '#000000',
  },
  savedDescription: {
    width: '85%',
    height: 150,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  savedDescriptionText: {
    textAlign: 'center',
    color: '#000000',
    height: '100%',
    padding: 15,
  },
});
