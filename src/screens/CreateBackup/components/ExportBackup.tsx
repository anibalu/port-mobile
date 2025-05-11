import React from 'react';
import { View } from 'react-native';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import { isIOS } from '@components/ComponentUtils';
import {
    FontSizeType,
    FontWeight,
    NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

type ExportBackupProps = {
    onCloudExport: () => Promise<void>;
    onLocalExport: () => Promise<void>;
    isCloudExporting: boolean;
    isLocalExporting: boolean;
};

const ExportBackup = ({
    onCloudExport,
    onLocalExport,
    isCloudExporting,
    isLocalExporting,
}: ExportBackupProps) => {
    const color = useColors();
    const svgArray = [
        {
          assetName: 'GoogleLogo',
          light: require('assets/icons/GoogleSmall.svg').default,
          dark: require('assets/icons/GoogleSmall.svg').default,
        },
      ];
      const svgResults = useSVG(svgArray, color.theme);
      const GoogleLogo = svgResults.GoogleLogo;
      
    return (
        <GradientCard style={{ padding: Spacing.l, paddingVertical: Spacing.l }}>
            <View>
                <NumberlessText
                    textColor={color.text.title}
                    fontSizeType={FontSizeType.l}
                    fontWeight={FontWeight.md}>
                    Back up options
                </NumberlessText>
                <NumberlessText
                    style={{ marginTop: Spacing.m }}
                    textColor={color.text.subtitle}
                    fontSizeType={FontSizeType.s}
                    fontWeight={FontWeight.rg}>
                    Back up to your cloud to be able to restore your data if you lose your device, or create a local backup file to manage yourself.
                </NumberlessText>
                <View style={{ gap: Spacing.s, marginTop: Spacing.m, justifyContent: 'center', alignItems: 'center' }}>
                    <PrimaryButton
                        text={isIOS ? "Back up to iCloud" : "Back up to Google Drive"}
                        onClick={onCloudExport}
                        isLoading={isCloudExporting}
                        disabled={isCloudExporting}
                        theme={color.theme}
                        Icon={isIOS ? undefined : GoogleLogo}
                        textStyle={{ fontSize: FontSizeType.m, fontWeight: FontWeight.md }}
                    />
                    <NumberlessText
                        textColor={color.text.title}
                        fontSizeType={FontSizeType.s}
                        fontWeight={FontWeight.sb}>
                        Or                    
                    </NumberlessText>
                    <SecondaryButton
                        text="Create a local backup"
                        onClick={onLocalExport}
                        isLoading={isLocalExporting}
                        disabled={false}
                        theme={color.theme}
                        textStyle={{ fontSize: FontSizeType.m, fontWeight: FontWeight.md }}
                    />
                </View>
            </View>
        </GradientCard>
    );
};

export default ExportBackup;
