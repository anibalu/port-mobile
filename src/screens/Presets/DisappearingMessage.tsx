import Cross from '@assets/icons/cross.svg';
import Timer from '@assets/icons/timer.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {RadioButton} from '@screens/BugReporting/AccordionWithRadio';
import {PermissionPreset} from '@utils/ChatPermissionPresets/interfaces';
import {disappearDuration, disappearOptions} from '@utils/Time/interfaces';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

const DisappearingMessage = ({
  setIsDisappearClicked,
  selected,

  setModifiedPreset,
}) => {
  return (
    <View style={styles.modal}>
      <Cross
        style={styles.icon}
        onPress={() => setIsDisappearClicked(p => !p)}
      />
      <NumberlessText
        style={{
          color: PortColors.text.title,
          marginBottom: 30,
        }}
        fontSizeType={FontSizeType.xl}
        fontType={FontType.sb}>
        Disappearing messages
      </NumberlessText>
      <NumberlessText
        style={styles.title1}
        fontSizeType={FontSizeType.l}
        fontType={FontType.rg}>
        Make messages disappear from the chat!
      </NumberlessText>
      <NumberlessText
        style={styles.title2}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        For more privacy and storage, the messages you send will disappear from
        this chat for everyone after the selected duration, except when turned
        off.
      </NumberlessText>
      <View style={styles.row}>
        <Timer />
        <NumberlessText
          style={styles.text}
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}>
          Messages timer
        </NumberlessText>
      </View>
      {disappearOptions.map((option, index) => {
        return (
          <Pressable
            key={index}
            onPress={() => {
              setModifiedPreset((p: PermissionPreset | null) => {
                if (!p) {
                  return null;
                }
                return {
                  ...p,
                  disappearingMessages:
                    disappearDuration[disappearOptions[index]],
                };
              });
            }}
            style={styles.tab}>
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              {option}
            </NumberlessText>
            <RadioButton selected={selected === option} />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: PortColors.primary.white,
    width: screen.width,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopStartRadius: 32,
    borderTopEndRadius: 32,
  },
  icon: {
    alignSelf: 'flex-end',
    marginRight: 10,
    marginBottom: 10,
  },
  tab: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
  },
  title1: {
    color: PortColors.text.title,
    marginBottom: 20,
  },
  title2: {
    color: PortColors.primary.grey.dark,
    marginBottom: 30,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    alignSelf: 'flex-start',
    marginBottom: 40,
    paddingHorizontal: 20,
    marginTop: 10,
  },
});
export default DisappearingMessage;
