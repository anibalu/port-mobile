import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AccordionWithRadio from './AccordionWithRadio';
import {Submitted} from './Submitted';
import DeviceInfo from 'react-native-device-info';
import {submitBugReport} from '@utils/BugReporting/bug_reports';
import {NumberlessRegularText} from '@components/NumberlessText';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';
import GenericModal from '@components/GenericModal';
import {SafeAreaView} from '@components/SafeAreaView';
import {GenericButton} from '@components/GenericButton';

type Props = NativeStackScreenProps<AppStackParamList, 'ReportIssueScreen'>;

export default function ReportIssueScreen({navigation, route}: Props) {
  const {category = 'Chatting', sections = [], Img} = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [isModalError, setisModalError] = useState(false);

  const [selected, setSelected] = useState({index: null, content: null});
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendBugReport = useCallback(
    async (
      category: string,
      subcategory: string,
      description: string,
      attached_files: string[],
    ) => {
      let deviceInfo = await DeviceInfo.getUserAgent();
      if (description.trim() === '') {
        setError('Description cannot be empty');
      } else if (subcategory === null) {
        setError('Subcategory cannot be empty');
      } else {
        await submitBugReport(
          category,
          subcategory,
          deviceInfo,
          attached_files[0] === '' ? [] : attached_files,
          description,
          setisModalError,
          setIsLoading,
        );
        setOpenModal(p => !p);
      }
    },
    [],
  );

  const loadingContent = useMemo(() => {
    return isLoading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text style={styles.buttonText}>Submit</Text>
    );
  }, [isLoading]);
  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <GenericTopBar
        title={'Report Issue'}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={{alignItems: 'center', flex: 1}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AccordionWithRadio
            category={category}
            sections={sections}
            selected={selected}
            setSelected={setSelected}
            setReviewText={setReviewText}
            reviewText={reviewText}
            image={image}
            setImage={setImage}
            Img={Img}
            setError={setError}
          />
          {error !== '' && (
            <NumberlessRegularText style={styles.error}>
              {error}
            </NumberlessRegularText>
          )}
        </View>

        <GenericButton
          onPress={() => {
            sendBugReport(category, selected.content, reviewText, [image]);
          }}
          buttonStyle={{
            height: 60,
            width: '90%',
            position: 'absolute',
            bottom: 15,
          }}>
          {loadingContent}
        </GenericButton>
      </ScrollView>

      <GenericModal
        visible={openModal}
        position="center"
        onClose={() => {
          setOpenModal(p => !p);
        }}>
        <Submitted setOpenModal={setOpenModal} isModalError={isModalError} />
      </GenericModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  container: {
    marginTop: 20,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#547CEF',
    borderRadius: 16,
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    width: '90%',
    height: 70,
  },
  error: {
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 17,
    color: 'white',
    textAlign: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#0000000D',
    opacity: 0.5,
    overflow: 'hidden',
  },
});
