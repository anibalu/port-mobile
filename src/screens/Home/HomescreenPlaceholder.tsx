/**
 * Default chat tile displayed when there are no connections
 */
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import ScanIcon from '@assets/icons/scanBlue.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {FileAttributes} from '@utils/Storage/interfaces';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import DottedLine from '@assets/miscellaneous/dottedLine.svg';
import NewPortBlue from '@assets/icons/NewPortBlue.svg';
import LockIcon from '@assets/icons/BlueLock.svg';

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
      <NumberlessText fontSizeType={FontSizeType.xl} fontType={FontType.sb}>
        Start connecting differently
      </NumberlessText>
      <NumberlessText
        style={{color: PortColors.text.secondary, textAlign: 'center'}}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        On Port, you connect by sharing 'Ports' instead of phone numbers or
        usernames. It is really simple:
      </NumberlessText>
      <SimpleCard
        style={{paddingTop: 0, borderWidth: 1, borderColor: '#D1DDFF'}}>
        <View
          style={{
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            overflow: 'hidden',
          }}>
          <ImageBackground
            source={require('@assets/backgrounds/IntroCard.png')}
            style={styles.introBackground}
            resizeMode="cover"
          />
        </View>

        <View style={styles.introCard}>
          <View style={styles.leftOptions}>
            <View style={styles.greyBubble}>
              <NewPortBlue width={20} height={20} />
            </View>
            <DottedLine />
            <View style={styles.greyBubble}>
              <ScanIcon width={20} height={20} />
            </View>
            <DottedLine />
            <View style={styles.greyBubble}>
              <LockIcon width={20} height={20} />
            </View>
          </View>
          <View style={styles.rightOptions}>
            <View style={{height: 74, justifyContent: 'center'}}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}
                  textColor={PortColors.primary.blue.app}
                  onPress={() =>
                    navigation.navigate('NewPortScreen', {
                      name: name,
                      avatar: profilePicAttr,
                    })
                  }>
                  Create a new Port
                </NumberlessText>
                {'\n'}A Port is a one-time use QR/link to add a new contact.
              </NumberlessText>
            </View>
            <View style={{height: 74, justifyContent: 'center'}}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                Show this QR to your contact to{' '}
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}
                  textColor={PortColors.primary.blue.app}
                  onPress={() => navigation.navigate('Scan')}>
                  Scan{' '}
                </NumberlessText>
                or send it to them as a link to click.
              </NumberlessText>
            </View>
            <View style={{height: 74, justifyContent: 'center'}}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                An end-to-end encrypted connection gets formed with your
                contact.
              </NumberlessText>
            </View>
          </View>
        </View>
      </SimpleCard>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: PortSpacing.intermediate.uniform,
    gap: PortSpacing.medium.uniform,
  },
  introCard: {
    flexDirection: 'row',
    gap: PortSpacing.secondary.uniform,
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.secondary.uniform,
    width: '100%',
    justifyContent: 'center',
    marginTop: 4,
  },
  greyBubble: {
    height: 32,
    width: 32,
    backgroundColor: PortColors.background,
    overflow: 'hidden',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftOptions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightOptions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  introBackground: {
    height: 120,
  },
});

export default HomescreenPlaceholder;
