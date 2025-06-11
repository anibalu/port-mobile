import React from 'react';
import { View } from 'react-native';

import ToggleSwitch from 'toggle-switch-react-native';

import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import SimpleInput from '@components/Inputs/SimpleInput';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';

/**
 * Reusable Port Card used to decide what kind of Port is being created.
 * @param portReusable - Boolean to check if the port is reusable
 * @param setPortReusable - Function to set the port reusable
 * @param portName - String to store the port name
 * @param setPortName - Function to set the port name
 * @param limit - String to store the limit
 * @param setLimit - Function to set the limit
 * @returns
 */
const PortLabelAndLimitCard = ({
  portReusable,
  setPortReusable,
  portName,
  setPortName,
  limit,
  setLimit,
  showPortError,
  showLimitError,
  showReusablePortError
}: {
  portReusable: boolean;
  setPortReusable: (value: boolean) => void;
  portName: string;
  setPortName: (value: string) => void;
  limit: number;
  setLimit: (value: number) => void;
  showPortError: boolean;
  showLimitError: boolean;
  showReusablePortError: boolean
}) => {
  const color = useColors();

  const handleLimitChange = (text: string) => {
    const numericValue = parseInt(text, 10);
    setLimit(isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <GradientCard style={{ padding: Spacing.l, paddingVertical: Spacing.l }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: Spacing.l,
        }}>
        <NumberlessText
          textColor={color.text.title}
          fontSizeType={FontSizeType.l}
          fontWeight={FontWeight.md}>
          Make Port reusable
        </NumberlessText>
        <ToggleSwitch
          isOn={portReusable}
          onColor={color.enabled}
          offColor={color.disabled}
          onToggle={() => {
            setPortReusable(!portReusable);
            setPortName('');
            setLimit(0);
          }}
        />
      </View>
      <View
        style={{
          gap: Spacing.s,
        }}>
        {portReusable ? (
          <>
            <SimpleInput
              showError={showReusablePortError}
              setText={setPortName}
              text={portName}
              bgColor="w"
              placeholderText="Label this Port. Ex: “LinkedIn Inbounds”"
            />
            {showReusablePortError && (
              <NumberlessText
                fontSizeType={FontSizeType.xs}
                fontWeight={FontWeight.rg}
                textColor={color.red}
                style={{ marginLeft: Spacing.s, marginTop: -Spacing.s }}

              >
                *Port label is required.
              </NumberlessText>
            )}

            <SimpleInput
              showError={showLimitError}
              setText={handleLimitChange}
              text={limit ? limit.toString() : ''}
              bgColor="w"
              keyboardType="numeric"
              placeholderText="How many times can this Port be used?"
            />
            {showLimitError && (
              <NumberlessText
                fontSizeType={FontSizeType.xs}
                fontWeight={FontWeight.rg}
                textColor={color.red}
                style={{ marginLeft: Spacing.s, marginTop: -Spacing.s }}
              >
                *Limit must be greater than 0.
              </NumberlessText>
            )}
            <NumberlessText
              style={{ marginTop: Spacing.s }}
              textColor={color.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontWeight={FontWeight.rg}>
              Labelling Ports helps organize them better. Usage limits on Ports
              can be modified later.
            </NumberlessText>
          </>
        ) : (
          <>
            <SimpleInput
              showError={showPortError}
              setText={setPortName}
              text={portName}
              bgColor="w"
              placeholderText="Who are you sending this Port to?"
            />
            {showPortError && (
              <NumberlessText
                fontSizeType={FontSizeType.xs}
                fontWeight={FontWeight.rg}
                textColor={color.red}
                style={{ marginLeft: Spacing.s, marginTop: -Spacing.s }}

              >
                *Contact name is required.
              </NumberlessText>
            )}
            <NumberlessText
              style={{ marginTop: Spacing.s }}
              textColor={color.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontWeight={FontWeight.rg}>
              When a new contact is added using this Port, this will be used as
              their contact name.
            </NumberlessText>
          </>
        )}
      </View>
    </GradientCard>
  );
};

export default PortLabelAndLimitCard;
