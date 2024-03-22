/**
 * Default chat tile displayed when there are no connections
 */
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import ScanIcon from '@assets/icons/scanBlue.svg';
import NewContactIcon from '@assets/icons/newContact.svg';
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

function HomescreenPlaceholder({
  name,
  profilePicAttr,
}: {
  name: string;
  profilePicAttr: FileAttributes;
}): ReactNode {
  const navigation = useNavigation();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <NumberlessText fontSizeType={FontSizeType.xl} fontType={FontType.sb}>
          Start connecting differently
        </NumberlessText>
        <NumberlessText
          style={{color: PortColors.text.secondary, textAlign: 'center'}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          On Port, you connect by sharing unique 'ports' instead of phone
          numbers or usernames, giving you full control over who can reach you.
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
          buttonText="New Port"
          iconSize="s"
        />
        <View style={{marginTop: PortSpacing.secondary.top}}>
          <NumberlessText
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
