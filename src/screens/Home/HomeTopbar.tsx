/**
 * Top Bar of the home screen containing sidebar menu, pending request count and search.
 */
import SearchIcon from '@assets/icons/searchThin.svg';
import PendingRequestIcon from '@assets/icons/pendingRequestThin.svg';
import {PortColors, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TOPBAR_HEIGHT} from '@configs/constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {numberOfPendingRequests} from '@utils/Ports';
import SidebarMenu from '@assets/icons/SidebarMenu.svg';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import {useSelector} from 'react-redux';
import {GenericButton} from '@components/GenericButton';
import SideDrawer from './SideDrawer';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type TopbarProps = {
  toptitleMessage: String;
  unread: Number | undefined;
  openSideDrawer?: boolean;
  setOpenSideDrawer?: any;
};

function HomeTopbar({
  unread,
  toptitleMessage = 'All',
  openSideDrawer,
  setOpenSideDrawer,
}: TopbarProps): ReactNode {
  const title = unread
    ? `${toptitleMessage} (${unread})`
    : `${toptitleMessage}`;
  const navigation = useNavigation<any>();

  const reloadTrigger = useSelector(
    state => state.triggerPendingRequestsReload.change,
  );

  const iosPaddingTop = useSafeAreaInsets().top;

  const [pendingRequestsLength, setPendingRequestsLength] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setPendingRequestsLength(await numberOfPendingRequests());
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadTrigger]),
  );

  return (
    <View style={styles.bar}>
      <View style={styles.menuLeft}>
        <GenericButton
          buttonStyle={styles.iconWrapper}
          onPress={() => setOpenSideDrawer(p => !p)}
          IconLeft={SidebarMenu}
        />
        <NumberlessText
          style={styles.maintitle}
          numberOfLines={1}
          ellipsizeMode="tail"
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {title}
        </NumberlessText>
      </View>
      <View style={styles.optionsRight}>
        <Pressable
          style={styles.iconWrapper}
          onPress={() => navigation.navigate('PendingRequests')}>
          <PendingRequestIcon width={24} height={24} />
          {pendingRequestsLength > 0 && (
            <View style={styles.badgeWrapper}>
              <NumberlessText
                textColor={PortColors.primary.blue.app}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.xs}>
                {pendingRequestsLength}
              </NumberlessText>
            </View>
          )}
        </Pressable>
        <GenericButton
          iconSize={24}
          buttonStyle={styles.iconWrapper}
          onPress={() => console.log('search clicked!')}
          IconLeft={SearchIcon}
        />
      </View>
      <Modal
        onSwipeComplete={() => setOpenSideDrawer(p => !p)}
        backdropTransitionOutTiming={400}
        backdropTransitionInTiming={400}
        animationInTiming={400}
        animationOutTiming={400}
        animationIn={'slideInLeft'}
        animationOut={'slideOutLeft'}
        style={StyleSheet.compose(styles.modal, {
          paddingTop: isIOS ? iosPaddingTop : 0,
        })}
        hideModalContentWhileAnimating={true}
        onBackButtonPress={() => setOpenSideDrawer(p => !p)}
        isVisible={openSideDrawer}
        onBackdropPress={() => setOpenSideDrawer(p => !p)}>
        <SideDrawer setOpenSideDrawer={setOpenSideDrawer} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: TOPBAR_HEIGHT,
  },
  modal: {
    margin: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuLeft: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  optionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    gap: 6,
  },
  backgroundImage: {
    width: 50,
    height: 50,
    position: 'absolute',
    resizeMode: 'cover',
  },
  maintitle: {
    textAlign: 'center',
  },
  iconWrapper: {
    backgroundColor: 'transparent',
    position: 'relative',
    padding: 8,
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  badgeWrapper: {
    width: 16,
    height: 16,
    borderRadius: 9,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PortColors.primary.border.dullGrey,
    overflow: 'hidden',
    position: 'absolute',
    textAlign: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    alignItems: 'center',
    top: 0,
    right: -4,
  },
});

export default HomeTopbar;
