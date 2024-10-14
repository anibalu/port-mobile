import React, {FC} from 'react';
import {View, StyleSheet} from 'react-native';
import BellRed from '@assets/icons/BellRed.svg';
import DownloadTeal from '@assets/icons/DownloadTeal.svg';
import HomeSafron from '@assets/icons/HomeSafron.svg';
import ShareContactGreen from '@assets/icons/ShareContactGreen.svg';
import CheckCircleOrange from '@assets/icons/CheckCircleOrange.svg';
import DisappearingMessageBlue from '@assets/icons/DisappearingMessageBlue.svg';
import ProfileTeal from '@assets/icons/ProfileTeal.svg';
import FavouriteFolderOrange from '@assets/icons/FavouriteFolderOrange.svg';

import BellDisabled from '@assets/light/icons/BellDisabled.svg';
import DownloadDisabled from '@assets/light/icons/DownloadDisabled.svg';
import HomeDisabled from '@assets/light/icons/HomeDisabled.svg';
import ShareContactDisabled from '@assets/light/icons/ShareContactDisabled.svg';
import CheckCircleDisabled from '@assets/light/icons/CheckCircleDisabled.svg';
import DisappearingMessageDisabled from '@assets/light/icons/DisappearingMessageDisabled.svg';
import ProfileDisabled from '@assets/light/icons/ProfileDisabled.svg';
import FavouriteFolderDisabled from '@assets/light/icons/FavouriteFolderDisabled.svg';

import BellDisabledDark from '@assets/dark/icons/BellDisabled.svg';
import DownloadDisabledDark from '@assets/dark/icons/DownloadDisabled.svg';
import HomeDisabledDark from '@assets/dark/icons/HomeDisabled.svg';
import ShareContactDisabledDark from '@assets/dark/icons/ShareContactDisabled.svg';
import CheckCircleDisabledDark from '@assets/dark/icons/CheckCircleDisabled.svg';
import DisappearingMessageDisabledDark from '@assets/dark/icons/DisappearingMessageDisabled.svg';
import ProfileDisabledDark from '@assets/dark/icons/ProfileDisabled.svg';
import FavouriteFolderDisabledDark from '@assets/dark/icons/FavouriteFolderDisabled.svg';

import DynamicColors from '@components/DynamicColors';
import {SvgProps} from 'react-native-svg';
import {PortSpacing} from '@components/ComponentUtils';

/**
 * Returns a JSX element representing an icon with a background color based on the provided permission state.
 *
 * @param {Array<string, boolean>} permission - A tuple where the first element is the permission name and the second is a boolean indicating whether the permission is enabled.
 * @returns {JSX.Element | null} - A circular `View` JSX element representing the icon with the appropriate background color, or null if the permission is not found.
 */

type PermissionConfig = {
  bgColor: string;
  enabledIcon: FC<SvgProps>;
  disabledIconLight: FC<SvgProps>;
  disabledIconDark: FC<SvgProps>;
};

const permissionConfigMap: {[key: string]: PermissionConfig} = {
  notifications: {
    bgColor: 'brightRed',
    enabledIcon: BellRed,
    disabledIconLight: BellDisabled,
    disabledIconDark: BellDisabledDark,
  },
  autoDownload: {
    bgColor: 'tealBlue',
    enabledIcon: DownloadTeal,
    disabledIconLight: DownloadDisabled,
    disabledIconDark: DownloadDisabledDark,
  },
  focus: {
    bgColor: 'deepSafron',
    enabledIcon: HomeSafron,
    disabledIconLight: HomeDisabled,
    disabledIconDark: HomeDisabledDark,
  },
  contactSharing: {
    bgColor: 'darkGreen',
    enabledIcon: ShareContactGreen,
    disabledIconLight: ShareContactDisabled,
    disabledIconDark: ShareContactDisabledDark,
  },
  disappearingMessages: {
    bgColor: 'blue',
    enabledIcon: DisappearingMessageBlue,
    disabledIconLight: DisappearingMessageDisabled,
    disabledIconDark: DisappearingMessageDisabledDark,
  },
  readReceipts: {
    bgColor: 'orange',
    enabledIcon: CheckCircleOrange,
    disabledIconLight: CheckCircleDisabled,
    disabledIconDark: CheckCircleDisabledDark,
  },
  displayPicture: {
    bgColor: 'blue',
    enabledIcon: ProfileTeal,
    disabledIconLight: ProfileDisabled,
    disabledIconDark: ProfileDisabledDark,
  },
  favourite: {
    bgColor: 'orange',
    enabledIcon: FavouriteFolderOrange,
    disabledIconLight: FavouriteFolderDisabled,
    disabledIconDark: FavouriteFolderDisabledDark,
  },
};

const getPermissionIcon = ([permissionName, isEnabled, themeValue]: [
  string,
  boolean,
  string,
]) => {
  const Colors = DynamicColors();
  const config = permissionConfigMap[permissionName];
  if (!config) {
    return <></>;
  }

  const Icon = isEnabled
    ? config.enabledIcon
    : themeValue === 'light'
    ? config.disabledIconLight
    : config.disabledIconDark;

  const backgroundColor =
    Colors.lowAccentColors[
      config.bgColor as keyof typeof Colors.lowAccentColors
    ];

  return (
    <View
      key={permissionName}
      style={StyleSheet.compose(styles.container, {
        backgroundColor: isEnabled ? backgroundColor : 'transparent',
        borderWidth: 0.5,
        borderColor: isEnabled ? 'transparent' : Colors.primary.darkgrey,
      })}>
      <Icon width={20} height={20} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    padding: PortSpacing.tertiary.uniform,
  },
});

export default getPermissionIcon;
