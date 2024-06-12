/**
 * Default chat tile displayed when there are no connections
 */
import {PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import TertiaryButton from '@components/Reusable/LongButtons/TertiaryButton';
import {FileAttributes} from '@utils/Storage/interfaces';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

function HomescreenPlaceholder({
  name,
  profilePicAttr,
}: {
  name: string;
  profilePicAttr: FileAttributes;
}): ReactNode {
  const navigation = useNavigation();

  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'NewContactIcon',
      light: require('@assets/light/icons/newContact.svg').default,
      dark: require('@assets/dark/icons/newContact.svg').default,
    },
    {
      assetName: 'ScanIcon',
      light: require('@assets/icons/scanBlue.svg').default,
      dark: require('@assets/dark/icons/scanBlue.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const NewContactIcon = results.NewContactIcon;

  const ScanIcon = results.ScanIcon;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <NumberlessText
          textColor={Colors.primary.mainelements}
          fontSizeType={FontSizeType.xl}
          fontType={FontType.sb}>
          Start connecting differently
        </NumberlessText>
        <NumberlessText
          textColor={Colors.text.subtitle}
          style={{textAlign: 'center'}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          On Port, you connect by sharing 'Ports' instead of phone numbers or
          usernames.
        </NumberlessText>
      </View>
      <View>
        <PrimaryButton
          isLoading={false}
          disabled={false}
          primaryButtonColor="b"
          onClick={() =>
            navigation.navigate('NewPortScreen', {
              name: name,
              avatar: profilePicAttr,
            })
          }
          Icon={NewContactIcon}
          buttonText="Create a new Port"
          iconSize="s"
        />
        <View style={{marginTop: PortSpacing.secondary.top}}>
          <NumberlessText
            textColor={Colors.text.subtitle}
            style={{textAlign: 'center'}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            Or
          </NumberlessText>
        </View>
        <TertiaryButton
          tertiaryButtonColor="b"
          disabled={false}
          onClick={() => navigation.navigate('Scan')}
          Icon={ScanIcon}
          iconSize="s"
          buttonText=" Scan QR"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: screen.height / 2,
    flexDirection: 'column',
    marginTop: PortSpacing.primary.top,
    justifyContent: 'flex-end',
    flex: 1,
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  headingWrapper: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: PortSpacing.primary.bottom,
  },
});

export default HomescreenPlaceholder;
