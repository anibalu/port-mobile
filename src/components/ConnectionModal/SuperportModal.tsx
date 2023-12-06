import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Cross from '@assets/icons/cross.svg';
import {useConnectionModal} from '../../context/ConnectionModalContext';
import GenericModal from '../GenericModal';
import {
  NumberlessBoldText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '../NumberlessText';
import {PortColors, screen} from '../ComponentUtils';
import Back from '@assets/navigation/backButton.svg';
import {GeneratedDirectSuperportConnectionBundle} from '@utils/Bundles/interfaces';
import {loadGeneratedSuperports} from '@utils/Bundles/directSuperport';
import WhiteArrowRight from '@assets/icons/WhiteArrowRight.svg';
import PublishSuperportIcon from '@assets/icons/PublishSuperports.svg';
import ChatBackground from '@components/ChatBackground';
import SuperPortIcon from '@assets/icons/ActiveGateways.svg';
import {getChatTileTimestamp} from '@utils/Time';
import Create from '@assets/icons/Create.svg';
import {GenericButton} from '@components/GenericButton';

const SuperportModal: React.FC = () => {
  const {
    superportModalVisible: modalVisible,
    hideSuperportModal: hideModal,
    showNewPortModal: showNewPortModal,
    showSuperportCreateModal: showSuperportCreateModal,
    setConnectionSuperportId: setConnectionSuperportId,
    connectionSuperportId: connectionSuperportId,
  } = useConnectionModal();
  const [loadingSuperports, setLoadingSuperports] = useState<boolean>(true);
  const [data, setData] = useState<
    Array<GeneratedDirectSuperportConnectionBundle>
  >([]);

  const cleanupModal = () => {
    hideModal();
  };
  const openNewPortModal = () => {
    cleanupModal();
    showNewPortModal();
  };
  const openExistingSuperport = (superportId: string) => {
    cleanupModal();
    setConnectionSuperportId(superportId);
    showSuperportCreateModal();
  };
  const createNewSuperport = () => {
    cleanupModal();
    setConnectionSuperportId('');
    showSuperportCreateModal();
  };
  useEffect(() => {
    if (modalVisible) {
      try {
        const fetchData = async () => {
          const result = await loadGeneratedSuperports();
          setData(result);
          setLoadingSuperports(false);
          console.log('fetched new data');
        };
        fetchData();
      } catch (error) {
        cleanupModal();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionSuperportId, modalVisible]);
  return (
    <GenericModal visible={modalVisible} onClose={cleanupModal}>
      <View style={styles.modalView}>
        <View style={styles.superportTopBar}>
          <Pressable style={styles.closeButton} onPress={openNewPortModal}>
            <Back />
          </Pressable>
          <Pressable style={styles.closeButton} onPress={cleanupModal}>
            <Cross />
          </Pressable>
        </View>
        {loadingSuperports ? (
          <View style={styles.LoaderScreen}>
            <ActivityIndicator size={'large'} color={'#000000'} />
          </View>
        ) : (
          <View style={styles.SuperportScreen}>
            {data.length >= 1 ? (
              <ShowActiveSuperports
                data={data}
                openExistingSuperport={openExistingSuperport}
                createNewSuperport={createNewSuperport}
              />
            ) : (
              <ShowWelcomeScreen createNewSuperport={createNewSuperport} />
            )}
          </View>
        )}
      </View>
    </GenericModal>
  );
};

function ShowWelcomeScreen({
  createNewSuperport,
}: {
  createNewSuperport: () => void;
}) {
  return (
    <View style={styles.mainBox}>
      <NumberlessBoldText style={styles.title}>
        Publish Superports
      </NumberlessBoldText>
      <PublishSuperportIcon width={screen.width - 40} />
      <NumberlessRegularText style={styles.subtitle}>
        Publish Superports to your social channels to funnel new conversations
        to Port, or use them to port over large groups , too.
      </NumberlessRegularText>
      <GenericButton
        buttonStyle={{
          flexDirection: 'row',
          width: '80%',
          height: 60,
          marginBottom: 38,
        }}
        textStyle={{flex: 1, textAlign: 'center'}}
        iconStyle={{right: 20}}
        Icon={WhiteArrowRight}
        iconPosition="right"
        onPress={createNewSuperport}>
        Create Superport
      </GenericButton>
    </View>
  );
}

function ShowActiveSuperports({
  data,
  openExistingSuperport,
  createNewSuperport,
}: {
  data: GeneratedDirectSuperportConnectionBundle[];
  openExistingSuperport: (x: string) => void;
  createNewSuperport: () => void;
}) {
  return (
    <View style={styles.activeSuperportBox}>
      <ChatBackground standard={false} />
      <NumberlessMediumText style={styles.activeTitle}>
        Active Superports
      </NumberlessMediumText>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}>
        {data.map(superport => {
          const id = superport.data.linkId;
          return (
            <Pressable
              onPress={() => {
                openExistingSuperport(id);
              }}
              key={id}>
              <ActiveSuperportComponent content={superport} />
            </Pressable>
          );
        })}
        <Pressable onPress={createNewSuperport} key={'createSuperport'}>
          <CreateNewSuperport />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ActiveSuperportComponent({
  content,
}: {
  content: GeneratedDirectSuperportConnectionBundle;
}) {
  return (
    <View style={styles.component}>
      <View style={styles.header}>
        <SuperPortIcon width={40} />
        <NumberlessMediumText
          style={styles.headertext}
          numberOfLines={2}
          ellipsizeMode="tail">
          {content.label || 'unlabeled'}
        </NumberlessMediumText>
      </View>
      <View style={styles.bottomView}>
        <NumberlessMediumText style={styles.bottomText}>
          Created
        </NumberlessMediumText>
        <NumberlessMediumText style={styles.bottomText}>
          {getChatTileTimestamp(content.timestamp)}
        </NumberlessMediumText>
      </View>
      {content.lastUsed && content.lastUsed !== '' && (
        <View style={styles.bottomView}>
          <NumberlessMediumText style={styles.bottomText}>
            Last Used
          </NumberlessMediumText>
          <NumberlessMediumText style={styles.bottomText}>
            {getChatTileTimestamp(content.lastUsed)}
          </NumberlessMediumText>
        </View>
      )}
      {/* <GenericButton
                onPress={() => console.log('edit')}
                buttonStyle={styles.button}>
                Edit
            </GenericButton> */}
    </View>
  );
}

function CreateNewSuperport() {
  return (
    <View style={styles.createComponent}>
      <Create />
      <NumberlessMediumText style={styles.headertextNew}>
        Create Superport
      </NumberlessMediumText>
    </View>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: screen.width,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
  },
  LoaderScreen: {
    width: '100%',
    marginTop: 10,
    marginBottom: 40,
  },
  SuperportScreen: {
    width: screen.width,
  },
  superportTopBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PortColors.primary.white,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    paddingBottom: 10,
  },
  closeButton: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  BackButton: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: PortColors.primary.blue.app,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    width: '100%',
    color: 'white',
    textAlign: 'center',
  },
  title: {
    fontSize: 21,
    marginBottom: 20,
  },
  activeTitle: {
    marginTop: 10,
    marginBottom: 20,
    color: PortColors.primary.black,
    fontSize: 17,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    padding: 20,
  },
  mainBox: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 40,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  whiteArrow: {
    position: 'absolute',
    paddingRight: 30,
  },
  activeSuperportBox: {
    width: screen.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  component: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    height: 160,
    marginLeft: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 10,
  },
  createComponent: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    height: 160,
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
    marginHorizontal: 8,
    marginVertical: 8,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
  },
  headertext: {
    color: '#547CEF',
    fontSize: 13,
    width: 85,
    paddingLeft: 5,
    textAlign: 'center',
  },
  headertextNew: {
    color: '#547CEF',
    fontSize: 13,
    width: 85,
    textAlign: 'center',
    marginTop: 10,
  },
  bottomView: {
    flexDirection: 'row',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
  },
  bottomText: {
    color: '#547CEF',
    fontSize: 13,
  },
  scrollContainer: {
    marginBottom: 50,
  },
});

export default SuperportModal;
