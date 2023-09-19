import React, {useState} from 'react';
import {SafeAreaView} from '../../components/SafeAreaView';
import {StatusBar, FlatList, StyleSheet, ImageBackground} from 'react-native';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import NewContactCard from './NewContactCard';
import NewGroupCard from './NewGroupCard';
import NewGatewayCard from './NewGatewayCard';
export type instrument = {
  id: string;
};

const options: instrument[] = [
  {
    id: 'contact',
  },
  {
    id: 'group',
  },
  {
    id: 'gateway',
  },
];

function ConnectionCentre() {
  const [selectedInstrument, setSelectedInstrument] = useState<instrument>({
    id: 'contact',
  });
  const renderInstruments = ({item}: {item: instrument}) => {
    switch (item.id) {
      case 'contact':
        return (
          <NewContactCard
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
      case 'gateway':
        return (
          <NewGatewayCard
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
