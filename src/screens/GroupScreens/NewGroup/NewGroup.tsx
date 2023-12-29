import Avatar4 from '@assets/avatars/avatar4.svg';
import ChatBackground from '@components/ChatBackground';
import {FontSizes, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';

type Props = NativeStackScreenProps<AppStackParamList, 'NewGroup'>;

// creation of a new group
const NewGroup = ({route, navigation}: Props) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const image = '';
  //const [image, setImage] = useState('');
  const [isButtonActive, setIsButtonActive] = useState(false);
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

  // const onImagePressed = async () => {
  //   try {
  //     const response = await launchImageLibrary({
  //       mediaType: 'photo',
  //       includeBase64: false,
  //     });
  //     //images are selected
  //     const selected: Asset[] = response.assets || [];
  //     setImage(selected[0].uri);
  //   } catch (error) {
  //     console.log('Nothing selected', error);
  //   }
  // };

  return (
    <SafeAreaView style={style.mainContainer}>
      <ChatBackground />
      <GenericTopBar
        title={'New Group'}
        titleStyle={{...FontSizes[17].bold}}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <ScrollView automaticallyAdjustKeyboardInsets={true} style={{flex: 1}}>
        <View style={style.groupContainer}>
          <View style={style.iconContainer}>
            {image ? (
              <>
                <Image
                  source={{uri: image}}
                  style={{width: 140, height: 140}}
                />
              </>
            ) : (
              <Avatar4 width={140} height={140} />
            )}
            {/* <ImageIcon style={style.uploadImageICon} onPress={onImagePressed} /> */}
          </View>
          <GenericInput
            inputStyle={{marginHorizontal: 14, paddingLeft: 20, height: 61}}
            text={groupName}
            setText={onChangeGroupName}
            placeholder="Group Name"
            alignment="left"
          />

          <GenericInput
            inputStyle={style.descriptionBoxStyle}
            maxLength={200}
            multiline={true}
            text={groupDescription}
            setText={onChangeGroupDescription}
            placeholder="Add a description (optional)"
            alignment="left"
            showLimit={true}
          />
          {!!errorMessage && (
            <Text style={style.errorMessage}>{errorMessage}</Text>
          )}
          <GenericButton
            buttonStyle={
              isButtonActive ? style.activeButton : style.inactiveButton
            }
            onPress={() => {
              isButtonActive
                ? navigation.navigate('SetupGroup', {
                    groupName: groupName.trim(),
                    groupDescription: groupDescription.trim(),
                    displayPicPath: image,
                  })
                : null;
            }}>
            Next
          </GenericButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  groupContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 30,
    marginVertical: 40,
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
  descriptionBoxStyle: {
    marginHorizontal: 14,
    marginTop: 23,
    paddingLeft: 20,
    paddingTop: 10,
    textAlignVertical: 'top',
    height: screen.height / 4,
    maxHeight: screen.height / 4,
  },
  uploadImageICon: {
    marginTop: -20,
    marginRight: 5,
    alignSelf: 'flex-end',
  },
  activeButton: {
    backgroundColor: '#547CEF',
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    marginHorizontal: 10,
    marginTop: 40,
    alignSelf: 'center',
    width: '95%',
    marginBottom: 20,
  },
  inactiveButton: {
    backgroundColor: '#868686',
    height: 70,
    marginTop: 40,
    borderRadius: 16,
    justifyContent: 'center',
    marginHorizontal: 10,
    alignSelf: 'center',
    width: '95%',
    marginBottom: 20,
  },
});
export default NewGroup;
