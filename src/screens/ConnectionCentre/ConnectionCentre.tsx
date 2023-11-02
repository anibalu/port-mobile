/**
 * Connections centre screen to choose from ports, groups, superports, etc.
 * screen Id: 7
 */
import React, {useState} from 'react';
import {SafeAreaView} from '../../components/SafeAreaView';
import {StatusBar, FlatList, StyleSheet, ImageBackground} from 'react-native';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import NewPortCard from './NewPortCard';
import NewGroupCard from './NewGroupCard';
import NewSuperPortCard from './NewSuperPortCard';

export type instrument = {
  id: string;
};

const options: instrument[] = [
  {
    id: 'port',
  },
  {
    id: 'group',
  },
  {
    id: 'superport',
  },
];

function ConnectionCentre() {
  const [selectedInstrument, setSelectedInstrument] = useState<instrument>({
    id: 'port',
  });
  const renderInstruments = ({item}: {item: instrument}) => {
    switch (item.id) {
      case 'port':
        return (
          <NewPortCard
            isClicked={selectedInstrument.id === item.id}
            setSelected={setSelectedInstrument}
          />
        );
      case 'group':
        return (
          <NewGroupCard
            isClicked={selectedInstrument.id === item.id}
            setSelected={setSelectedInstrument}
          />
        );
      case 'superport':
        return (
          <NewSuperPortCard
            isClicked={selectedInstrument.id === item.id}
            setSelected={setSelectedInstrument}
          />
        );
    }
  };
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEE" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <FlatList
        data={options}
        renderItem={renderInstruments}
        keyExtractor={item => item.id}
        extraData={selectedInstrument}
        style={styles.options}
      />
      <BottomNavigator active={Page.connectionCentre} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
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
  options: {
    paddingLeft: '3%',
    paddingRight: '3%',
  },
});

export default ConnectionCentre;
