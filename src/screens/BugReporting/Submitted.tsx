import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Close from '../../../assets/icons/cross.svg';
import {useNavigation} from '@react-navigation/native';

export const Submitted = ({
  setOpenModal,
  isModalError,
}: {
  setOpenModal: any;
  isModalError: boolean;
}) => {
  const navigation = useNavigation();
  const closeModal = useCallback(() => {
    setOpenModal(p => !p);
    navigation.navigate('MyProfile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <View style={styles.editRegion}>
        <Close style={styles.crossIcon} onPress={closeModal} />
        {isModalError ? (
          <Text style={styles.titleError}>Something went wrong</Text>
        ) : (
          <Text style={styles.title}>Submitted Successfully</Text>
        )}
        <Text style={styles.subtitle}>
          {isModalError
            ? 'Please try again after a while'
            : 'Your suggestion has been recorded and will be looked into shortly.'}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  editRegion: {
    width: '90%',
    backgroundColor: 'white',
    paddingBottom: 20,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 15,
  },
  crossIcon: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#5F5F5F',
    textAlign: 'center',
    marginBottom: 20,
  },
  titleError: {
    color: 'red',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
});
