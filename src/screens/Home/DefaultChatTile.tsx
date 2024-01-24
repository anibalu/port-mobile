/**
 * Default chat tile displayed when there are no connections
 */
import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import BluePlus from '../../../assets/icons/Blueplus.svg';

function DefaultChatTile(): ReactNode {
  const {showNewPortModal: showModal} = useConnectionModal();
  const handleNavigate = (): void => {
    showModal();
  };
  return (
    <Pressable style={styles.defaultTileContainer} onPress={handleNavigate}>
      <BluePlus />
      <NumberlessText
        fontType={FontType.rg}
        fontSizeType={FontSizeType.l}
        textColor={PortColors.text.labels}
        style={{fontStyle: 'italic', fontWeight: '400', marginLeft: 17}}>
        Add new contact
      </NumberlessText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: PortColors.primary.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
});

export default DefaultChatTile;
