/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * UI is updated to latest spec for both android and ios
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import { useThemeColors } from '@components/colorGuide';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing, Width } from '@components/spacingGuide';

import { TermsStackParamList } from '@navigation/TermsStack/TermsStackTypes';

type Props = NativeStackScreenProps<TermsStackParamList, 'AcceptTermsSecondThoughts'>;

function AcceptTermsSecondThoughts({ navigation }: Props) {
    console.log('[Rendering AcceptTermsSecondThoughts Screen]');

    const colors = useThemeColors('dark');
    const styles = styling(colors);

    const onDelete = () => {
        navigation.navigate('DeleteAccountAnyway');
    }

    const goBack = () => {
        navigation.goBack();
    }

    return (
        <>
            <CustomStatusBar
                theme={colors.theme}
                backgroundColor={colors.background}
            />
            <SafeAreaView
                backgroundColor={colors.background}
                modifyNavigationBarColor={true}
                bottomNavigationBarColor={colors.background}>
                <View style={styles.container}>
                    <NumberlessText
                        style={{ marginBottom: Spacing.l, alignSelf: 'flex-start' }}
                        fontWeight={FontWeight.rg}
                        fontSizeType={FontSizeType.xl}
                        textColor={colors.text.title}>
                        Still thinking it over?
                    </NumberlessText>
                    <NumberlessText
                        style={{ marginBottom: Spacing.l }}
                        fontWeight={FontWeight.rg}
                        fontSizeType={FontSizeType.l}
                        textColor={colors.text.subtitle}>
                        We apologize if our terms are not agreeable to you. 
                        If you choose not to continue, that’s completely okay — we respect your choice either way.
                    </NumberlessText>
                    <PrimaryButton
                        text="Go back and accept"
                        theme={colors.theme}
                        isLoading={false}
                        disabled={false}
                        onClick={goBack}
                    />
                    <View style={{ marginTop: Spacing.l, width: Width.screen - 2 * Spacing.l }}>
                        <SecondaryButton
                            text="Delete my account"
                            theme={colors.theme}
                            isLoading={false}
                            disabled={false}
                            onClick={onDelete}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styling = (color: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Spacing.l,
            backgroundColor: color.background,
            paddingBottom: Spacing.xl,
        },
        greeting: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonContainer: {
            flexDirection: 'column',
            gap: Spacing.xl,
            paddingVertical: Spacing.l,
            paddingHorizontal: Spacing.l,
            width: Width.screen - 2 * Spacing.l,
        },
    });

export default AcceptTermsSecondThoughts;
