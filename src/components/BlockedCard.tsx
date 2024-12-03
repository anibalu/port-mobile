import React from 'react';
import SimpleCard from './Reusable/Cards/SimpleCard';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {PortSpacing} from './ComponentUtils';
import {Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DynamicColors from './DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const BlockedCard = ({listLength}: {listLength: number}) => {
  const navigation = useNavigation();
  const onForwardPress = () => {
    /**
     * On clicking, we want to ensure that navigating back brings you back to the profile
     * screen, so we push onto the stack
     */
    navigation.push('BlockedContacts');
  };

  const Colors = DynamicColors();

  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'Blocked',
      light: require('@assets/light/icons/Blocked.svg').default,
      dark: require('@assets/dark/icons/Blocked.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Blocked = results.Blocked;
  const BlackAngleRight = results.AngleRight;

  return (
    <SimpleCard style={styles.card}>
      <View style={styles.title}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Blocked height={20} width={20} />
          <NumberlessText
            style={{marginLeft: PortSpacing.tertiary.left}}
            textColor={Colors.text.primary}
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
              textColor={Colors.text.subtitle}
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
        textColor={Colors.text.subtitle}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        Manage your blocked contacts list
      </NumberlessText>
    </SimpleCard>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    card: {
      width: '100%',
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.secondary.top,
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: PortSpacing.medium.bottom,
    },
    pill: {
      backgroundColor: colors.primary.lightgrey,
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
