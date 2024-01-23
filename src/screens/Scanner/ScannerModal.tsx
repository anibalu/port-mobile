/**
 * QR scanner used in the App.
 */
import Groups from '@assets/icons/GroupsBlue.svg';
import SuperPorts from '@assets/icons/SuperportsBlue.svg';
import Link from '@assets/icons/linkGrey.svg';
import Person from '@assets/icons/personBlue.svg';
import SuccessQR from '@assets/icons/successqr.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import Notch from '@components/ConnectionModal/Notch';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import GenericModal from '@components/GenericModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {
  getAllPermissionPresets,
  getDefaultPermissionPreset,
} from '@utils/ChatPermissionPresets';
import {PermissionPreset} from '@utils/ChatPermissionPresets/interfaces';
import {readBundle} from '@utils/Ports';
import {BundleTarget} from '@utils/Ports/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useConnectionModal} from 'src/context/ConnectionModalContext';

export default function ScannerModal() {
  const {
    connectionModalVisible: modalVisible,
    hideConnectionModal: hideConnectionModal,
    setFemaleModal,
    femaleModal,
    connectionQRData,
    setConnectionQRData,
    setConnectionChannel,
    connectionChannel,
  } = useConnectionModal();

  const [loading, setLoading] = useState(false);

  const [availablePresets, setAvailablePresets] = useState<PermissionPreset[]>(
    [],
  );
  const [selectedPreset, setSelectedPreset] = useState<PermissionPreset | null>(
    null,
  );

  const navigation = useNavigation<any>();
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (connectionQRData) {
      setLabel(connectionQRData.name);
      (async () => {
        setSelectedPreset(await getDefaultPermissionPreset());
        setAvailablePresets(await getAllPermissionPresets());
      })();
    }
  }, [connectionQRData]);

  const cleanScanModal = () => {
    setLabel('');
    setFemaleModal(false);
    setConnectionQRData(undefined);
    hideConnectionModal();
    setConnectionChannel(null);
  };

  const saveNewConnection = async () => {
    setLoading(true);
    if (connectionQRData) {
      connectionQRData.name = label;
      await readBundle(
        connectionQRData,
        connectionChannel,
        selectedPreset ? selectedPreset.presetId : null,
      );
      navigation.navigate('HomeTab', {screen: 'ChatTab'});
      cleanScanModal();
    }
    setLoading(false);
  };
  const checkSavePossible = () => {
    if (connectionQRData) {
      switch (connectionQRData.target) {
        case BundleTarget.direct:
          if (label.trim().length > 0) {
            return true;
          }
          return false;
        case BundleTarget.group:
          return true;
        case BundleTarget.superportDirect:
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
        <Notch />

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
                  {connectionQRData.target === BundleTarget.direct ? (
                    <Person />
                  ) : connectionQRData.target ===
                      BundleTarget.superportDirect ||
                    connectionQRData.target === BundleTarget.superportGroup ? (
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
                      switch (connectionQRData.target) {
                        case BundleTarget.direct:
                          return 'Connecting with';
                        case BundleTarget.group:
                          return 'Join Group';
                        case BundleTarget.superportDirect:
                        case BundleTarget.superportGroup:
                          return 'Connecting over Superport with';
                        default:
                          return 'Connection type unknown';
                      }
                    } else {
                      return 'Connection type unknown';
                    }
                  })()}
                </NumberlessText>
              </View>
              {(connectionQRData.target === BundleTarget.direct ||
                connectionQRData.target === BundleTarget.superportDirect ||
                connectionQRData.target === BundleTarget.superportGroup) && (
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
              )}

              {connectionQRData.target === BundleTarget.group && (
                <>
                  <NumberlessText
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.md}
                    style={styles.paddedTextBoxStyle}
                    textColor={PortColors.text.title}>
                    {connectionQRData.name || 'group'}
                  </NumberlessText>

                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    style={styles.paddedDescriptionBoxStyle}
                    numberOfLines={4}
                    ellipsizeMode="tail"
                    textColor={PortColors.text.secondary}>
                    {/* Existence of description is implied by target above */}
                    {connectionQRData.description || 'No description available'}
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
                  {availablePresets.length > 0 &&
                    availablePresets.map(permission => {
                      return (
                        <Tile
                          key={permission.presetId}
                          title={permission.name}
                          isActive={
                            permission.presetId === selectedPreset?.presetId
                          }
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
    paddingTop: 8,
    alignSelf: 'stretch',
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
    width: screen.width,
    padding: 30,
  },
  customiseBoxStyle: {
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginTop: 8,
    padding: 24,
    borderRadius: 13,
  },
  paddedTextBoxStyle: {
    paddingTop: 15,
    width: '100%',
    marginTop: 8,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PortColors.primary.grey.light,
    textAlign: 'center',
  },
  paddedDescriptionBoxStyle: {
    padding: 15,
    width: '100%',
    marginTop: 8,
    maxHeight: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PortColors.primary.grey.light,
    textAlign: 'center',
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
