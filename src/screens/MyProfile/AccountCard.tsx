import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  NumberlessText,
  FontType,
  FontSizeType,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';

// TODO: why is the legal card called the "help card?"
const AccountCard = () => {
  const navigation = useNavigation();
  const onPress = () => {
    navigation.push('AccountSettings');
  };

  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
    {
      assetName: 'MyAccount',
      light: require('@assets/light/icons/MyAccount.svg').default,
      dark: require('@assets/dark/icons/MyAccount.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const BlackAngleRight = results.AngleRight;
  const MyAccount = results.MyAccount;

  return (
    <SimpleCard style={styles.card}>
      <Pressable style={styles.button} onPress={() => onPress()}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MyAccount height={20} width={20} />
          <NumberlessText
            style={{marginLeft: PortSpacing.tertiary.left}}
            textColor={Colors.text.primary}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            My account
          </NumberlessText>
        </View>
        <View style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
          <BlackAngleRight />
        </View>
      </Pressable>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingHorizontal: PortSpacing.secondary.uniform,
    marginTop: PortSpacing.secondary.top,
    paddingVertical: 0,
  },
  button: {
    paddingVertical: PortSpacing.secondary.uniform,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default AccountCard;
