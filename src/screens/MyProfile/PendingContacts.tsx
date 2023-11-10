import React, {useEffect, useState} from 'react';
import {FlatList, Modal, Pressable, StyleSheet, View} from 'react-native';
import Accordion from '../../components/Accordion';
import Link from '../../../assets/icons/link.svg';
import QRCode from '../../../assets/icons/qrcode.svg';
import {getTimeAndDateStamp} from '../../utils/Time';
import {
  deleteGeneratedDirectConnectionBundle,
  getGeneratedDirectConnectionBundles,
} from '../../utils/Bundles/direct';
import CrossIcon from '../../../assets/icons/cross.svg';
import {GeneratedDirectConnectionBundle} from '../../utils/Bundles/interfaces';
import {
  NumberlessBoldText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../components/NumberlessText';

export default function PendingContacts() {
  const [data, setData] = useState<Array<GeneratedDirectConnectionBundle>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObject, setSelectedObject] = useState({});
  const [updateCount, setUpdateCount] = useState<number>(0);
  useEffect(() => {
    const fetchData = async () => {
      const result = await getGeneratedDirectConnectionBundles();
      setData(result);
    };
    fetchData();
  }, [updateCount]);

  const deleteBundle = async () => {
    if (selectedObject.data.linkId) {
      await deleteGeneratedDirectConnectionBundle(selectedObject.data.linkId);
      setUpdateCount(updateCount + 1);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* add images at some point to be sent from parent component */}
      <Accordion title="Pending Contacts" dataLength={data.length}>
        {data.length > 0 ? (
          <FlatList
            data={data}
            horizontal={true}
            renderItem={({item}) => (
              <Pressable
                style={styles.item}
                onPress={() => {
                  setModalVisible(true);
                  setSelectedObject(item);
                }}>
                {item?.type === 'link' ? <Link /> : <QRCode />}
                <View style={styles.columnStyles}>
                  <NumberlessMediumText style={styles.itemLabel}>
                    {item?.label ? item?.label : 'unlabeled'}
                  </NumberlessMediumText>
                  <NumberlessRegularText style={styles.itemTime}>
                    Created
                  </NumberlessRegularText>
                  <NumberlessRegularText style={styles.itemTime}>
                    {getTimeAndDateStamp(item?.timestamp)}
                  </NumberlessRegularText>
                </View>
              </Pressable>
            )}
          />
        ) : (
          <NumberlessRegularText>No Pending Contacts</NumberlessRegularText>
        )}
      </Accordion>
      <Modal animationType="none" visible={modalVisible} transparent={true}>
        <Pressable
          style={styles.popUpArea}
          onPress={() => setModalVisible(false)}>
          <Pressable style={styles.popupPosition}>
            <View style={styles.modal}>
              <View style={{flexDirection: 'row'}}>
                {selectedObject.type === 'link' ? (
                  <Link style={styles.iconStyles} />
                ) : (
                  <QRCode style={styles.iconStyles} />
                )}
                <View style={styles.modalStyles}>
                  <NumberlessBoldText style={styles.modalLabel}>
                    {selectedObject.label ? selectedObject.label : 'unlabled'}
                  </NumberlessBoldText>
                  <NumberlessMediumText style={styles.modalTime}>
                    Created
                  </NumberlessMediumText>
                  <NumberlessMediumText style={styles.modalTime}>
                    {getTimeAndDateStamp(selectedObject.timestamp)}
                  </NumberlessMediumText>
                </View>
                <CrossIcon onPress={() => setModalVisible(false)} />
              </View>
              <Pressable style={styles.button} onPress={deleteBundle}>
                <NumberlessBoldText style={styles.buttonText}>
                  Delete
                </NumberlessBoldText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 10,
    marginTop: 20,
    maxHeight: 150,
  },
  columnStyles: {
    marginLeft: 5,
  },
  item: {
    paddingHorizontal: 20,
    marginRight: 10,
    height: 65,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F6F6F6',
    marginTop: 10,
  },
  itemLabel: {
    fontWeight: '500',
    fontSize: 12,
    color: 'black',
  },
  itemTime: {
    fontWeight: '400',
    fontSize: 12,
    color: '#B7B7B7',
  },
  popUpArea: {
    backgroundColor: '#0005',
    width: '100%',
    height: '100%',
  },
  popupPosition: {
    position: 'absolute',
    bottom: 0,
  },
  modal: {
    width: '100%',
    paddingHorizontal: 35,
    paddingVertical: 30,
    backgroundColor: 'white',
  },
  modalLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: 'black',
  },
  modalTime: {
    fontWeight: '500',
    fontSize: 14,
    color: '#B7B7B7',
  },
  modalStyles: {
    marginLeft: 15,
    width: '75%',
  },
  iconStyles: {
    width: 100,
    height: 100,
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: '#EE786B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  pendingStyles: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    marginTop: 15,
    marginLeft: 10,
  },
});
