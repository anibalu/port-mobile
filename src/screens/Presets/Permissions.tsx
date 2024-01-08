import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PermissionPreset} from '@utils/ChatPermissionPresets/interfaces';
import {masterPermissionsName} from '@utils/ChatPermissions/interfaces';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';

const Permissions = ({
  masterKeys,
  setIsDisappearClicked,
  preset,
  setModifiedPreset,
  timelabel,
}) => {
  return masterKeys?.map(key => {
    return (
      <View style={styles.permissiontile} key={key}>
        <Pressable
          onPress={
            key === 'disappearingMessages'
              ? () => setIsDisappearClicked(p => !p)
              : null
          }>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            style={styles.textStyle}>
            {masterPermissionsName[key]}
          </NumberlessText>
          {key === 'disappearingMessages' && (
            <NumberlessText
              onPress={() => setIsDisappearClicked(p => !p)}
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}
              style={{color: PortColors.primary.grey.dark}}>
              {timelabel}
            </NumberlessText>
          )}
        </Pressable>
        {key === 'disappearingMessages' ? (
          <>
            <NumberlessText
              onPress={() => setIsDisappearClicked(p => !p)}
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}
              style={{color: PortColors.primary.grey.dark}}>
              Customise
            </NumberlessText>
          </>
        ) : (
          <ToggleSwitch
            isOn={preset[key]}
            onColor={PortColors.text.title}
            offColor={'#B7B6B6'}
            onToggle={() => {
              setModifiedPreset((p: PermissionPreset | null) => {
                if (!p) {
                  return null;
                }
                return {
                  ...p,
                  [key]: !p[key],
                };
              });
            }}
          />
        )}
      </View>
    );
  });
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: PortColors.primary.white,
  },
  permissiontile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 30,
  },
  textStyle: {
    color: PortColors.primary.black,
  },
});

export default Permissions;
