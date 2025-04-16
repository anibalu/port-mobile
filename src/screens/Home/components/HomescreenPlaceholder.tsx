/**
 * Default chat tile displayed when there are no connections
 */
import React, {ReactNode, useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

import {useSelector} from 'react-redux';

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



function HomescreenPlaceholder({onPlusPress}:{onPlusPress:()=>void}): ReactNode {
  //profile information
  const profile = useSelector(state => state.profile.profile);
  const {name} = useMemo(() => {
    const savedName = profile?.name || DEFAULT_NAME;
    return {
      name: savedName === DEFAULT_NAME ? 'there' : savedName,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const Colors = useColors();

  return (
    <GradientCard style={styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <NumberlessText
          textColor={Colors.text.title}
          fontSizeType={FontSizeType.xl}
          fontWeight={FontWeight.sb}
         >
          {`👋🏼 Welcome ${name}!`}
        </NumberlessText>
        <NumberlessText
      style={{marginTop: Spacing.s}}
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.l}
          fontWeight={FontWeight.rg}
          >
          Create a Port to invite a new contact
        </NumberlessText>
        <NumberlessText
      style={{marginTop:  Spacing.s}}
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.s}
          fontWeight={FontWeight.rg}
          >
          A Port is a highly customizable QR code or link used to invite new contacts. Unlike apps that use phone numbers or usernames, only people you share Ports with can message you.
        </NumberlessText>
      </View>
      <TouchableOpacity onPress={onPlusPress}>
      <NumberlessText
          style={{marginTop:  Spacing.s}}
          textColor={Colors.purple}
          fontSizeType={FontSizeType.l}
          fontWeight={FontWeight.rg}>
          Click on the + button below to create a Port
        </NumberlessText>
        </TouchableOpacity>
    </GradientCard>
  );
}

const styles =StyleSheet.create({
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

export default HomescreenPlaceholder;
