import React, {useCallback, useState} from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Avatar4 from '../../../../assets/avatars/avatar4.svg';
import ImageIcon from '../../../../assets/icons/UploadImage.svg';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import Topbar from './TopBar';
import {useNavigation} from '@react-navigation/native';

// creation of a new group
const NewGroup = ({route}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [image, setImage] = useState('');
  const [isButtonActive, setIsButtonActive] = useState(false);
  const navigation = useNavigation();
  const {errorMessage = ''} = route.params || {};

  const onChangeGroupName = useCallback((newText: string) => {
    setGroupName(newText);
    if (newText.trim()) {
      setIsButtonActive(true);
    } else {
      setIsButtonActive(false);
    }
  }, []);

  const onChangeGroupDescription = useCallback((newText: string) => {
    setGroupDescription(newText);
  }, []);

  const onImagePressed = async () => {
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
    <SafeAreaView style={style.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ImageBackground
        source={require('../../../../assets/backgrounds/puzzle.png')}
        style={style.background}
      />
      <Topbar title={'New Group'} />
      <View style={style.groupContainer}>
        <View style={style.iconContainer}>
          {image ? (
            <>
              <Image source={{uri: image}} style={{width: 140, height: 140}} />
            </>
          ) : (
            <Avatar4 width={140} height={140} />
          )}
          <ImageIcon style={style.uploadImageICon} onPress={onImagePressed} />
        </View>
        <TextInput
          style={style.groupNameBox}
          placeholder="Group Name"
          placeholderTextColor="#868686"
          value={groupName}
          onChangeText={onChangeGroupName}
        />
        <TextInput
          style={style.groupBoxDescription}
          placeholder="Add a description (optional)"
          placeholderTextColor="#868686"
          value={groupDescription}
          multiline={true}
          onChangeText={onChangeGroupDescription}
        />
      </View>
      {!!errorMessage && <Text style={style.errorMessage}>{errorMessage}</Text>}

      <Pressable
        disabled={!isButtonActive}
        style={isButtonActive ? style.activeButton : style.inctiveButton}
        onPress={() =>
          navigation.navigate('SetupGroup', {
            groupName: groupName.trim(),
            groupDescription: groupDescription.trim(),
            image,
          })
        }>
        <Text style={style.buttonText}> Next</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  mainContainer: {
    height: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  groupContainer: {
    marginHorizontal: 30,
    marginVertical: 40,
    backgroundColor: 'white',
    borderRadius: 24,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 15,
    color: 'red',
  },
  iconContainer: {
    marginTop: 30,
    alignSelf: 'center',
    marginBottom: 30,
  },
  uploadImageICon: {
    marginTop: -20,
    marginRight: 5,
    alignSelf: 'flex-end',
  },
  groupNameBox: {
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '90%',
    alignSelf: 'center',
    color: '#000000',
  },
  groupBoxDescription: {
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 20,
    marginBottom: 20,
    textAlignVertical: 'top',
    width: '90%',
    alignSelf: 'center',
    color: '#000000',
  },
  activeButton: {
    backgroundColor: '#547CEF',
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    marginHorizontal: 10,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 15,
    width: '95%',
  },
  inctiveButton: {
    backgroundColor: '#868686',
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    marginHorizontal: 10,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 15,
    width: '95%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
    overflow: 'hidden',
  },
});
export default NewGroup;
