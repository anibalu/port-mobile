/**
 * Default chat tile displayed when there are no connections
 */
import {PortColors} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_AVATAR} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet} from 'react-native';

function DefaultChatTile(): ReactNode {
  const navigation = useNavigation<any>();
  const handleNavigate = (): void => {
    navigation.navigate('HomeTab', {screen: 'NewTab'});
  };
  return (
    <Pressable style={styles.defaultTileContainer} onPress={handleNavigate}>
      <GenericAvatar
        onPress={handleNavigate}
        profileUri={DEFAULT_AVATAR}
        avatarSize={'small'}
      />
      <NumberlessText
        fontType={FontType.rg}
        fontSizeType={FontSizeType.l}
        textColor={PortColors.text.labels}
        style={{fontStyle: 'italic', fontWeight: '400'}}>
        Click here to add a new contact
      </NumberlessText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    flex: 1,
    marginTop: 7,
    borderRadius: 14,
    backgroundColor: PortColors.primary.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 15,
  },
});

export default DefaultChatTile;
