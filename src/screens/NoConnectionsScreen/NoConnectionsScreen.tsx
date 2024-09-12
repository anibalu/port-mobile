import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {useNavigation} from '@react-navigation/native';
import {FolderChatsTopBar} from '@screens/Folders/FolderChatsTopBar';
import {checkAndAskContactPermission} from '@utils/AppPermissions';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React from 'react';
import {StyleSheet, View} from 'react-native';

const NoConnectionsScreen = () => {
  const colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'InviteContactPoster',
      light: require('@assets/light/icons/InviteContactPoster.svg').default,
      dark: require('@assets/dark/icons/InviteContactPoster.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const InviteContactPoster = results.InviteContactPoster;
  const navigation = useNavigation();

  const onInviteContactClick = async () => {
    const granted = await checkAndAskContactPermission();
    if (granted) {
      navigation.navigate('PhoneContactList');
    }
  };
  return (
    <>
      <CustomStatusBar backgroundColor={colors.primary.surface} />
      <GestureSafeAreaView
        removeOffset={true}
        style={{
          backgroundColor: colors.primary.background,
        }}>
        <FolderChatsTopBar showEdit={false} />
        <View style={styles.main}>
          <SimpleCard style={styles.card}>
            <InviteContactPoster
              style={{alignSelf: 'center'}}
              width={screen.width - 60}
            />
            <NumberlessText
              textColor={colors.text.primary}
              fontSizeType={FontSizeType.xl}
              fontType={FontType.sb}>
              Looks like you haven’t made any connections yet
            </NumberlessText>
            <NumberlessText
              textColor={colors.text.primary}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              In order to use folders, you need to have at least one connection.
              Invite people to connect with you now!
            </NumberlessText>
            <View style={{marginTop: PortSpacing.secondary.top}}>
              <PrimaryButton
                disabled={false}
                isLoading={false}
                onClick={onInviteContactClick}
                buttonText="Invite contacts"
                primaryButtonColor={'b'}
              />
            </View>
          </SimpleCard>
        </View>
      </GestureSafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: PortSpacing.secondary.uniform,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: PortSpacing.secondary.uniform,
    gap: PortSpacing.tertiary.uniform,
  },
});

export default NoConnectionsScreen;
