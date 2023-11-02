import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {NumberlessMediumText} from '../../components/NumberlessText';
import Reply from '../../../assets/icons/reply.svg';
import Forward from '../../../assets/icons/forward.svg';
import Copy from '../../../assets/icons/copy.svg';
import Info from '../../../assets/icons/info.svg';
import Delete from '../../../assets/icons/delete.svg';

export function MessageActionsBar({
  chatId,
  selectedMessages,
}: {
  chatId: string;
  selectedMessages: string[];
}) {
  return (
    <View style={styles.parentContainer}>
      {selectedMessages.length > 1 ? (
        <View style={styles.multiSelectedContainer}>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('chatId:', chatId);
                console.log('forward pressed');
              }}>
              <Forward />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Forward
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('copy pressed');
              }}>
              <Copy />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Copy
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('delete pressed');
              }}>
              <Delete />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Delete
            </NumberlessMediumText>
          </View>
        </View>
      ) : (
        <View style={styles.singleSelectedContainer}>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('reply pressed');
              }}>
              <Reply />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Reply
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('forward pressed');
              }}>
              <Forward />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Forward
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('copy pressed');
              }}>
              <Copy />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Copy
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('info pressed');
              }}>
              <Info />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Info
            </NumberlessMediumText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                console.log('delete pressed');
              }}>
              <Delete />
            </Pressable>
            <NumberlessMediumText style={styles.optionText}>
              Delete
            </NumberlessMediumText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  singleSelectedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  multiSelectedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  optionContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  optionBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 12,
  },
});
