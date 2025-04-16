import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';

import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';

import {GroupSuperportBundle} from '@utils/Ports/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {useTheme} from 'src/context/ThemeContext';

import {PortSpacing} from './ComponentUtils';
import DynamicColors from './DynamicColors';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import SimpleCard from './Reusable/Cards/SimpleCard';
import QrWithLogo from './Reusable/QR/QrWithLogo';

const GroupSuperPortCard = ({
  isGroupSuperPortPaused,
  qrData,
  chatData,
  isCopyLinkLoading,
  onCopyLink,
  isLinkLoading,
  fetchLinkData,
  connectionsMade,
  connectionsLimit,
  hasFailed,
  isLoading
}: {
  isGroupSuperPortPaused: boolean;
  qrData: GroupSuperportBundle;
  chatData: any;
  isCopyLinkLoading: boolean;
  onCopyLink: () => void;
  fetchLinkData: () => void;
  isLinkLoading: boolean;
  connectionsMade: number;
  connectionsLimit: number;
  hasFailed: boolean;
  isLoading: boolean
}) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'LinkIcon',
      light: require('@assets/light/icons/LinkGrey.svg').default,
      dark: require('@assets/dark/icons/LinkGrey.svg').default,
    },
    {
      assetName: 'ShareIcon',
      light: require('@assets/light/icons/ShareGrey.svg').default,
      dark: require('@assets/dark/icons/ShareGrey.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const ShareIcon = results.ShareIcon;
  const LinkIcon = results.LinkIcon;
  return (
    <SimpleCard
      style={StyleSheet.compose(
        {
          opacity: isGroupSuperPortPaused ? 0.6 : 1,
        },
        styles.cardWrapper,
      )}>
      <View style={styles.contentBox}>
        <View
          style={StyleSheet.compose(styles.pill, {
            backgroundColor:
              themeValue === 'dark'
                ? Colors.primary.accent
                : Colors.lowAccentColors.violet,
          })}>
          <NumberlessText
            textColor={
              themeValue === 'dark'
                ? Colors.primary.white
                : Colors.primary.accent
            }
            style={{
              textAlign: 'center',
            }}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.s}>
            {'Multi-use QR'}
          </NumberlessText>
        </View>
      </View>
      <QrWithLogo
        qrData={qrData}
        profileUri={DEFAULT_PROFILE_AVATAR_INFO.fileUri}
        isLoading={isLoading}
        hasFailed={hasFailed}
      />
      <View
        style={{
          alignSelf: 'center',
          marginBottom: PortSpacing.secondary.top,
        }}>
        <NumberlessText
          fontType={FontType.md}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.xl}>
          {chatData?.name}
        </NumberlessText>
        {chatData?.description && (
          <NumberlessText
            fontType={FontType.rg}
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.m}>
            {chatData?.description}
          </NumberlessText>
        )}
      </View>
      <View style={styles.shareBox}>
        <Pressable
          disabled={isCopyLinkLoading}
          onPress={onCopyLink}
          style={styles.rowBox}>
          {isCopyLinkLoading ? (
            <ActivityIndicator
              color={
                themeValue === 'light'
                  ? Colors.primary.darkgrey
                  : Colors.text.primary
              }
            />
          ) : (
            <LinkIcon height={20} width={20} />
          )}
          <NumberlessText
            style={{
              textAlign: 'center',
              color:
                themeValue === 'light'
                  ? Colors.primary.darkgrey
                  : Colors.text.primary,
            }}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Copy Link
          </NumberlessText>
        </Pressable>
        <Pressable
          disabled={isLinkLoading}
          onPress={fetchLinkData}
          style={styles.rowBox}>
          {isLinkLoading ? (
            <ActivityIndicator
              color={
                themeValue === 'light'
                  ? Colors.primary.darkgrey
                  : Colors.text.primary
              }
            />
          ) : (
            <ShareIcon height={20} width={20} />
          )}
          <NumberlessText
            style={{
              textAlign: 'center',
              color:
                themeValue === 'light'
                  ? Colors.primary.darkgrey
                  : Colors.text.primary,
            }}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Share Link
          </NumberlessText>
        </Pressable>
      </View>
      <View style={styles.groupCard}>
        <View style={styles.groupRow}>
          {connectionsLimit === connectionsMade ? (
            <NumberlessText
              textColor={Colors.primary.brightRed}
              fontType={FontType.md}
              fontSizeType={FontSizeType.l}>
              Group full!
            </NumberlessText>
          ) : (
            <NumberlessText
              textColor={
                connectionsLimit - connectionsMade > 10
                  ? Colors.primary.darkGreen
                  : Colors.primary.deepSafron
              }
              fontType={FontType.md}
              fontSizeType={FontSizeType.l}>
              Group invite limit
            </NumberlessText>
          )}

          {connectionsLimit !== connectionsMade && (
            <NumberlessText
              style={StyleSheet.compose(styles.groupPill, {
                backgroundColor:
                  connectionsLimit - connectionsMade > 10
                    ? Colors.lowAccentColors.darkGreen
                    : Colors.lowAccentColors.deepSafron,
              })}
              textColor={
                connectionsLimit - connectionsMade > 10
                  ? Colors.primary.darkGreen
                  : Colors.primary.deepSafron
              }
              fontType={FontType.md}
              fontSizeType={FontSizeType.l}>
              {connectionsLimit - connectionsMade} left
            </NumberlessText>
          )}
        </View>

        {connectionsLimit === connectionsMade ? (
          <NumberlessText
            textColor={Colors.text.primary}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            This group has reached the maximum number of participants (64). In
            case you’d like to add more people, kindly remove some participants
            or create a new group. Any new members won’t be able to join the
            group.
          </NumberlessText>
        ) : (
          <NumberlessText
            textColor={Colors.text.primary}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            Share it as a multi-use link. Only those with the link can join.
            Once{' '}
            <NumberlessText
              textColor={Colors.text.primary}
              fontType={FontType.sb}
              fontSizeType={FontSizeType.s}>
              64
            </NumberlessText>{' '}
            members have joined, no more people can use the link to join
          </NumberlessText>
        )}
      </View>
    </SimpleCard>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: 0,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      marginHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.secondary.uniform,
    },
    contentBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: PortSpacing.secondary.uniform,
    },
    row: {
      flexDirection: 'row',
      gap: PortSpacing.medium.uniform,
    },
    rowBox: {
      flexDirection: 'row',
      flex: 1,
      height: 50,
      gap: PortSpacing.tertiary.left,
      borderRadius: PortSpacing.medium.uniform,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.surface2,
    },
    shareBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingBottom: PortSpacing.secondary.bottom,
      gap: PortSpacing.tertiary.uniform,
      flexDirection: 'row',
    },
    card: {
      width: '100%',
      borderRadius: 12,
      gap: PortSpacing.medium.uniform,
      backgroundColor: 'red',
    },
    pill: {
      paddingVertical: 4,
      paddingHorizontal: 6,
      borderRadius: PortSpacing.intermediate.uniform,
      marginBottom: PortSpacing.medium.uniform,
    },
    sharebutton: {
      flexDirection: 'row',
      flex: 1,
      height: 50,
      gap: PortSpacing.tertiary.left,
      borderRadius: PortSpacing.medium.uniform,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.surface2,
    },
    groupCard: {
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      borderRadius: 16,
      padding: PortSpacing.secondary.uniform,
      width: '90%',
      marginBottom: PortSpacing.secondary.uniform,
    },
    groupRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    groupPill: {
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
  });

export default GroupSuperPortCard;
