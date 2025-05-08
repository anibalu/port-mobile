/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * UI is updated to latest spec for both android and ios
 */
import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import { useThemeColors } from '@components/colorGuide';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing, Width } from '@components/spacingGuide';

import { rootNavigationRef } from '@navigation/rootNavigation';
import { TermsStackParamList } from '@navigation/TermsStack/TermsStackTypes';

import { acceptTerms , saveUpdateStatusToLocal } from '@utils/TermsAndConditions';


import { ToastType, useToast } from 'src/context/ToastContext';


type Props = NativeStackScreenProps<TermsStackParamList, 'AcceptTerms'>;

function AcceptTerms({ navigation, route }: Props) {
    console.log('[Rendering AcceptTerms Screen]');

    const { needsToAccept } = route.params || {};
    const colors = useThemeColors('dark');
    const {showToast} = useToast();

    const styles = styling(colors);

    const [isLoading, setIsLoading] = useState(false);
    const [isGoBackLoading, setIsGoBackLoading] = useState(false);

    const onAccept = async () => {
        setIsLoading(true);
        try {
            await acceptTerms();
            rootNavigationRef.reset({
                index: 0,
                routes: [{ name: 'AppStack' }],
            });
        } catch (error) {
            console.log('acceptTerms error', error);
            showToast('Failed to accept terms and conditions. Please check your internet connection and try again.', ToastType.error);
        }
        setIsLoading(false);
    }

    const onDecline = () => {
        navigation.navigate('AcceptTermsSecondThoughts');
    }

    const goBack = async () => {
        setIsGoBackLoading(true);
        await saveUpdateStatusToLocal({ needsToAccept: false, shouldNotify: false });
        setIsGoBackLoading(false);
        rootNavigationRef.reset({
            index: 0,
            routes: [{name: 'AppStack'}],
          });
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
                {needsToAccept ? (
                    <View style={styles.container}>
                        <NumberlessText
                            style={{ marginBottom: Spacing.l }}
                            fontWeight={FontWeight.rg}
                            fontSizeType={FontSizeType.xl}
                            textColor={colors.text.title}>
                            We have updated our{' '}
                            <NumberlessText
                                onPress={() =>
                                    Linking.openURL(
                                        'https://portmessenger.com/TermsAndConditions',
                                    )
                                }
                                style={{ textDecorationLine: 'underline' }}
                                fontWeight={FontWeight.rg}
                                fontSizeType={FontSizeType.xl}
                                textColor={colors.text.title}>
                                Terms
                            </NumberlessText>{' '}
                            and{' '}
                            <NumberlessText
                                fontWeight={FontWeight.rg}
                                onPress={() =>
                                    Linking.openURL('https://portmessenger.com/PrivacyPolicy')
                                }
                                style={{ textDecorationLine: 'underline' }}
                                fontSizeType={FontSizeType.xl}
                                textColor={colors.text.title}>
                                Privacy Policy
                            </NumberlessText>
                            .
                        </NumberlessText>
                        <NumberlessText
                            style={{ marginBottom: Spacing.l }}
                            fontWeight={FontWeight.rg}
                            fontSizeType={FontSizeType.l}
                            textColor={colors.text.subtitle}>
                            By clicking on 'Accept' you acknowledge that you have read and agree to our updated{' '}
                            <NumberlessText
                                onPress={() =>
                                    Linking.openURL(
                                        'https://portmessenger.com/TermsAndConditions',
                                    )
                                }
                                fontWeight={FontWeight.rg}
                                fontSizeType={FontSizeType.l}
                                textColor={colors.purple}>
                                Terms
                            </NumberlessText>{' '}
                            and{' '}
                            <NumberlessText
                                fontWeight={FontWeight.rg}
                                onPress={() =>
                                    Linking.openURL('https://portmessenger.com/PrivacyPolicy')
                                }
                                fontSizeType={FontSizeType.l}
                                textColor={colors.purple}>
                                Privacy Policy
                            </NumberlessText>
                            .
                        </NumberlessText>
                        <PrimaryButton
                            text="Accept"
                            theme={colors.theme}
                            isLoading={isLoading}
                            disabled={false}
                            onClick={onAccept}
                        />
                        <View style={{marginTop: Spacing.l, width: Width.screen - 2 * Spacing.l}}>
                            <SecondaryButton
                                text="Decline"
                                theme={colors.theme}
                                isLoading={false}
                                disabled={false}
                                onClick={onDecline}
                            />
                        </View>
                    </View>
                ) : (
                    <View style={styles.container}>
                        <NumberlessText
                            style={{ marginBottom: Spacing.l }}
                            fontWeight={FontWeight.rg}
                            fontSizeType={FontSizeType.xl}
                            textColor={colors.text.title}>
                            This is a reminder to review our updated{' '}
                            <NumberlessText
                                onPress={() =>
                                    Linking.openURL(
                                        'https://portmessenger.com/TermsAndConditions',
                                    )
                                }
                                style={{ textDecorationLine: 'underline' }}
                                fontWeight={FontWeight.rg}
                                fontSizeType={FontSizeType.xl}
                                textColor={colors.text.title}>
                                Terms
                            </NumberlessText>{' '}
                            and{' '}
                            <NumberlessText
                                fontWeight={FontWeight.rg}
                                onPress={() =>
                                    Linking.openURL('https://portmessenger.com/PrivacyPolicy')
                                }
                                style={{ textDecorationLine: 'underline' }}
                                fontSizeType={FontSizeType.xl}
                                textColor={colors.text.title}>
                                Privacy Policy
                            </NumberlessText>
                            .
                        </NumberlessText>
                        <NumberlessText
                            style={{ marginBottom: Spacing.l }}
                            fontWeight={FontWeight.rg}
                            fontSizeType={FontSizeType.l}
                            textColor={colors.text.subtitle}>
                            We will periodically remind you to review our updated{' '}
                            <NumberlessText
                                onPress={() =>
                                    Linking.openURL(
                                        'https://portmessenger.com/TermsAndConditions',
                                    )
                                }
                                fontWeight={FontWeight.rg}
                                fontSizeType={FontSizeType.l}
                                textColor={colors.purple}>
                                Terms
                            </NumberlessText>{' '}
                            and{' '}
                            <NumberlessText
                                fontWeight={FontWeight.rg}
                                onPress={() =>
                                    Linking.openURL('https://portmessenger.com/PrivacyPolicy')
                                }
                                fontSizeType={FontSizeType.l}
                                textColor={colors.purple}>
                                Privacy Policy
                            </NumberlessText>
                            . You can always access these documents under the 'Legal' section in 'Settings'.
                        </NumberlessText>
                        <PrimaryButton
                            text="Go back to Port"
                            theme={colors.theme}
                            isLoading={isGoBackLoading}
                            disabled={false}
                            onClick={goBack}
                        />
                    </View>
                )}
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

export default AcceptTerms;
