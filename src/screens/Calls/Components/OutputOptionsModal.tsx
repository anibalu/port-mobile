import React, {FC} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {AudioRoute} from 'react-native-callkeep';
import {SvgProps} from 'react-native-svg';

import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import GenericModal from '@components/Modals/GenericModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import Bluetooth from '@assets/dark/icons/Bluetooth.svg';
import Headset from '@assets/dark/icons/Headset.svg';
import Speaker from '@assets/dark/icons/Speaker.svg';



const OutputOptionsModal = ({
  visible,
  onClose = () => {},
  channels,
  onSelectChannel,
}: {
  visible: boolean;
  onClose?: () => void;
  channels: AudioRoute[];
  onSelectChannel: (audioChannel: string) => void | Promise<void>;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <GenericModal
      visible={visible}
      onClose={onClose}
      backdropColor={Colors.primary.darkOverlay}>
      <View style={styles.container}>
        {channels.map((channel, index) => (
          <View
            key={channel.name}
            style={{
              borderBottomWidth: index === channels.length - 1 ? 0 : 0.5,
              borderBottomColor: 'rgba(255, 255, 255, 0.5)',
            }}>
            <Option
              Icon={
                channel.type === 'Speaker'
                  ? Speaker
                  : channel.type === 'Phone'
                  ? Headset
                  : Bluetooth
              }
              onPress={() => onSelectChannel(channel.name)}
              text={channel.name}
              selected={channel.selected ?? false}
            />
          </View>
        ))}
        {channels.length === 0 && (
          <NumberlessText
            textColor={Colors.primary.white}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.l}>
            No audio output options available
          </NumberlessText>
        )}
      </View>
    </GenericModal>
  );
};

const Option = ({
  Icon,
  text,
  selected,
  onPress,
}: {
  Icon: FC<SvgProps>;
  text: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <Pressable onPress={onPress} style={styles.optionContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <Icon />
        <NumberlessText
          numberOfLines={1}
          textColor={Colors.primary.white}
          ellipsizeMode="tail"
          fontType={FontType.rg}
          fontSizeType={FontSizeType.l}>
          {text}
        </NumberlessText>
      </View>
      <View style={styles.selectContainer}>
        {selected && (
          <View
            style={{
              backgroundColor: Colors.primary.white,
              width: 10,
              height: 10,
              borderRadius: 100,
            }}
          />
        )}
      </View>
    </Pressable>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: Colors.primary.genericDark,
      width: screen.width,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
    },
    optionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
    },
    selectContainer: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 100,
      borderWidth: 1,
      borderColor: Colors.primary.white,
    },
  });
export default OutputOptionsModal;
