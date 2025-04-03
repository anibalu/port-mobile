import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import OptionWithRadio from '@components/Options/OptionWithRadio';
import LineSeparator from '@components/Separators/LineSeparator';
import React from 'react';
import {disappearDuration, disappearOptions} from '@utils/Time/interfaces';
import {FlatList, StyleSheet, View} from 'react-native';
import {useColors} from '@components/colorGuide';
import {Spacing} from '@components/spacingGuide';
import {Width} from '@components/spacingGuide';

const DissapearingMessagesBottomsheet = ({
  setShowDissappearingMessageModal,
  showDesappearingMessageModal,
  permission,
  onUpdateDisappearingMessagesPermission,
  forceTheme,
}: {
  setShowDissappearingMessageModal: (show: boolean) => void;
  showDesappearingMessageModal: boolean;
  permission: number;
  onUpdateDisappearingMessagesPermission: (value: number) => Promise<void>;
  forceTheme?: 'light' | 'dark';
}) => {
  const Colors = useColors(forceTheme);

  return (
    <PrimaryBottomSheet
      onClose={() => setShowDissappearingMessageModal(false)}
      showClose={false}
      showNotch={false}
      visible={showDesappearingMessageModal}>
      <View style={styles.connectionOptionsRegion}>
        <View style={styles.mainContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            Choose duration
          </NumberlessText>
          <LineSeparator style={{width: Width.screen}} />
        </View>
      </View>
      <View
        style={{
          width: Width.screen,
        }}>
        <FlatList
          keyExtractor={(_item, index) => index.toString()}
          data={disappearOptions}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          horizontal={false}
          renderItem={({item}) => (
            <View style={styles.optionWrapper}>
              <OptionWithRadio
                separator={item !== 'Off'}
                selectedOptionComparision={disappearDuration[item]}
                selectedOption={permission}
                title={item}
                onClick={async () => {
                  await onUpdateDisappearingMessagesPermission(
                    disappearDuration[item],
                  );
                  setShowDissappearingMessageModal(false);
                }}
              />
            </View>
          )}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  connectionOptionsRegion: {
    width: Width.screen,
    paddingHorizontal: Spacing.l,
  },
  mainContainer: {
    width: '100%',
    paddingTop: Spacing.s,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.m,
  },
  optionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default DissapearingMessagesBottomsheet;
