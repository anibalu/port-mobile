import SuperPortIcon from '@assets/icons/ActiveGateways.svg';
import Create from '@assets/icons/Create.svg';
import PublishSuperportIcon from '@assets/icons/PublishSuperports.svg';
import WhiteArrowRight from '@assets/icons/WhiteArrowRight.svg';
import ChatBackground from '@components/ChatBackground';
import {GenericButton} from '@components/GenericButton';
import {getAllCreatedSuperports} from '@utils/Ports';
import {SuperportData} from '@utils/Ports/interfaces';
import {getReadableTimestamp} from '@utils/Time';
import React, {ReactNode, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useConnectionModal} from '../../context/ConnectionModalContext';
import {PortColors, screen} from '../ComponentUtils';
import GenericModal from '../GenericModal';
import {FontSizeType, FontType, NumberlessText} from '../NumberlessText';
import Notch from './Notch';

const SuperportModal: React.FC = () => {
  const {
    superportModalVisible: modalVisible,
    hideSuperportModal: hideModal,
    showSuperportCreateModal: showSuperportCreateModal,
    setConnectionSuperportId: setConnectionSuperportId,
    connectionSuperportId: connectionSuperportId,
  } = useConnectionModal();
  const [loadingSuperports, setLoadingSuperports] = useState<boolean>(true);
  const [data, setData] = useState<SuperportData[]>([]);

  const cleanupModal = () => {
    hideModal();
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
          const result = await getAllCreatedSuperports();
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
        <Notch />

        {loadingSuperports ? (
          <View style={styles.LoaderScreen}>
            <ActivityIndicator size={'large'} color={'#000000'} />
          </View>
        ) : (
          <>
            {data.length >= 1 ? (
              <ShowActiveSuperports
                data={data}
                openExistingSuperport={openExistingSuperport}
                createNewSuperport={createNewSuperport}
              />
            ) : (
              <ShowWelcomeScreen createNewSuperport={createNewSuperport} />
            )}
          </>
        )}
      </View>
    </GenericModal>
  );
};

function ShowWelcomeScreen({
  createNewSuperport,
}: {
  createNewSuperport: () => void;
}): ReactNode {
  return (
    <View style={styles.mainBox}>
      <NumberlessText
        fontSizeType={FontSizeType.xl}
        fontType={FontType.sb}
        textColor={PortColors.text.title}>
        Publish Superports
      </NumberlessText>
      <PublishSuperportIcon style={{marginTop: 20}} width={screen.width - 40} />
      <NumberlessText
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}
        style={{padding: 20, textAlign: 'center'}}
        textColor={PortColors.text.secondary}>
        Publish Superports to your social channels to funnel new conversations
        to Port, or use them to port over large groups , too.
      </NumberlessText>
      <GenericButton
        buttonStyle={{
          flexDirection: 'row',
          width: '80%',
          height: 60,
          marginBottom: 38,
        }}
        textStyle={{flex: 1, textAlign: 'center'}}
        iconStyleRight={{right: 20}}
        iconSizeRight={18}
        IconRight={WhiteArrowRight}
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
  data: SuperportData[];
  openExistingSuperport: (x: string) => void;
  createNewSuperport: () => void;
}): ReactNode {
  return (
    <View style={styles.activeSuperportBox}>
      <ChatBackground standard={false} />

      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          paddingHorizontal: 16,
          marginVertical: 13,
          justifyContent: 'flex-start',
        }}>
        <NumberlessText fontSizeType={FontSizeType.m} fontType={FontType.md}>
          Active Superports
        </NumberlessText>
      </View>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{rowGap: 10, columnGap: 10, paddingLeft: 10}}
        style={styles.scrollContainer}>
        {data.map(superport => {
          const id = superport.portId;
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

function ActiveSuperportComponent({content}: {content: SuperportData}) {
  return (
    <View style={styles.component}>
      <View style={styles.header}>
        <SuperPortIcon width={40} />
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{marginLeft: 8}}
          textColor={PortColors.text.title}>
          {content.label || 'unlabeled'}
        </NumberlessText>
      </View>
      <View style={styles.bottomView}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          textColor={PortColors.text.title}>
          Created
        </NumberlessText>

        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          textColor={PortColors.text.title}>
          {getReadableTimestamp(content.createdOnTimestamp)}
        </NumberlessText>
      </View>
      {content.usedOnTimestamp && content.usedOnTimestamp !== '' && (
        <View style={styles.bottomView}>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.md}
            textColor={PortColors.text.title}>
            Last Used
          </NumberlessText>

          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.md}
            textColor={PortColors.text.title}>
            {getReadableTimestamp(content.usedOnTimestamp)}
          </NumberlessText>
        </View>
      )}

      <View style={styles.bottomView}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          textColor={PortColors.text.title}>
          Remaining ports
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          textColor={PortColors.text.title}>
          {content.connectionsPossible ? content.connectionsPossible : '∞'}
        </NumberlessText>
      </View>

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
      <NumberlessText
        fontSizeType={FontSizeType.m}
        fontType={FontType.md}
        style={{marginTop: 15}}
        textColor={PortColors.text.title}>
        Create Superport
      </NumberlessText>
    </View>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexDirection: 'column',
    width: screen.width,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    paddingHorizontal: 30,
    paddingTop: 8,
  },
  LoaderScreen: {
    width: '100%',
    marginTop: 10,
    marginBottom: 40,
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
  mainBox: {
    paddingTop: 10,
    paddingBottom: 40,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  activeSuperportBox: {
    width: screen.width,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  component: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    height: 160,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  createComponent: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    height: 160,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    borderRadius: 8,
    minWidth: 144,
    backgroundColor: PortColors.primary.grey.light,
    marginHorizontal: 16,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  bottomView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 3,
    paddingHorizontal: 8,
  },
  scrollContainer: {
    marginBottom: 50,
  },
});

export default SuperportModal;
