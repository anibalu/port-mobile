import {ChatTileProps} from '@components/ChatTile/ChatTile';
import {defaultFolderInfo} from '@configs/constants';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {FolderInfoWithUnread} from '@utils/Storage/folders';
import React, {createContext, useContext, useState, ReactNode} from 'react';

/**
 * BottomNavContext
 *
 * This context provides a way to manage control over the bopttom nav bar's visibility depending on chat action bar's visibility.
 *
 * It wraps the Tab Navigator's bottom navbar, and all components inside (i.e home, superports, folders, profile and connection options)
 * the navigator are subscribed to this context. This allows for centralized
 * control over the chat action bar's visibility throughout the app.
 *
 */

interface BottomNavContextType {
  isConnectionOptionsModalOpen: boolean;
  setIsConnectionOptionsModalOpen: (x: boolean) => void;
  isChatActionBarVisible: boolean;
  setIsChatActionBarVisible: (x: boolean) => void;
  selectedFolderData: FolderInfo | null | undefined;
  setSelectedFolderData: (x: FolderInfo | null | undefined) => void;
  selectedProps: ChatTileProps | null;
  setSelectedProps: (x: ChatTileProps | null) => void;
  contactShareParams: {
    name: string;
    pairHash: string;
  } | null;
  setContactShareParams: (
    x: {
      name: string;
      pairHash: string;
    } | null,
  ) => void;
  selectedConnections: ChatTileProps[];
  setSelectedConnections: (x: ChatTileProps[]) => void;
  selectionMode: boolean;
  setSelectionMode: (x: boolean) => void;
  moveToFolderSheet: boolean;
  setMoveToFolderSheet: (x: boolean) => void;
  openAddingNewContactModal: boolean;
  setOpenAddingNewContactModal: (x: boolean) => void;
  confirmSheet: boolean;
  setConfirmSheet: (x: boolean) => void;
  totalUnreadCount: number;
  setTotalUnreadCount: (x: number) => void;
  totalFolderUnreadCount: number;
  setTotalFolderUnreadCount: (x: number) => void;
  folders: FolderInfoWithUnread[];
  setFolders: (x: FolderInfoWithUnread[]) => void;
  connections: ChatTileProps[] | null;
  setConnections: (x: ChatTileProps[] | null) => void;
  folderConnections: ChatTileProps[] | null;
  setFolderConnections: (x: ChatTileProps[] | null) => void;
  setConnectionsNotInFocus: (x: number) => void;
  connectionsNotInFocus: number;
}

const BottomNavContext = createContext<BottomNavContextType | undefined>(
  undefined,
);

export const BottomNavProvider = ({children}: {children: ReactNode}) => {
  const [isChatActionBarVisible, setIsChatActionBarVisible] =
    useState<boolean>(false);
  //sets selected folder info
  const [selectedFolderData, setSelectedFolderData] = useState<
    FolderInfo | null | undefined
  >(null);
  const [selectedProps, setSelectedProps] = useState<ChatTileProps | null>(
    null,
  );
  const [contactShareParams, setContactShareParams] = useState<{
    name: string;
    pairHash: string;
  } | null>(null);
  //selected connection Ids
  const [selectedConnections, setSelectedConnections] = useState<
    ChatTileProps[]
  >([]);
  // Control the visibility of the connections modal
  const [isConnectionOptionsModalOpen, setIsConnectionOptionsModalOpen] =
    useState(false);
  //whether the screen is in selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [moveToFolderSheet, setMoveToFolderSheet] = useState(false);
  //controls adding new contact modal
  const [openAddingNewContactModal, setOpenAddingNewContactModal] =
    useState(false);
  const [confirmSheet, setConfirmSheet] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [totalFolderUnreadCount, setTotalFolderUnreadCount] =
    useState<number>(0);
  const [folders, setFolders] = useState<FolderInfoWithUnread[]>([
    {...defaultFolderInfo, unread: 0},
  ]);
  //all connections available
  const [connections, setConnections] = useState<ChatTileProps[] | null>(null);
  //all folder connections available
  const [folderConnections, setFolderConnections] = useState<
    ChatTileProps[] | null
  >(null);

  const [connectionsNotInFocus, setConnectionsNotInFocus] = useState(0);

  return (
    <BottomNavContext.Provider
      value={{
        isConnectionOptionsModalOpen,
        setIsConnectionOptionsModalOpen,
        isChatActionBarVisible,
        setIsChatActionBarVisible,
        selectedFolderData,
        setSelectedFolderData,
        selectedProps,
        setSelectedProps,
        contactShareParams,
        setContactShareParams,
        selectedConnections,
        setSelectedConnections,
        selectionMode,
        setSelectionMode,
        moveToFolderSheet,
        setMoveToFolderSheet,
        openAddingNewContactModal,
        setOpenAddingNewContactModal,
        confirmSheet,
        setConfirmSheet,
        totalUnreadCount,
        setTotalUnreadCount,
        totalFolderUnreadCount,
        setTotalFolderUnreadCount,
        folders,
        setFolders,
        connections,
        setConnections,
        folderConnections,
        setFolderConnections,
        connectionsNotInFocus,
        setConnectionsNotInFocus,
      }}>
      {children}
    </BottomNavContext.Provider>
  );
};

export const useBottomNavContext = () => {
  const context = useContext(BottomNavContext);
  if (context === undefined) {
    throw new Error(
      'useBottomNavContext must be used within a BottomNavProvider',
    );
  }
  return context;
};
