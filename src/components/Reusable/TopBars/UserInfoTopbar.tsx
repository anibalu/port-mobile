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

import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {TOPBAR_HEIGHT} from '@configs/constants';

const UserInfoTopbar = ({
  IconRight,
  avatarUri,
  backgroundColor,
  heading,
  onIconRightPress = async () => {},
  showUserInfo = false,
}: {
  backgroundColor: 'g' | 'w';
  avatarUri: string;
  IconRight: FC<SvgProps>;
  heading?: string;
  showUserInfo?: boolean;
  onIconRightPress?: () => void;
}) => {
  const navigation = useNavigation();
  const Colors = DynamicColors();
  const styles = styling(Colors, showUserInfo);
  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'DynamicBackIcon',
      light: require('@assets/light/icons/navigation/BlackArrowLeftThin.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const DynamicBackIcon = results.DynamicBackIcon;
  return (
    <View
      style={StyleSheet.compose(styles.topbarContainer, {
        backgroundColor:
          backgroundColor === 'g'
            ? Colors.primary.background
            : Colors.primary.surface,
      })}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={{marginRight: PortSpacing.tertiary.right}}>
        <DynamicBackIcon width={24} height={24} />
      </Pressable>
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
          <Pressable
            style={styles.button}
            onPress={async () => {
              onIconRightPress();
            }}>
            <IconRight width={20} height={20} />
            <View style={{flex: 1}}>
              <NumberlessText
                numberOfLines={1}
                fontType={FontType.rg}
                textColor={Colors.primary.white}
                fontSizeType={FontSizeType.s}>
                Share Contact
              </NumberlessText>
            </View>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.button}
          onPress={async () => {
            onIconRightPress();
          }}>
          <IconRight width={20} height={20} />
          <View style={{flex: 1}}>
            <NumberlessText
              numberOfLines={1}
              fontType={FontType.rg}
              textColor={Colors.primary.white}
              fontSizeType={FontSizeType.s}>
              Share Contact
            </NumberlessText>
          </View>
        </Pressable>
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
