import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';

import {Page, Button} from './Button';

type TopbarProps = {
  active: Page | undefined;
};

export function BottomNavigator(props: TopbarProps) {
  return (
    <View style={styles.bar}>
      <Button page={Page.home} active={props.active === Page.home} />
      <Button
        page={Page.connectionCentre}
        active={props.active === Page.connectionCentre}
      />
      <Button page={Page.scanner} active={props.active === Page.scanner} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    padding: 10,
    borderTopColor: '#EEE',
    borderTopWidth: 0.5,
  },
});
