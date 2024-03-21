import {isIOS} from '@components/ComponentUtils';
import {useNavigation} from '@react-navigation/native';
import store from '@store/appStore';
import {handleDeepLink} from '@utils/DeepLinking';
import {ContentType} from '@utils/Messaging/interfaces';
import {readBundle} from '@utils/Ports';
import {FileAttributes} from '@utils/Storage/interfaces';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Linking} from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {useSelector} from 'react-redux';

type ModalContextType = {
  linkUseError: number;
  setLinkUseError: (x: number) => void;
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
    const sharingMessageObjects = [];
    let isText = false;

    if (files) {
      for (const file of files) {
        const payloadFile: FileAttributes = {
          fileUri: isIOS ? file.filePath : 'file://' + file.filePath || '',
          fileType: file.mimeType || '',
          fileName: file.fileName || '',
        };

        //Text has been shared
        if (
          payloadFile.fileUri === 'file://null' ||
          payloadFile.fileUri === null
        ) {
          sharingMessageObjects.push(file.text);
          isText = true;
          console.log('File received is: ', sharingMessageObjects);
        } else {
          console.log('File is: ', file);
          const msg = {
            contentType: imageRegex.test(file.mimeType)
              ? ContentType.image
              : videoRegex.test(file.mimeType)
              ? ContentType.video
              : ContentType.file,
            data: {...payloadFile},
          };
          sharingMessageObjects.push(msg);
        }
      }

      navigation.navigate('SelectShareContacts', {
        shareMessages: sharingMessageObjects,
        isText,
      });
    }
  };

  useEffect(() => {
    ReceiveSharingIntent.getReceivedFiles(
      handleFilesOps,
      (error: any) => {
        console.log('Error sharing into RN:', error);
      },
      'PortShare', // share url protocol (must be unique to your app, suggest using your apple bundle id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkDeeplink = async ({url}: {url: string}) => {
    try {
      // Checking if PortShare (share into port) is being triggered
      if (url.startsWith('PortShare')) {
        return;
      } else {
        console.log('calling deep link', url);
        navigation.navigate('HomeTab');
        const bundle = await handleDeepLink({url: url});
        await readBundle(bundle);
        store.dispatch({
          type: 'PING',
          payload: 'PONG',
        });
        // await processReadBundles();
      }
    } catch (error: any) {
      if (typeof error === 'object' && error.response) {
        if (error.response.status === 404) {
          setLinkUseError(2);
        } else {
          setLinkUseError(1);
        }
      } else {
        setLinkUseError(1);
      }
    }
  };
  // Handle any potential deeplinks while foregrounded/backgrounded
  const initialLink = useSelector(state => state.initialLink.initialLink);
  useEffect(() => {
    // Check if a link was used to open the app for the first time and
    // Consume said link if it was
    console.log('initial link 1', initialLink);
    if (initialLink) {
      checkDeeplink({url: initialLink});
      store.dispatch({type: 'NEW_LINK', payload: null});
    }
    console.log('initial link 2', initialLink);
    Linking.addEventListener('url', url => {
      // Check that this listener isn't being called on the initial link
      // since it's being handled above already
      checkDeeplink(url);
    });
    return () => {
      Linking.removeAllListeners('url');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConnectionModalContext.Provider
      value={{
        linkUseError: linkUseError,
        setLinkUseError: setLinkUseError,
      }}>
      {children}
    </ConnectionModalContext.Provider>
  );
};
