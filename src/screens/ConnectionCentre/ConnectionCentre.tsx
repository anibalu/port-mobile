/**
 * Connections centre screen to choose from ports, groups, superports, etc.
 * screen Id: 7
 */
import ChatBackground from '@components/ChatBackground';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import NewGroupCard from './NewGroupCard';
import NewPortCard from './NewPortCard';
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
      <ChatBackground />
      <FlatList
        data={options}
        renderItem={renderInstruments}
        keyExtractor={item => item.id}
        extraData={selectedInstrument}
        style={styles.options}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
  },
  options: {
    paddingLeft: '3%',
    paddingRight: '3%',
  },
});

export default ConnectionCentre;
