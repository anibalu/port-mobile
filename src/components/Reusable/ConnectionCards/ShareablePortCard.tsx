/**
 * Card that displays a port or a superport
 * Takes the following props:
 * 1. isLoading - whether the bundle to display is still generating
 * 2. hasFailed - whether bundle generation has failed
 * 3. isSuperport - whether card is for a superport
 * 4. profileUri - profile picture to display
 * 5. title - title to display (profile name is passed in currently)
 * 6. qrData - qr data to display
 * 9. onTryAgainClicked - what to do when try again is clicked
 */

import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';

import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';

import EditIcon from '@assets/icons/GreyPencilFilled.svg';
import Greentick from '@assets/icons/notes/Tick.svg';
import Logo from '@assets/icons/Portlogo.svg';

import SimpleCard from '../Cards/SimpleCard';
import QrWithLogo from '../QR/QrWithLogo';

const ShareablePortCard = ({
  profilePicAttr = DEFAULT_PROFILE_AVATAR_INFO,
  title,
  qrData,
  toBeEdited,
  setToBeEdited,
}: {
  profilePicAttr?: FileAttributes;
  title: string;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
  toBeEdited: boolean;
  setToBeEdited: (x: boolean) => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const [description, setDescription] = useState(
    'Scan this code with your Port camera to add me as a contact.',
  );
  const [primaryDescription, setPrimaryDescription] = useState("I'm hiring!");

  const onChangeDescription = (description: string) => {
    setDescription(description);
  };

  const onChangePrimaryDescription = (primaryDesc: string) => {
    setPrimaryDescription(primaryDesc);
  };

  return (
    <SimpleCard style={styles.cardWrapper}>
      <View style={styles.purpleWrapper}>
        <Logo
          style={{
            alignSelf: 'center',
            marginTop: PortSpacing.intermediate.top,
            marginBottom: PortSpacing.tertiary.bottom,
          }}
        />
        <View style={styles.whiteWrapper}>
          <QrWithLogo
            profileUri={profilePicAttr.fileUri}
            qrData={qrData}
            isLoading={false}
            hasFailed={false}
          />
          <NumberlessText
            style={{paddingVertical: 4}}
            fontSizeType={FontSizeType.l}
            textColor={'#5B7DA7'}
            fontType={FontType.md}>
            {title}
          </NumberlessText>
        </View>
      </View>
      <View style={styles.contentBox}>
        <View style={styles.row}>
          <TextInput
            style={StyleSheet.compose(
              [
                toBeEdited
                  ? {textDecorationLine: 'underline'}
                  : {
                      textDecorationLine: 'none',
                    },
              ],
              styles.primaryDesc,
            )}
            maxLength={30}
            onChangeText={onChangePrimaryDescription}
            value={primaryDescription}
            editable={toBeEdited}
          />
          {toBeEdited ? (
            <Greentick
              width={32}
              height={32}
              onPress={() => setToBeEdited(p => !p)}
            />
          ) : (
            <EditIcon onPress={() => setToBeEdited(p => !p)} />
          )}
        </View>

        <TextInput
          multiline
          style={StyleSheet.compose(
            [
              toBeEdited
                ? {textDecorationLine: 'underline'}
                : {
                    textDecorationLine: 'none',
                  },
            ],
            styles.description,
          )}
          maxLength={150}
          onChangeText={onChangeDescription}
          value={description}
          editable={toBeEdited}
        />
      </View>
    </SimpleCard>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: 0, //overrides simple card default padding
      width: '100%',
      backgroundColor: 'white',
    },
    avatarArea: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      height: 60,
      width: 60,
      borderRadius: 12,
      backgroundColor: PortColors.primary.white,
      marginTop: -30,
    },
    contentBox: {
      width: '100%',
      marginTop: PortSpacing.primary.top,
    },
    name: {
      color: 'black',
      fontFamily: FontType.md,
      fontSize: FontSizeType.xl,
    },
    description: {
      color: Colors.primary.genericblack,
      fontFamily: FontType.rg,
      fontSize: FontSizeType.m,
      marginBottom: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    primaryDesc: {
      color: Colors.primary.genericblack,
      fontFamily: FontType.md,
      fontSize: 28,
      marginTop: isIOS ? 0 : -PortSpacing.secondary.top,
      flex: 1,
    },
    edit: {
      position: 'absolute',
      right: -3,
      bottom: -3,
    },
    purpleWrapper: {
      backgroundColor: Colors.primary.lavenderOverlay,
      width: '100%',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      alignItems: 'center',
      paddingBottom: PortSpacing.primary.bottom,
    },
    whiteWrapper: {
      backgroundColor: Colors.primary.white,
      padding: PortSpacing.tertiary.uniform,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: PortSpacing.secondary.top,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: PortSpacing.secondary.right,
      borderBottomColor: Colors.primary.genericblack,
      borderBottomWidth: 0.5,
      flex: 1,
    },
  });

export default ShareablePortCard;
