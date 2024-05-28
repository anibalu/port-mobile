import React from 'react';
import SimpleCard from './Reusable/Cards/SimpleCard';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {PortColors, PortSpacing} from './ComponentUtils';
import {Pressable, StyleSheet, View} from 'react-native';
import Blocked from '@assets/icons/Blocked.svg';
import BlackAngleRight from '@assets/icons/BlackAngleRight.svg';
import {useNavigation} from '@react-navigation/native';

const BlockedCard = ({listLength}: {listLength: number}) => {
  const navigation = useNavigation();
  const onForwardPress = () => {
    navigation.navigate('BlockedContacts');
  };

  return (
    <SimpleCard style={styles.card}>
      <View style={styles.title}>
        <View style={{flexDirection: 'row'}}>
          <Blocked />
          <NumberlessText
            style={{marginLeft: PortSpacing.tertiary.left}}
            textColor={PortColors.primary.black}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Blocked
          </NumberlessText>
        </View>
        <Pressable
          onPress={() => onForwardPress()}
          style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
          <View style={styles.pill}>
            <NumberlessText
              textColor={PortColors.subtitle}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              {`${listLength} ${listLength === 1 ? 'contact' : 'contacts'}`}
            </NumberlessText>
          </View>
          <BlackAngleRight />
        </Pressable>
      </View>
      <NumberlessText
        style={{marginLeft: PortSpacing.tertiary.left}}
        textColor={PortColors.subtitle}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        Manage your blocked contacts list
      </NumberlessText>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingTop: PortSpacing.secondary.uniform,
    marginTop: PortSpacing.primary.top,
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PortSpacing.medium.bottom,
  },
  pill: {
    backgroundColor: PortColors.primary.grey.light,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-end',
  },
});

export default BlockedCard;
