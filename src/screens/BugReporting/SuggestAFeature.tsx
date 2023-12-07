import Screenshot from '@assets/icons/Screenshot.svg';
import ChatBackground from '@components/ChatBackground';
import {FontSizes, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import GenericModal from '@components/GenericModal';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {Submitted} from './Submitted';
import {NumberlessRegularText} from '@components/NumberlessText';

type Props = NativeStackScreenProps<AppStackParamList, 'SuggestAFeature'>;

export default function SuggestAFeature({navigation}: Props) {
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const openImageGallery = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
      });
      //images are selected
      const selected: Asset[] = response.assets || [];
      setImage(selected[0].uri);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <GenericTopBar
        title={'Suggest a feature'}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.container}>
        <Text style={styles.titleStyles}> Suggest a feature</Text>
        <GenericInput
          wrapperStyle={{
            height: screen.height / 4,
            marginBottom: 20,
            marginTop: 20,
          }}
          inputStyle={{
            ...FontSizes[15].regular,
            paddingLeft: 15,
            paddingTop: 10,
            textAlignVertical: 'top',
            borderRadius: 12,
          }}
          maxLength={350}
          multiline={true}
          text={reviewText}
          setText={value => {
            setReviewText(value);
          }}
          placeholder="Enter issue here"
          alignment="left"
          showLimit={true}
        />
        <View style={styles.screenshot}>
          {image ? (
            <>
              <NumberlessRegularText style={styles.screenshotText}>
                Attached Screenshot.{' '}
                <NumberlessRegularText
                  style={[
                    styles.screenshotText,
                    {textDecorationLine: 'underline'},
                  ]}
                  onPress={openImageGallery}>
                  Click to change
                </NumberlessRegularText>
              </NumberlessRegularText>
              <Image style={styles.selectedImage} source={{uri: image}} />
            </>
          ) : (
            <>
              <NumberlessRegularText style={styles.screenshotText}>
                Do you wish to attach a screenshot?
              </NumberlessRegularText>
              <Screenshot style={{top: -7}} onPress={openImageGallery} />
            </>
          )}
        </View>
      </View>
      <GenericButton
        onPress={() => {
          setOpenModal(p => !p);
        }}
        buttonStyle={{
          height: 70,
          width: '90%',
          position: 'absolute',
          bottom: 15,
        }}>
        Submit
      </GenericButton>

      <GenericModal
        visible={openModal}
        position="center"
        onClose={() => {
          setOpenModal(p => !p);
        }}>
        <Submitted setOpenModal={setOpenModal} openModal={openModal} />
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
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    height: 300,
    padding: 15,
  },
  titleStyles: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
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
  screenshot: {
    flexDirection: 'row',
    paddingLeft: 20,
    marginTop: 20,
    paddingRight: 10,
  },
  selectedImage: {
    height: 70,
    width: 70,
    marginLeft: '-10%',
    borderRadius: 10,
    marginBottom: 10,
  },
  screenshotText: {
    width: '90%',
    ...FontSizes[12].regular,
    alignSelf: 'center',
    marginBottom: 15,
    color: '#868686',
  },
  input: {
    width: '100%',
    height: 150,
    alignSelf: 'center',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
    borderRadius: 16,
    paddingLeft: 15,
    marginTop: 20,
  },
  popUpArea: {
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupPosition: {},
});
