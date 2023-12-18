import GreyArrowRight from '@assets/icons/GreyArrowRight.svg';

import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from '@components/SafeAreaView';
import {FontSizes} from '@components/ComponentUtils';
import {NumberlessRegularText} from '@components/NumberlessText';
import {categories} from '@configs/bugCategories';

type Props = NativeStackScreenProps<AppStackParamList, 'AddCategoryScreen'>;

export default function AddCategoryScreen({navigation}: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <GenericTopBar
        titleStyle={{...FontSizes[17].medium}}
        title={'Add Category '}
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <View style={styles.container}>
        {categories.map(category => {
          const {value, Img, subCategory} = category;
          return (
            <Pressable
              style={styles.category}
              onPress={() =>
                navigation.navigate('ReportIssueScreen', {
                  category: value,
                  sections: subCategory,
                  Img: Img,
                })
              }
              key={category.index}>
              <Img style={{marginLeft: 10}} />
              <NumberlessRegularText style={styles.categoryText}>
                {value}
              </NumberlessRegularText>
              <GreyArrowRight />
            </Pressable>
          );
        })}
      </View>
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
    marginTop: 10,
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
  category: {
    width: '70%',
    height: 70,
    borderRadius: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 15,
  },
  categoryText: {
    color: 'black',
    width: '100%',
    paddingLeft: 10,
  },
});
