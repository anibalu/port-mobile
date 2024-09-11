import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import LargeTextInput from '@components/Reusable/Inputs/LargeTextInput';
import Tick from '@assets/icons/notes/Tick.svg';
import Greentick from '@assets/icons/notes/Greentick.svg';
import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {GroupData} from '@utils/Storage/DBCalls/group';
import Group from '@utils/Groups/Group';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';

const Description = ({
  description,
  chatId,
  chatData,
}: {
  description: string;
  chatId: string;
  chatData: GroupData;
}) => {
  const Colors = DynamicColors();
  const [changesSaved, setChangesSaved] = useState(false);
  const [newNote, setNewNote] = useState(description);

  const onChangeText = (text: string) => {
    setNewNote(text);
    setChangesSaved(false);
  };

  const svgArray = [
    {
      assetName: 'Cross',
      light: require('@assets/icons/notes/Cross.svg').default,
      dark: require('@assets/dark/icons/RedCross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Cross = results.Cross;
  useMemo(() => {
    if (description) {
      setNewNote(description);
    }
  }, [description]);

  return (
    <SimpleCard style={styles.main}>
      <View style={styles.container}>
        <NumberlessText
          textColor={Colors.text.primary}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          Description
        </NumberlessText>

        {newNote !== description && (
          <View style={styles.row}>
            {changesSaved ? (
              <>
                <Greentick />
                <NumberlessText
                  textColor={Colors.text.subtitle}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.s}>
                  Changes Saved
                </NumberlessText>
              </>
            ) : (
              <>
                <Tick
                  onPress={async () => {
                    //update group description
                    const chatHandler = new Group(chatId);
                    await chatHandler.updateData({description: newNote});
                    const groupData = await chatHandler.getData();
                    if (
                      groupData &&
                      groupData.amAdmin &&
                      groupData.description
                    ) {
                      const sender = new SendMessage(
                        chatId,
                        ContentType.groupDescription,
                        {
                          groupDescription: groupData.description,
                        },
                      );
                      sender.send();
                    }
                    setChangesSaved(true);
                  }}
                />
                <Cross
                  onPress={() => {
                    setNewNote(description);
                    setChangesSaved(false);
                  }}
                />
              </>
            )}
          </View>
        )}
      </View>
      <LargeTextInput
        maxLength={2000}
        setText={onChangeText}
        text={newNote}
        bgColor="w"
        placeholderText="Add a description"
        isEditable={chatData.amAdmin}
      />
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  main: {
    paddingVertical: PortSpacing.secondary.uniform,
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: PortSpacing.secondary.uniform,
    alignItems: 'center',
    height: 30,
  },
  row: {
    flexDirection: 'row',
    gap: PortSpacing.tertiary.uniform,
  },
});
export default Description;
