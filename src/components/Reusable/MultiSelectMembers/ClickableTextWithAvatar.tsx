// @sumaanta
/**
 * A clickable text with an avatar will be used in Port to display selected members
 * Possible states:
 * 1. clickable
 * 2. profileUri
 * 3. cross icon to remove the text from selected list
 *
 * The text takes the following props:
 * 1. memberName - name of the selected member
 * 2. onCrossClick - function that handles onClick of cross icon
 * 3. profileUri - will be using generic avatar here(will have a default avatar)
 */

import {ConnectionInfo} from '@utils/Connections/interfaces';
import React from 'react';
import {Pressable, View} from 'react-native';
import Cross from '@assets/icons/greyCross.svg';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

const ClickableTextWithAvatar = ({
  selectedMembers,
  setSelectedMembers,
}: {
  selectedMembers: ConnectionInfo[];
  setSelectedMembers: (member: any) => void;
}) => {
  const onUnselect = (chatId: string) => {
    setSelectedMembers(
      selectedMembers.filter(member => member.chatId !== chatId),
    );
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: PortSpacing.tertiary.uniform,
        marginTop: PortSpacing.tertiary.top,
      }}>
      {selectedMembers.map(member => {
        return (
          <View
            key={member.chatId}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: PortSpacing.tertiary.uniform,
              maxWidth: 180,
              height: 36,
              justifyContent: 'flex-start',
            }}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                maxWidth: 180,
                paddingHorizontal: 4,
                justifyContent: 'flex-start',
              }}
              onPress={() => onUnselect(member.chatId)}>
              <AvatarBox avatarSize="es" profileUri={member.pathToDisplayPic} />
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={PortColors.primary.black}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  maxWidth: 130,
                  paddingHorizontal: PortSpacing.tertiary.uniform,
                }}>
                {member.name}
              </NumberlessText>
              <Cross />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

export default ClickableTextWithAvatar;
