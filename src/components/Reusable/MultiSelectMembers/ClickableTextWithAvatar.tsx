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

import React, {useMemo, useState} from 'react';
import {Pressable, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {AvatarBox} from '../AvatarBox/AvatarBox';

const ClickableTextWithAvatar = ({
  selectedMembers,
  setSelectedMembers,
  setSelectAll,
  showBackgroundColor = true,
}: {
  selectedMembers: ConnectionInfo[];
  setSelectAll: (p: any) => void;
  setSelectedMembers: (member: any) => void;
  showBackgroundColor: boolean;
}) => {
  const [showAll, setShowAll] = useState(false);

  const onUnselect = (chatId: string) => {
    const newSelectedMmbers = selectedMembers.filter(
      member => member.chatId !== chatId,
    );
    setSelectedMembers(newSelectedMmbers);
    if (newSelectedMmbers.length <= 7) {
      setShowAll(false);
    }
    setSelectAll(false);
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

  const visibleMembers = useMemo(
    () => (showAll ? selectedMembers : selectedMembers.slice(0, 7)),
    [selectedMembers, showAll],
  );
  const remainingCount = useMemo(
    () => selectedMembers.length - visibleMembers.length,
    [selectedMembers.length, visibleMembers.length],
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: PortSpacing.tertiary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
        paddingVertical: PortSpacing.tertiary.uniform,
        backgroundColor: showBackgroundColor
          ? Colors.primary.surface
          : 'transparent',      }}>
      {visibleMembers.map(member => (
        <View
          key={member.chatId}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: showBackgroundColor
              ? 'transparent'
              : Colors.primary.surface,
            borderColor: Colors.primary.stroke,
            borderWidth: 0.5,
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
              textColor={Colors.text.subtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                maxWidth: 130,
                paddingHorizontal: PortSpacing.tertiary.uniform,
              }}>
              {member.name}
            </NumberlessText>
            <CloseIcon width={16} height={16} />
          </Pressable>
        </View>
      ))}

      {remainingCount > 0 && !showAll && (
        <Pressable
          style={{
            justifyContent: 'center',
            borderRadius: PortSpacing.tertiary.uniform,
            height: 36,
          }}
          onPress={() => setShowAll(true)}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            textColor={Colors.text.memberName}>
            +{remainingCount} more
          </NumberlessText>
        </Pressable>
      )}

      {showAll && (
        <Pressable
          style={{
            justifyContent: 'center',
            borderRadius: PortSpacing.tertiary.uniform,
            height: 36,
          }}
          onPress={() => setShowAll(false)}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            textColor={Colors.text.memberName}>
            Show less
          </NumberlessText>
        </Pressable>
      )}
    </View>
  );
};

export default ClickableTextWithAvatar;
