import {DRAWER_SWIPE_EDGE_WIDTH, SIDE_DRAWER_WIDTH} from '@configs/constants';
import React, {ReactNode} from 'react';
import {Drawer} from 'react-native-drawer-layout';
import SideDrawer from './SideDrawer';
import {StyleSheet} from 'react-native';
import {FolderInfo, FolderInfoWithUnread} from '@utils/ChatFolders/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';
import {isIOS} from '@components/ComponentUtils';

interface SideDrawerWrapperProps {
  children: ReactNode;
  setDisableTileClicks: (disable: boolean) => void;
  selectedFolderData: FolderInfo;
  setSelectedFolderData: any;
  setOpenSideDrawer: (p: boolean) => void;
  openSideDrawer: boolean;
  folders: FolderInfoWithUnread[];
  name: string;
  profilePicAttr: FileAttributes;
  pendingRequestsLength: number;
  superportsLength: number;
}

function SideDrawerWrapper({
  openSideDrawer,
  setDisableTileClicks,
  setOpenSideDrawer,
  selectedFolderData,
  setSelectedFolderData,
  folders,
  name,
  profilePicAttr,
  pendingRequestsLength,
  children,
  superportsLength,
}: SideDrawerWrapperProps) {
  const onOpen = () => {
    if (isIOS) {
      setOpenSideDrawer(true);
      return;
    }
    if (!openSideDrawer) {
      setOpenSideDrawer(true);
    }
  };
  const onClose = () => {
    if (isIOS) {
      setOpenSideDrawer(false);
      return;
    }
    if (openSideDrawer) {
      setOpenSideDrawer(false);
    }
  };
  return (
    <Drawer
      swipeEdgeWidth={DRAWER_SWIPE_EDGE_WIDTH}
      drawerType="slide"
      drawerStyle={styles.drawer}
      open={openSideDrawer}
      onGestureEnd={() => setDisableTileClicks(false)}
      onGestureStart={() => setDisableTileClicks(true)}
      onOpen={onOpen}
      onClose={onClose}
      swipeMinDistance={10}
      renderDrawerContent={() => {
        return (
          <SideDrawer
            selectedFolderData={selectedFolderData}
            setSelectedFolderData={setSelectedFolderData}
            setOpenSideDrawer={setOpenSideDrawer}
            folders={folders}
            name={name}
            profilePicAttr={profilePicAttr}
            superportsLength={superportsLength}
            pendingRequestsLength={pendingRequestsLength}
          />
        );
      }}>
      {children}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: SIDE_DRAWER_WIDTH,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default SideDrawerWrapper;
