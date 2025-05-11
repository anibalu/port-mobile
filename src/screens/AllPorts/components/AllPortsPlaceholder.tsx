
import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSelector } from 'react-redux';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';

import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
} from '@configs/constants';



function AllPortsPlaceholder({ onPlusPress }: { onPlusPress: () => void }): ReactNode {
  //profile information
  const profile = useSelector(state => state.profile.profile);
  const { name } = useMemo(() => {
    const savedName = profile?.name || DEFAULT_NAME;
    return {
      name: savedName === DEFAULT_NAME ? 'there' : savedName,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const Colors = useColors();
  const styles = styling(Colors)

  return (
    <GradientCard style={
      styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <NumberlessText
          textColor={Colors.text.title}
          fontSizeType={FontSizeType.xl}
          fontWeight={FontWeight.sb}
        >
          {`👋🏼 Welcome ${name}!`}
        </NumberlessText>
        <NumberlessText
          style={{ marginTop: Spacing.s }}
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.l}
          fontWeight={FontWeight.rg}
        >
          You haven’t created any Ports yet!        </NumberlessText>
        <NumberlessText
          style={{ marginTop: Spacing.s, marginBottom: Spacing.xl }}
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.s}
          fontWeight={FontWeight.rg}
        >
          Create a Port and invite your favourite people!
        </NumberlessText>
      </View>
      <PrimaryButton
        disabled={false} isLoading={false} onClick={onPlusPress} text='Create a new Port' theme={Colors.theme} />
    </GradientCard>
  );
}

const styling = (_Colors: any) => StyleSheet.create({
  mainContainer: {
    flexDirection: 'column',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.l,
  },
  headingWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});

export default AllPortsPlaceholder;
