import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {BackButton} from '../../components/BackButton';
import {useNavigation} from '@react-navigation/native';
/**
 *
 * @todo add a share button
 */
function Topbar({ title }) {
  const navigation = useNavigation();
  return (
    <View style={styles.bar}>
      <BackButton style={styles.backIcon} onPress={() => navigation.goBack()} />
        <NumberlessSemiBoldText
          style={styles.title}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {title}
        </NumberlessSemiBoldText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: '6%',
    paddingLeft: '6%',
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 51,
    zIndex: 2
  },
  title: {
    fontSize: 21,
    lineHeight: 28,
    color: 'black',
    marginTop: 10,
    overflow: 'hidden',
    width: '60%',
    textAlign: 'center',
  },
  backIcon: {
    paddingTop: 16,
    alignItems: 'flex-start',
    width: '100%',
    height: 51,
    position: 'absolute',
  },
});

export default Topbar;
