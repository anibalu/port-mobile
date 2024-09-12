/**
 * Default chat tile displayed when there are no connections
 */
import {PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode, useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {
  BOTTOMBAR_HEIGHT,
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  TOPBAR_HEIGHT,
} from '@configs/constants';
import Link from '@assets/icons/LinkDeepSafron.svg';
import Scanner from '@assets/icons/ScannerDarkGreen.svg';
import PortBrand from '@assets/icons/PortBrandPurple.svg';
import InviteContact from '@assets/icons/InviteContactOrange.svg';
import {useSelector} from 'react-redux';
import {checkAndAskContactPermission} from '@utils/AppPermissions';

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
  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
    {
      assetName: 'Plus',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const AngleRight = results.AngleRight;
  const Plus = results.Plus;

  const styles = styling(Colors);

  const onInviteContactClick = async () => {
    const granted = await checkAndAskContactPermission();
    if (granted) {
      navigation.navigate('PhoneContactList');
    }
  };

  const onScanQRClick = () => {
    navigation.navigate('Scan');
  };

  const onCreatePortClick = () => {
    navigation.navigate('NewPortScreen', {});
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headingWrapper}>
        <NumberlessText
          textColor={Colors.primary.mainelements}
          fontSizeType={FontSizeType.esPlus}
          fontType={FontType.sb}>
          {`Hey ${name},\nWelcome to Port!`}
        </NumberlessText>
        <NumberlessText
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}>
          Let's help you form your first connection
        </NumberlessText>
      </View>
      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.gridCardHorizontal} activeOpacity={1}>
          <View
            style={StyleSheet.compose(styles.cardLeft, {
              backgroundColor: Colors.lowAccentColors.deepSafron,
            })}>
            <Link height={32} width={32} />
          </View>
          <View style={styles.cardRight}>
            <NumberlessText
              textColor={Colors.primary.mainelements}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              Did you come through a link?
            </NumberlessText>
            <NumberlessText
              numberOfLines={2}
              ellipsizeMode="tail"
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Kindly click the same link to form a connection.
            </NumberlessText>
          </View>
        </TouchableOpacity>

        <View
          style={{
            gap: PortSpacing.tertiary.uniform,
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.gridCardVertical}
            onPress={onScanQRClick}>
            <View style={styles.cardTop}>
              <View
                style={StyleSheet.compose(styles.cardTopIconWraper, {
                  backgroundColor: Colors.lowAccentColors.darkGreen,
                })}>
                <Scanner height={32} width={32} />
              </View>
              <AngleRight height={20} width={20} />
            </View>
            <View style={styles.cardBottom}>
              <NumberlessText
                textColor={Colors.primary.mainelements}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                Have a QR code?
              </NumberlessText>
              <NumberlessText
                numberOfLines={2}
                ellipsizeMode="tail"
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Scan the QR code again to form a connection.
              </NumberlessText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.gridCardVertical}
            onPress={onCreatePortClick}>
            <View style={styles.cardTop}>
              <View
                style={StyleSheet.compose(styles.cardTopIconWraper, {
                  backgroundColor: Colors.lowAccentColors.violet,
                })}>
                <PortBrand height={32} width={32} />
              </View>
              <Plus height={18} width={18} />
            </View>
            <View style={styles.cardBottom}>
              <NumberlessText
                textColor={Colors.primary.mainelements}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                Create your first Port
              </NumberlessText>
              <NumberlessText
                numberOfLines={2}
                ellipsizeMode="tail"
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Create your own Port to share and connect.
              </NumberlessText>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.gridCardHorizontal}
          onPress={onInviteContactClick}>
          <View
            style={StyleSheet.compose(styles.cardLeft, {
              backgroundColor: Colors.lowAccentColors.orange,
            })}>
            <InviteContact height={32} width={32} />
          </View>
          <View style={styles.cardRight}>
            <NumberlessText
              textColor={Colors.primary.mainelements}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              Invite existing contacts
            </NumberlessText>
            <NumberlessText
              numberOfLines={2}
              ellipsizeMode="tail"
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Click here to invite your existing contacts to Port.
            </NumberlessText>
          </View>
          <AngleRight height={20} width={20} />
        </TouchableOpacity>
      </View>
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
      paddingTop: 50,
      gap: 45,
    },
    cardLeft: {
      padding: PortSpacing.medium.uniform,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: PortSpacing.tertiary.uniform,
    },
    cardTop: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    cardTopIconWraper: {
      padding: PortSpacing.medium.uniform,
      borderRadius: PortSpacing.tertiary.uniform,
    },
    cardBottom: {
      gap: 4,
      width: '100%',
    },
    gridContainer: {
      gap: PortSpacing.tertiary.uniform,
    },
    cardRight: {
      gap: 4,
      marginHorizontal: PortSpacing.secondary.uniform,
      flex: 1,
    },
    gridCardVertical: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: PortSpacing.secondary.uniform,
      padding: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.medium.uniform,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      flexGrow: 1,
      flexBasis: 0,
    },
    gridCardHorizontal: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.medium.uniform,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
    },
    headingWrapper: {
      flexDirection: 'column',
      gap: PortSpacing.tertiary.uniform,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
  });

export default HomescreenPlaceholder;
