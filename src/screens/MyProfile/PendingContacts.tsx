import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import Accordion from '@components/Accordion';
import Link from '@assets/icons/link.svg';
import QRCode from '@assets/icons/qrcode.svg';
import {getTimeAndDateStamp} from '@utils/Time';
import {
  deleteGeneratedDirectConnectionBundle,
  getGeneratedDirectConnectionBundles,
} from '@utils/Bundles/direct';
import CrossIcon from '@assets/icons/cross.svg';
import {GeneratedDirectConnectionBundle} from '@utils/Bundles/interfaces';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import GenericModal from '@components/Modals/GenericModal';
import {screen} from '@components/ComponentUtils';

export default function PendingContacts() {
  const [data, setData] = useState<Array<GeneratedDirectConnectionBundle>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObject, setSelectedObject] = useState<any>({});
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
                  <NumberlessText
                    fontType={FontType.md}
                    fontSizeType={FontSizeType.s}
                    style={styles.itemLabel}>
                    {item?.label ? item?.label : 'unlabeled'}
                  </NumberlessText>
                  <NumberlessText
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.s}
                    style={styles.itemTime}>
                    Created
                  </NumberlessText>
                  <NumberlessText
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.s}
                    style={styles.itemTime}>
                    {getTimeAndDateStamp(item?.timestamp)}
                  </NumberlessText>
                </View>
              </Pressable>
            )}
          />
        ) : (
          <NumberlessText
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}
            style={styles.noContacts}>
            No Pending Contacts
          </NumberlessText>
        )}
      </Accordion>
      <GenericModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(p => !p);
        }}>
        <View style={styles.modal}>
          <View style={{flexDirection: 'row'}}>
            {selectedObject.type === 'link' ? (
              <Link style={styles.iconStyles} />
            ) : (
              <QRCode style={styles.iconStyles} />
            )}
            <View style={styles.modalStyles}>
              <NumberlessText
                fontType={FontType.sb}
                fontSizeType={FontSizeType.m}
                style={styles.modalLabel}>
                {selectedObject.label ? selectedObject.label : 'unlabled'}
              </NumberlessText>
              <NumberlessText
                fontType={FontType.md}
                fontSizeType={FontSizeType.m}
                style={styles.modalTime}>
                Created
              </NumberlessText>
              <NumberlessText
                fontType={FontType.md}
                fontSizeType={FontSizeType.m}
                style={styles.modalTime}>
                {getTimeAndDateStamp(selectedObject.timestamp)}
              </NumberlessText>
            </View>
            <CrossIcon onPress={() => setModalVisible(false)} />
          </View>
          <Pressable style={styles.button} onPress={deleteBundle}>
            <NumberlessText
              fontType={FontType.sb}
              fontSizeType={FontSizeType.l}
              style={styles.buttonText}>
              Delete
            </NumberlessText>
          </Pressable>
        </View>
      </GenericModal>
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
    marginLeft: 10,
  },
  item: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 30,
    marginRight: 10,
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F6F6F6',
    marginTop: 10,
  },
  itemLabel: {
    color: 'black',
  },
  itemTime: {
    fontWeight: '400',
    color: '#B7B7B7',
  },
  popUpArea: {
    width: '100%',
    height: '100%',
  },
  popupPosition: {
    position: 'absolute',
    bottom: 0,
  },
  modal: {
    width: screen.width,
    paddingHorizontal: 35,
    paddingVertical: 30,
    backgroundColor: 'white',
  },
  modalLabel: {
    color: 'black',
  },
  modalTime: {
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
  noContacts: {
    marginTop: 10,
  },
});
