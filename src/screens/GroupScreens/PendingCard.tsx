import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {NumberlessMediumText} from '../../components/NumberlessText';
import Link from '../../../assets/icons/link.svg';
import {Button} from '../ConnectionCentre/Button';

function PendingCard() {
  //     props: {
  //   onClick: Function,
  //   name:string,
  //   connectionType:number,
  // }
  return (
    <Pressable style={styles.wrapper} onPress={() => {}}>
      <View style={styles.iconBox}>
        <Link />
      </View>

      <View style={styles.textBox}>
        <NumberlessMediumText style={styles.titleText}>
          New Group
        </NumberlessMediumText>
        <Button onPress={() => {}} style={{width: '80%', marginTop: 11}}>
          Created
        </Button>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    borderRadius: 16,
    width: 145,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: 6,
  },
  textBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 5,
    alignItems: 'center',
  },
  titleText: {
    color: '#000000',
    fontSize: 12,
  },
  iconBox: {
    height: 81,
    width: '90%',
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 6,
  },
});

export default PendingCard;
