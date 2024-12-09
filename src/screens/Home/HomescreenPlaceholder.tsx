/**
 * Default chat tile displayed when there are no connections
 */
import {PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode, useMemo, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DynamicColors from '@components/DynamicColors';
import {
  BOTTOMBAR_HEIGHT,
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  TOPBAR_HEIGHT,
  safeModalCloseDuration,
} from '@configs/constants';
import PortBrand from '@assets/icons/PortBrandPurple.svg';
import {useSelector} from 'react-redux';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';

import PortInfoBottomsheet from './PortInfoBottomsheet';
import {wait} from '@utils/Time';

function HomescreenPlaceholder(): ReactNode {
  const navigation = useNavigation();
  //profile information
  const profile = useSelector(state => state.profile.profile);
  const {name} = useMemo(() => {
    const savedName = profile?.name || DEFAULT_NAME;
    return {
      name: savedName === DEFAULT_NAME ? 'there' : savedName,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const Colors = DynamicColors();
  const [showPortInfo, setShowPortInfo] = useState<boolean>(false);

  const styles = styling(Colors);

  const onCreateNewPort = async () => {
    setShowPortInfo(false);
    await wait(safeModalCloseDuration);
    navigation.push('NewPortScreen', {});
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <NumberlessText
          textColor={Colors.primary.mainelements}
          fontSizeType={FontSizeType.esPlus}
          fontType={FontType.sb}>
          {`Welcome ${name}!\nLet's get you connected.`}
        </NumberlessText>
      </View>
      <View style={styles.gridContainer}>
        <View style={styles.primaryCardWithActions}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={styles.cardLeft}>
              <PortBrand height={32} width={32} />
            </View>
            <View style={styles.cardRight}>
              <NumberlessText
                textColor={Colors.primary.mainelements}
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}>
                Start a new connection
              </NumberlessText>
              <NumberlessText
                numberOfLines={2}
                ellipsizeMode="tail"
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Create a new Port and use it to connect without sharing contact
                info.
              </NumberlessText>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              width: '100%',
            }}>
            <PrimaryButton
              buttonText="Create a new Port"
              disabled={false}
              isLoading={false}
              onClick={() => navigation.push('NewPortScreen', {})}
              primaryButtonColor="p"
            />
            <TouchableOpacity
              onPress={() => setShowPortInfo(true)}
              activeOpacity={0.7}
              style={styles.secondaryCardWithChevron}>
              <NumberlessText
                textColor={Colors.primary.blue}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                What is Port?
              </NumberlessText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <PortInfoBottomsheet
        buttonText="Create a new Port"
        onClick={onCreateNewPort}
        visible={showPortInfo}
        onClose={() => setShowPortInfo(false)}
      />
    </View>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      height: screen.height - (BOTTOMBAR_HEIGHT + TOPBAR_HEIGHT),
      flexDirection: 'column',
      justifyContent: 'flex-start',
      width: screen.width,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    cardLeft: {
      backgroundColor: colors.lowAccentColors.violet,
      padding: PortSpacing.medium.uniform,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: PortSpacing.tertiary.uniform,
    },
    gridContainer: {
      flex: 1,
      paddingTop: 80,
    },
    cardRight: {
      gap: 2,
      marginHorizontal: PortSpacing.secondary.uniform,
      flex: 1,
    },
    primaryCardWithActions: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: PortSpacing.secondary.uniform,
      padding: PortSpacing.secondary.uniform,
      paddingBottom: 0,
      borderRadius: PortSpacing.medium.uniform,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
    },
    secondaryCardWithChevron: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: PortSpacing.secondary.uniform,
    },
    headingWrapper: {
      paddingTop: 80,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
  });

export default HomescreenPlaceholder;
