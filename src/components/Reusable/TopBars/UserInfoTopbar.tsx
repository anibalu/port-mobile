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

import {PortColors, PortSpacing} from '@components/ComponentUtils';
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
import BackIcon from '@assets/navigation/backButton.svg';
import {useNavigation} from '@react-navigation/native';
import {AvatarBox} from '../AvatarBox/AvatarBox';

const UserInfoTopbar = ({
  IconRight,
  avatarUri,
  backgroundColor,
  heading,
  onIconRightPress,
  showUserInfo,
}: {
  backgroundColor: 'g' | 'w';
  avatarUri: string;
  IconRight?: FC<SvgProps>;
  heading?: string;
  showUserInfo?: boolean;
  onIconRightPress?: () => void;
}) => {
  const navigation = useNavigation();
  return (
    <View
      style={StyleSheet.compose(styles.topbarContainer, {
        backgroundColor:
          backgroundColor === 'g'
            ? PortColors.background
            : PortColors.primary.white,
      })}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={{marginRight: PortSpacing.tertiary.right}}>
        <BackIcon width={24} height={24} />
      </Pressable>
      {showUserInfo && (
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
            gap: 10,
          }}>
          <AvatarBox avatarSize="s" profileUri={avatarUri} />
          <NumberlessText
            style={{textAlign: 'center'}}
            numberOfLines={1}
            ellipsizeMode="tail"
            fontType={FontType.md}
            fontSizeType={FontSizeType.l}>
            {heading}
          </NumberlessText>
        </View>
      )}
      {IconRight && (
        <Pressable onPress={onIconRightPress}>
          <IconRight width={24} height={24} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topbarContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  heading: {
    color: PortColors.title,
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.rg),
  },
});

export default UserInfoTopbar;
