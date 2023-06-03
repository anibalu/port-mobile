import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {NumberlessMediumText} from '../NumberlessText';

import BottomNavHomeActive from '../../../assets/icons/BottomNavHomeActive.svg';
import BottomNavScanActive from '../../../assets/icons/BottomNavScanActive.svg';
import BottomNavNewActive from '../../../assets/icons/BottomNavNewActive.svg';
import BottomNavHomeInactive from '../../../assets/icons/BottomNavHomeInactive.svg';
import BottomNavScanInactive from '../../../assets/icons/BottomNavScanInactive.svg';
import BottomNavNewInactive from '../../../assets/icons/BottomNavNewInactive.svg';

export enum Page {
  home = 'home',
  connectionCentre = 'connectionCentre',
  scanner = 'scanner',
}

type BottomNavProps = {
  active: Boolean;
  page: Page;
};

export function Button(props: BottomNavProps) {
  if (props.page === Page.home) {
    return (
      <Pressable style={styles.button}>
        {props.active ? (
          <BottomNavHomeActive style={styles.homeIcon} />
        ) : (
          <BottomNavHomeInactive style={styles.homeIcon} />
        )}
        <NumberlessMediumText
          style={
            props.active
              ? StyleSheet.compose(styles.screenName, styles.activeText)
              : styles.screenName
          }>
          Home
        </NumberlessMediumText>
      </Pressable>
    );
  }
  if (props.page === Page.connectionCentre) {
    return (
      <Pressable style={styles.button}>
        {props.active ? (
          <BottomNavNewActive style={styles.newIcon} />
        ) : (
          <BottomNavNewInactive style={styles.newIcon} />
        )}
        <NumberlessMediumText
          style={
            props.active
              ? StyleSheet.compose(styles.screenName, styles.activeText)
              : styles.screenName
          }>
          New
        </NumberlessMediumText>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.button}>
      {props.active ? (
        <BottomNavScanActive style={styles.scanIcon} />
      ) : (
        <BottomNavScanInactive style={styles.scanIcon} />
      )}
      <NumberlessMediumText
        style={
          props.active
            ? StyleSheet.compose(styles.screenName, styles.activeText)
            : styles.screenName
        }>
        Scan
      </NumberlessMediumText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    width: 50,
    flexDirection: 'column',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  screenName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B7B6B6',
  },
  activeText: {
    color: '#547CEF',
  },
  newIcon: {
    marginBottom: 5,
  },
  homeIcon: {
    marginBottom: 13.5,
  },
  scanIcon: {
    marginBottom: 13.5,
  },
});
