import {screen} from '@components/ComponentUtils';
import {DRAWER_SWIPE_EDGE_WIDTH, SIDE_DRAWER_WIDTH} from '@configs/constants';
import React, {ReactNode} from 'react';
import {Drawer} from 'react-native-drawer-layout';
import SideDrawer from './SideDrawer';
import {StyleSheet} from 'react-native';

interface SideDrawerWrapperProps {
  children: ReactNode;
  setOpenSideDrawer: (p: boolean) => void;
  openSideDrawer: boolean;
}

function SideDrawerWrapper({
  openSideDrawer,
  setOpenSideDrawer,
  children,
}: SideDrawerWrapperProps) {
  return (
    <Drawer
      swipeEdgeWidth={DRAWER_SWIPE_EDGE_WIDTH}
      drawerType="slide"
      drawerStyle={styles.drawer}
      open={openSideDrawer}
      onOpen={() => setOpenSideDrawer(true)}
      onClose={() => setOpenSideDrawer(false)}
      renderDrawerContent={() => {
        return <SideDrawer setOpenSideDrawer={setOpenSideDrawer} />;
      }}>
      {children}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    height: screen.height,
    width: SIDE_DRAWER_WIDTH,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default SideDrawerWrapper;
