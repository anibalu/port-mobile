import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {BackButton} from '../../components/BackButton';

function Topbar({onPress}) {
  //update generated bundle on back button navigate.
  return (
    <View style={styles.bar}>
      <BackButton style={styles.backIcon} onPress={onPress} />
      <NumberlessSemiBoldText style={styles.title}>
        New Port
      </NumberlessSemiBoldText>
      <View style={styles.faqBox}>
        {/* <NumberlessClickableText
          style={styles.faqText}
          onPress={() => {
            console.log("FAQ button clicked");
          }}>
          FAQs
        </NumberlessClickableText> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: '6%',
    paddingLeft: '6%',
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 51,
  },
  title: {
    fontSize: 21,
    lineHeight: 28,
    color: 'black',
    marginTop: 10,
  },
  backIcon: {
    paddingTop: 16,
    alignItems: 'flex-start',
    width: 50,
    height: 51,
  },
  faqBox: {
    width: 50,
    alignItems: 'flex-end',
  },
  faqText: {
    marginTop: 10,
    lineHeight: 28,
    fontSize: 15,
  },
});

export default Topbar;
