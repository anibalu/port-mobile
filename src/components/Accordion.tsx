import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import PendingContactsIcon from '../../assets/icons/PendingContacts.svg';
import BlueArrowUpIcon from '../../assets/icons/BlueArrowUp.svg';
import GreyArrowDownIcon from '../../assets/icons/GreyArrowDown.svg';

const Accordion = ({title, children, dataLength}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleAccordion = () => {
    setExpanded(!expanded);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleAccordion}>
        <View style={styles.mainContainer}>
          <View style={styles.accordion}>
            <PendingContactsIcon style={styles.imageStyle} />
            <View style={styles.titleStyles}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.dataLength}>{dataLength}</Text>
            </View>
          </View>

          {expanded ? (
            <BlueArrowUpIcon style={styles.iconStyles} />
          ) : (
            <GreyArrowDownIcon style={styles.iconStyles} />
          )}
        </View>
      </TouchableOpacity>
      {expanded && <View>{children}</View>}
    </View>
  );
};

export default Accordion;

const styles = StyleSheet.create({
  mainContainer: {flexDirection: 'row', width: '100%'},
  accordion: {flexDirection: 'row'},
  imageStyle: {
    width: 70,
    height: 70,
  },
  titleStyles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  title: {
    fontWeight: '500',
    fontSize: 17,
    color: 'black',
    marginLeft: 20,
    justifyContent: 'center',
    alignContent: 'center',
    verticalAlign: 'middle',
  },
  dataLength: {
    fontWeight: '500',
    fontSize: 14,
    color: '#B8B8B8',
    marginLeft: 20,
    justifyContent: 'center',
    alignContent: 'center',
    verticalAlign: 'middle',
  },

  iconStyles: {
    alignSelf: 'center',
    marginRight: 5,
  },
});
