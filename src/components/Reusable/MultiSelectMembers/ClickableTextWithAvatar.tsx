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
import {AvatarBox} from '../AvatarBox/AvatarBox';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

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

  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CloseIcon = results.CloseIcon;
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
              backgroundColor: Colors.primary.surface,
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
                textColor={Colors.text.primary}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  maxWidth: 130,
                  paddingHorizontal: PortSpacing.tertiary.uniform,
                }}>
                {member.name}
              </NumberlessText>
              <CloseIcon />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

export default ClickableTextWithAvatar;
