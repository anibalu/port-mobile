import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  Text,
  StatusBar,
  ImageBackground,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import Topbar from '../MediaView/Topbar';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import Screenshot from '../../../assets/icons/Screenshot.svg';
import {Submitted} from './Submitted';

export default function SuggestAFeature() {
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
      <Topbar title={'Suggest a feature'} />
      <StatusBar barStyle="dark-content" backgroundColor="#EEE" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <View style={styles.container}>
        <Text style={styles.titleStyles}> Suggest a feature</Text>
        <TextInput
          textAlign="left"
          textAlignVertical="top"
          style={styles.input}
          placeholder="Enter issue here"
          onChangeText={value => setReviewText(value)}
          value={reviewText}
        />
        <View style={styles.screenshot}>
          {image ? (
            <>
              <Text onPress={openImageGallery} style={styles.screenshotText}>
                Attached Screenshot. Click to change
              </Text>
              <Image style={styles.selectedImage} source={{uri: image}} />
            </>
          ) : (
            <>
              <Text style={styles.screenshotText}>
                Do you wish to attach a screenshot?
              </Text>
              <Screenshot onPress={openImageGallery} />
            </>
          )}
        </View>
      </View>
      <Pressable style={styles.button} onPress={() => setOpenModal(p => !p)}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
      <Modal animationType="none" visible={openModal} transparent={true}>
        <Pressable
          style={styles.popUpArea}
          onPress={() => setOpenModal(p => !p)}>
          <Pressable style={styles.popupPosition}>
            <Submitted setOpenModal={setOpenModal} openModal={openModal} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
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
    paddingRight: 10,
  },
  selectedImage: {
    height: 70,
    width: 70,
  },
  screenshotText: {
    width: '90%',
    alignSelf: 'center',
    fontWeight: '400',
    fontSize: 14,
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
    backgroundColor: '#0005',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupPosition: {},
});
