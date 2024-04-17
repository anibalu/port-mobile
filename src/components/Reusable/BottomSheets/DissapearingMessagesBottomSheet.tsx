import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import React from 'react';
import {disappearDuration, disappearOptions} from '@utils/Time/interfaces';
import {FlatList, View} from 'react-native';

const DissapearingMessagesBottomsheet = ({
  setShowDissappearingMessageModal,
  showDesappearingMessageModal,
  permission,
  onUpdateDisappearingMessagedPermission,
}: {
  setShowDissappearingMessageModal: (show: boolean) => void;
  showDesappearingMessageModal: boolean;
  permission: number;
  onUpdateDisappearingMessagedPermission: (value: number) => Promise<void>;
}) => {
  return (
    <PrimaryBottomSheet
      bgColor="g"
      onClose={() => setShowDissappearingMessageModal(false)}
      showClose={true}
      visible={showDesappearingMessageModal}
      title="Disappearing messages">
      <NumberlessText
        style={{
          width: '100%',
          color: PortColors.subtitle,
          marginBottom: PortSpacing.intermediate.bottom,
          marginTop: PortSpacing.secondary.top,
        }}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        For increased privacy and storage, all new messages in this chat will
        vanish after the chosen duration, unless turned off.
      </NumberlessText>
      <SimpleCard
        style={{
          paddingVertical: PortSpacing.secondary.uniform,
          width: '100%',
        }}>
        <NumberlessText
          style={{
            paddingHorizontal: PortSpacing.secondary.uniform,
            marginBottom: PortSpacing.secondary.bottom,
          }}
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}>
          Choose duration
        </NumberlessText>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={disappearOptions}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          horizontal={false}
          renderItem={({item}) => (
            <View>
              <OptionWithRadio
                selectedOptionComparision={disappearDuration[item]}
                selectedOption={permission}
                title={item}
                onClick={async () => {
                  console.log('runnnig on click');
                  console.log('setting ', disappearDuration[item]);
                  setShowDissappearingMessageModal(false);
                  await onUpdateDisappearingMessagedPermission(
                    disappearDuration[item],
                  );
                }}
              />
              {item !== 'Off' && <LineSeparator />}
            </View>
          )}
        />
      </SimpleCard>
    </PrimaryBottomSheet>
  );
};

export default DissapearingMessagesBottomsheet;
