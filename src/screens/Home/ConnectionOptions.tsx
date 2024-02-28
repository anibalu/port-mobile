import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortColors, screen} from '@components/ComponentUtils';
import NewContactIcon from '@assets/icons/NewContactBlack.svg';
import NewSuperportIcon from '@assets/icons/NewSuperportBlack.svg';
import NewGroupIcon from '@assets/icons/NewGroupBlack.svg';
import ScanIcon from '@assets/icons/ScanThinBlack.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import BlackAngleRight from '@assets/icons/BlackAngleRight.svg';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import {useNavigation} from '@react-navigation/native';

interface ConnectionOptionsProps {
  setIsConnectionOptionsModalOpen: (isShown: boolean) => void;
}

export default function ConnectionOptions(props: ConnectionOptionsProps) {
  const {setIsConnectionOptionsModalOpen} = props;
  const navigation = useNavigation();

  const {showNewPortModal, showSuperportModal} = useConnectionModal();
  const handleOptionClick = (showModal: () => void) => {
    setIsConnectionOptionsModalOpen(false);
    showModal();
  };

  const handleOpenNewGroup = () => {
    setIsConnectionOptionsModalOpen(false);
    navigation.navigate('GroupOnboarding');
  };

  const handleOpenScan = () => {
    setIsConnectionOptionsModalOpen(false);
    navigation.navigate('Scan');
  };

  return (
    <View style={styles.connectionOptionsRegion}>
      <View style={styles.mainContainer}>
        <Pressable
          style={styles.listItem}
          onPress={() => handleOptionClick(showNewPortModal)}>
          <NewContactIcon width={24} height={24} />
          <View style={styles.listContentWrapper}>
            <NumberlessText
              style={{color: PortColors.primary.black}}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              New Port
            </NumberlessText>
            <NumberlessText
              style={{color: PortColors.text.secondary}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              A one-time use QR/link to add a contact
            </NumberlessText>
          </View>
          <BlackAngleRight width={20} height={20} />
        </Pressable>
        <Pressable
          style={styles.listItem}
          onPress={() => handleOptionClick(showSuperportModal)}>
          <NewSuperportIcon width={24} height={24} />
          <View style={styles.listContentWrapper}>
            <NumberlessText
              style={{color: PortColors.primary.black}}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              New Superport
            </NumberlessText>
            <NumberlessText
              style={{color: PortColors.text.secondary}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              A multi-use QR/link to add contacts
            </NumberlessText>
          </View>
          <BlackAngleRight width={20} height={20} />
        </Pressable>
        <Pressable style={styles.listItem} onPress={handleOpenNewGroup}>
          <NewGroupIcon width={24} height={24} />
          <View style={styles.listContentWrapper}>
            <NumberlessText
              style={{color: PortColors.primary.black}}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              New Group
            </NumberlessText>
            <NumberlessText
              style={{color: PortColors.text.secondary}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              A private group with other Port users
            </NumberlessText>
          </View>
          <BlackAngleRight width={20} height={20} />
        </Pressable>
        <Pressable
          style={StyleSheet.compose(styles.listItem, {
            borderBottomWidth: 0,
          })}
          onPress={handleOpenScan}>
          <ScanIcon width={24} height={24} />
          <View style={styles.listContentWrapper}>
            <NumberlessText
              style={{color: PortColors.primary.black}}
              fontSizeType={FontSizeType.l}
              fontType={FontType.rg}>
              Scan QR
            </NumberlessText>
            <NumberlessText
              style={{color: PortColors.text.secondary}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Scan a QR to add a contact or join a group
            </NumberlessText>
          </View>
          <BlackAngleRight width={20} height={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  connectionOptionsRegion: {
    paddingHorizontal: 24,
    width: screen.width,
  },
  mainContainer: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: PortColors.primary.white,
    flexDirection: 'column',
    width: '100%',
    borderRadius: 16,
    borderColor: PortColors.primary.border.dullGrey,
    borderWidth: 0.5,
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderBottomColor: PortColors.primary.border.dullGrey,
    borderBottomWidth: 1,
  },
  listContentWrapper: {
    marginLeft: 16,
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
