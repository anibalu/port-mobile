import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native';

import GradientCard from '../../../components/Cards/GradientCard'
import { useColors } from '../../../components/colorGuide';
import { FontSizeType, FontWeight, NumberlessText } from '../../../components/NumberlessText';
import { Spacing } from '../../../components/spacingGuide';
import useSVG from '../../../components/svgGuide';

const GroupPortInviteCard = ({ onQRGeneration, labelText }: { onQRGeneration: () => void, labelText: string }) => {
  const Colors = useColors();

  const styles = styling(Colors);
  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ]
  const results = useSVG(svgArray);

  const RightChevron = results.RightChevron;
  return (
    <GradientCard style={styles.folderCard}>
      <Pressable
        style={styles.clickableCard}
        onPress={onQRGeneration}>
        <View style={styles.cardTitle}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.l}
            fontWeight={FontWeight.sb}
          >
            Invite using Group Port
          </NumberlessText>
        </View>
        <View style={styles.labelContainer}>
          {labelText && <View style={styles.labelWrapper}>
            <NumberlessText
              textColor={
                Colors.boldAccentColors.blue

              }
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}
              numberOfLines={1}
              ellipsizeMode="tail">
              {labelText}
            </NumberlessText>
          </View>}
          <RightChevron width={20} height={20} />
        </View>
      </Pressable>
    </GradientCard>
  )
}


const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      padding: Spacing.l,
      paddingTop: 0,
      paddingBottom: 0,
      flex: 1,
    },
    labelContainer: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
    },
    cardTitle: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginRight: 24,
    },
    disconnectedwrapper: {
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      flex: 1,
    },
    labelWrapper: {
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 4,
      backgroundColor: colors.lowAccentColors.blue,
    },
    folderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.l,

    },
    nameEditHitbox: {
      marginTop: Spacing.l,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sharedMediaContainer: {
      marginBottom: Spacing.l,
      marginTop: Spacing.l,
    },
    alertwrapper: { flex: 1, justifyContent: 'center' },
    chatSettingsContainer: {
      marginBottom: Spacing.l,
    },
    clickableCard: {
      flexDirection: 'row',
      gap: 5,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerDesc: {
      color: colors.text.title,
      lineHeight: 16,
      marginTop: Spacing.s,
      marginBottom: Spacing.xl
    },
    advanceSettingsContainer: {
      marginBottom: Spacing.l,
    },
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.s
    },
    profilePictureHitbox: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
    cameraIconWrapper: {
      width: 32,
      bottom: -4,
      right: -4,
      height: 32,
      backgroundColor: colors.accent,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 9,
    },
  });
export default GroupPortInviteCard
