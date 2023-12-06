/**
 * Default chat tile displayed when there are no connections
 */
import PW from '@assets/icons/personWhite.svg';
import {FontSizes, PortColors} from '@components/ComponentUtils';
import {
  NumberlessMediumText,
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

function PendingChatTile() {
  return (
    <Pressable style={styles.defaultTileContainer} onPress={() => {}}>
      <View style={styles.iconHolder}>
        <PW />
      </View>
      <View style={{flexDirection: 'column', width: '60%', marginLeft: 19}}>
        <NumberlessSemiBoldText>Contact Name</NumberlessSemiBoldText>
        <NumberlessMediumText
          style={{marginTop: 8, color: PortColors.primary.blue.app}}>
          Pending authentication
        </NumberlessMediumText>
        <NumberlessRegularText style={{...FontSizes[12].regular, marginTop: 2}}>
          This port needs to be shared with a contact to
        </NumberlessRegularText>
      </View>
      <Pressable
        style={{
          backgroundColor: PortColors.primary.red.error,
          paddingHorizontal: 9,
          borderRadius: 4,
          right: 11,
          paddingVertical: 3,
        }}>
        <NumberlessMediumText style={{color: PortColors.primary.white}}>
          DELETE
        </NumberlessMediumText>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    height: 114,
    marginTop: 7,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
  },
  iconHolder: {
    backgroundColor: PortColors.primary.blue.app,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  picture: {
    width: 50,
    height: 50,
    borderRadius: 17,
    opacity: 0.3,
  },

  newIcon: {
    width: 50,
    height: 50,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});

export default PendingChatTile;
