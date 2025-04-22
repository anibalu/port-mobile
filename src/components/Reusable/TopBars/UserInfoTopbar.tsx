/**
 * User Info Topbar which shows name and avatar.
 * Takes the following props:
 * 1. Icon right
 * 2. Avatar Uri
 * 3. Heading
 * 4. onIconRightPress
 * 5. background color, grey or white
 * 6. boolean to show user unfo (used in contact profile)
 */

import React, { FC } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { SvgProps } from 'react-native-svg';


import { BackButton } from '@components/BackButton';
import { PortSpacing } from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';

import { TOPBAR_HEIGHT } from '@configs/constants';

import { AvatarBox } from '../AvatarBox/AvatarBox';

const UserInfoTopbar = ({
  IconRight,
  isConnected = true,
  avatarUri,
  backgroundColor,
  heading,
  onIconRightPress = async () => { },
  showUserInfo = false,
  iconRightLoading = false,
}: {
  isConnected?: boolean | null | '';
  backgroundColor: 'g' | 'w';
  avatarUri: string;
  IconRight: FC<SvgProps>;
  heading?: string;
  showUserInfo?: boolean;
  onIconRightPress?: () => Promise<void>;
  iconRightLoading?: boolean;
}) => {
  const navigation = useNavigation();
  const Colors = DynamicColors();
  const styles = styling(Colors, showUserInfo);

  return (
    <View
      style={StyleSheet.compose(styles.topbarContainer, {
        backgroundColor:
          backgroundColor === 'g'
            ? Colors.primary.background
            : Colors.primary.surface,
      })}>
      <BackButton
        onPress={() => navigation.goBack()}
        style={{
          marginRight: PortSpacing.tertiary.right,
          width: 24,
          alignItems: 'center',
          paddingTop: 13,
        }}
      />
      {showUserInfo ? (
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
            gap: 10,
          }}>
          <AvatarBox avatarSize="s" profileUri={avatarUri} />
          <NumberlessText
            style={{
              flex: 1,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
            fontType={FontType.md}
            textColor={Colors.labels.text}
            fontSizeType={FontSizeType.l}>
            {heading}
          </NumberlessText>
          {isConnected &&
            <Pressable
              style={styles.button}
              onPress={async () => {
                onIconRightPress();
              }}
              disabled={iconRightLoading}>
              {iconRightLoading ? (
                <ActivityIndicator color={Colors.primary.white} />
              ) : (
                <>
                  <IconRight width={20} height={20} />
                  <View style={{ flex: 1 }}>
                    <NumberlessText
                      numberOfLines={1}
                      fontType={FontType.rg}
                      textColor={Colors.primary.white}
                      fontSizeType={FontSizeType.s}>
                      Share Contact
                    </NumberlessText>
                  </View>
                </>
              )}
            </Pressable>
          }
        </View>
      ) : (
        isConnected && (
          <Pressable
            style={styles.button}
            onPress={async () => {
              onIconRightPress();
            }}
            disabled={iconRightLoading}>
            {iconRightLoading ? (
              <ActivityIndicator color={Colors.primary.white} />
            ) : (
              <>
                <IconRight width={20} height={20} />
                <View style={{ flex: 1 }}>
                  <NumberlessText
                    numberOfLines={1}
                    fontType={FontType.rg}
                    textColor={Colors.primary.white}
                    fontSizeType={FontSizeType.s}>
                    Share Contact
                  </NumberlessText>
                </View>
              </>
            )}
          </Pressable>
        )
      )}
    </View>
  );
};

const styling = (colors: any, showUserInfo: boolean) =>
  StyleSheet.create({
    topbarContainer: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
      height: TOPBAR_HEIGHT,
      borderBottomColor: showUserInfo ? colors.primary.stroke : 'transparent',
      borderBottomWidth: 0.5,
    },
    heading: {
      color: colors.primary.mainelements,
      fontFamily: FontType.md,
      fontSize: FontSizeType.l,
      fontWeight: getWeight(FontType.rg),
    },
    button: {
      backgroundColor: colors.button.black,
      height: 40,
      width: 130,
      borderRadius: 12,
      paddingHorizontal: PortSpacing.medium.uniform,
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
  });

export default UserInfoTopbar;
