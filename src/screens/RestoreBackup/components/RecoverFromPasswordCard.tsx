import React from 'react';
import { View } from 'react-native';

import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import SimpleInput from '@components/Inputs/SimpleInput';
import {
    FontSizeType,
    FontWeight,
    NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';

const RecoverFromPasswordCard = ({
    password,
    setPassword,
}: {
    password: string;
    setPassword: (value: string) => void;
}) => {
    const color = useColors();

    return (
        <GradientCard style={{ padding: Spacing.l, paddingVertical: Spacing.l }}>
            <View>
                    <NumberlessText
                        style={{ marginBottom: Spacing.m }}
                        textColor={color.text.title}
                        fontSizeType={FontSizeType.l}
                        fontWeight={FontWeight.md}>
                        Backup password
                    </NumberlessText>
                    <SimpleInput
                        setText={setPassword}
                        text={password}
                        bgColor="w"
                        placeholderText="Enter your password"
                        secureTextEntry={true}
                    />
                    <NumberlessText
                        style={{ marginTop: Spacing.m }}
                        textColor={color.text.subtitle}
                        fontSizeType={FontSizeType.s}
                        fontWeight={FontWeight.rg}>
                        Enter the password you used to secure this backup. Password must be at least 8 characters long and must not contain spaces.
                    </NumberlessText>
            </View>
        </GradientCard>
    );
};

export default RecoverFromPasswordCard;
