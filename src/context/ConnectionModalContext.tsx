import {useNavigation} from '@react-navigation/native';
import store from '@store/appStore';
import {getBundleFromLink} from '@utils/DeepLinking';
import {ContentType} from '@utils/Messaging/interfaces';
import {processReadBundles, readBundle} from '@utils/Ports';
import {addFilePrefix} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {Mutex} from 'async-mutex';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Linking} from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

type ModalContextType = {
  linkUseError: number;
  setLinkUseError: (x: number) => void;
  connectOverURL: ({url}: {url: string}) => Promise<void>;
};

const ConnectionModalContext = createContext<ModalContextType | undefined>(
  undefined,
);

export const imageRegex = /jpg|jpeg|png|gif|image|webp$/;
export const videoRegex = /mp4|video|mov$/;

export const useConnectionModal = () => {
  const context = useContext(ConnectionModalContext);
  if (!context) {
    throw new Error('useConnectionModal must be used within a ModalProvider');
  }
  return context;
};

type ModalProviderProps = {
  children: ReactNode;
};

export const ConnectionModalProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  // 0 - no error
  // 1 - no internet error
  // 2 - no bundle found at link error
  const [linkUseError, setLinkUseError] = useState(0);

  const navigation = useNavigation<any>();

  //handles files shared into the app
  const handleFilesOps = (files: any) => {
    // TODO: consider redirecting immediately and processing the files in the
    // SelectShareContacts screen itself to reduce latency that is apparent to
    // the user.
    if (!files) {
      return;
    }
    // Detect if we're sharing text or files.
    // We do this by checking the first "file".
    // If it doesn't contain a file, only share the first text chunk.
    if (!files[0].filePath) {
      // This means that it wasn't a file so it must be text.
      const text = files[0].text || files[0].weblink;
      // navigation.navigate('HomeTab');
      navigation.navigate('AppStack', {
        screen: 'SelectShareContacts',
        params: {
          shareMessages: [text],
          isText: true,
        },
      });

      return;
    }

    // If we are here, we must be sharing files
    const filesToShare: {contentType: ContentType; data: FileAttributes}[] = []; // Output buffer for adapted file data
    // Adapt the files to a format that we can work conveniently with
    for (const file of files) {
      // Do file name, path and type wrangling shenanigans
      const payloadFile: FileAttributes = {
        // We decode the fileURI since iOS sharing is percent encoded in newer versions
        fileUri: addFilePrefix(decodeURI(file.filePath)),
        fileType: file.mimeType || '',
        fileName: file.fileName || '',
      };

      // Prepare the message to be forwarded to the contact selection screen
      const msg = {
        contentType: imageRegex.test(file.mimeType)
          ? ContentType.image
          : videoRegex.test(file.mimeType)
          ? ContentType.video
          : ContentType.file,
        data: {...payloadFile},
      };
      filesToShare.push(msg);
    }

    navigation.navigate('AppStack', {
      screen: 'SelectShareContacts',
      params: {
        shareMessages: filesToShare,
        isText: false,
      },
    });
  };

  useEffect(() => {
    ReceiveSharingIntent.getReceivedFiles(
      handleFilesOps,
      (error: any) => {
        console.error('Sharing into RN:', error);
      },
      'PortShare', // share url protocol (must be unique to your app, suggest using your apple bundle id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handles concurrency with links
  const linkMutex = new Mutex();
  // When was the last connection made over a link
  let lastLinkConnectionTime: Date | null = null;
  // Tracks 3 most recent connection URLs
  const recentConnectionLinks: string[] = [];

  /**
   * Connect over any given URL
   * @param param0
   * @returns
   */
  const connectOverURL = async ({
    url,
    navigate = true,
  }: {
    url: string;
    navigate?: boolean;
  }) => {
    try {
      // Guard against using links managed for sharing media into the app
      if (url.startsWith('PortShare')) {
        return;
      }
      if (navigate) {
        navigation.navigate('AppStack', {
          screen: 'HomeTab',
          params: {screen: 'Home'},
        });
      }

      // Double connection prevention logic
      await linkMutex.acquire();
      const compareTime = new Date();
      // 5 second timeout before you can attempt connection over a link again
      compareTime.setSeconds(compareTime.getSeconds() - 5);
      if (
        (lastLinkConnectionTime && compareTime <= lastLinkConnectionTime) ||
        recentConnectionLinks.includes(url)
      ) {
        linkMutex.release();
        return;
      }
      lastLinkConnectionTime = new Date(); // Update the time that the last connection over a link was attempted
      recentConnectionLinks.push(url);
      recentConnectionLinks.slice(-3, undefined); // Only keep 3 most recent connection URLs
      linkMutex.release();

      // Extract the bundle from a URL
      const bundle = await getBundleFromLink({url: url});
      console.log('read bundle: ', bundle);
      // Add the bundle to the list of read bundles and use ALL bundles read so far
      await readBundle(bundle);
      store.dispatch({
        type: 'PING',
        payload: 'PONG',
      });
      await processReadBundles();
      return;
    } catch (error: any) {
      if (typeof error === 'object' && error.response) {
        if (error.response.status === 404) {
          setLinkUseError(2);
          return;
        }
        setLinkUseError(1);
        return;
      }
      setLinkUseError(1);
    }
  };
  /**
   * Connect over a URL with a ddebouncer to prevent multiple connections
   * @param param0
   */
  const connectOverSecondaryURL = async ({url}: {url: string}) => {
    await connectOverURL({url});
  };

  /**
   * Connect over the URL used to open the app from the killed state, if any
   */
  const connectOverinitialURL = async () => {
    let initialURL: string | null = '';
    try {
      initialURL = await Linking.getInitialURL();
    } catch (e) {
      console.error('Could not get initial link', e);
      return;
    }
    if (initialURL) {
      connectOverURL({url: initialURL, navigate: false});
    }
  };
  // Handle any potential deeplinks while foregrounded/backgrounded
  useEffect(() => {
    // Check if there is an initial URL, and use it form a connection
    connectOverinitialURL();
    // Add a listener to connect over URLs that open the app that are not
    // the initial URL
    Linking.addEventListener('url', connectOverSecondaryURL);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConnectionModalContext.Provider
      value={{
        linkUseError: linkUseError,
        setLinkUseError: setLinkUseError,
        connectOverURL: connectOverURL,
      }}>
      {children}
    </ConnectionModalContext.Provider>
  );
};
