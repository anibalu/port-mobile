import {BasicGroupInfo} from '@utils/Storage/DBCalls/group';
import {getGroupsWithContact} from '@utils/Storage/group';
import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {FlatList} from 'react-native';
import DynamicColors from './DynamicColors';
import {AvatarBox} from './Reusable/AvatarBox/AvatarBox';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {PortSpacing} from './ComponentUtils';
import {useNavigation} from '@react-navigation/native';
import {getChatIdFromRoutingId} from '@utils/Storage/connections';

export function CommonGroups({pairHash}: {pairHash: string}): ReactNode {
  const [groupsInCommon, setGroupsInCommon] = useState<BasicGroupInfo[]>([]);
  useEffect(() => {
    (async () => setGroupsInCommon(await getGroupsWithContact(pairHash)))();
  }, [pairHash]);
  const Colors = DynamicColors();
  if (groupsInCommon.length) {
    return (
      <View
        style={{
          marginTop: 16,
          borderRadius: 16,
          backgroundColor: Colors.primary.surface,
          padding: 8,
          gap: 16,
          maxHeight: 250,
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}
            style={{
              color: Colors.labels.text,
            }}>
            Groups in common
          </NumberlessText>
          <NumberlessText
            style={{
              color: Colors.labels.text,
              paddingRight: 4,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            {groupsInCommon.length}
          </NumberlessText>
        </View>
        <FlatList
          data={groupsInCommon}
          keyExtractor={group => group.groupId}
          renderItem={groupInfo => {
            return (
              <BasicGroupCard
                itemToRender={groupInfo}
                listLength={groupsInCommon.length}
              />
            );
          }}
        />
      </View>
    );
  }
  return <></>;
}

function BasicGroupCard({itemToRender, listLength}: any): ReactNode {
  const groupInfo = itemToRender.item as BasicGroupInfo;
  const lastItem: boolean = listLength === itemToRender.index + 1;
  const Colors = DynamicColors();
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={async () => {
        const chatId = await getChatIdFromRoutingId(groupInfo.groupId);
        if (!chatId) {
          return;
        }
        navigation.navigate('GroupChat', {
          chatId,
          isConnected: !groupInfo.disconnected,
          profileUri: groupInfo.groupPictureURI || DEFAULT_AVATAR,
          name: groupInfo.name,
        });
      }}
      style={{
        backgroundColor: Colors.primary.surface,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 1,
        borderBottomColor: 'grey',
        borderBottomWidth: lastItem ? 0 : 0.5,
        paddingBottom: 4,
      }}>
      <AvatarBox profileUri={groupInfo.groupPictureURI} avatarSize="s" />
      <View style={{flex: 1}}>
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{
            color: Colors.labels.text,
            paddingLeft: PortSpacing.secondary.left,
          }}
          textColor={Colors.labels.text}>
          {groupInfo.name}
        </NumberlessText>
      </View>
    </Pressable>
  );
}
