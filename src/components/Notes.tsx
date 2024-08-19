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
import {updateContact} from '@utils/Storage/contacts';

const Notes = ({note, pairHash}: {note: string; pairHash: string}) => {
  const Colors = DynamicColors();
  const [changesSaved, setChangesSaved] = useState(false);
  const [newNote, setNewNote] = useState(note);

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
    if (note) {
      setNewNote(note);
    }
  }, [note]);

  return (
    <SimpleCard style={styles.main}>
      <View style={styles.container}>
        <NumberlessText
          textColor={Colors.text.primary}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          Notes
        </NumberlessText>

        {newNote !== note && (
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
                    await updateContact(pairHash, {notes: newNote});
                    setChangesSaved(true);
                  }}
                />
                <Cross
                  onPress={() => {
                    setNewNote(note);
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
        placeholderText="Add a note"
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
export default Notes;
