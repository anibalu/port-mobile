import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Image} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';

type TopbarProps = {
  filter: String | undefined;
  unread: Number | undefined;
};

function Topbar(props: TopbarProps) {
  const title = props.unread
    ? `${props.filter || 'All'} (${props.unread})`
    : `${props.filter || 'All'}`;
  return (
    <View style={styles.bar}>
      <View style={styles.sidebarIcon} />
      <NumberlessSemiBoldText style={styles.title}>
        {title}
      </NumberlessSemiBoldText>
      <Image
        style={styles.image}
        source={require('../../../assets/avatars/avatar1.png')}
      />
    </View>
  ); // TODO: Add sidebar icon when decided
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 16,
    paddingLeft: 16,
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
  },
  image: {
    width: 42,
    height: 42,
    borderRadius: 14,
    marginBottom: 9,
  },
  title: {
    fontSize: 21,
    lineHeight: 28,
    color: 'black',
    marginTop: 10,
  },
  sidebarIcon: {
    width: 42,
    height: 42,
  },
});

export default Topbar;
