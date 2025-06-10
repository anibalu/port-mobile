/**
 * Default chat tile displayed when there are no connections
 */
import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { Colors } from '@components/colorGuide';
import {
    FontSizeType,
    FontWeight,
    NumberlessText,
} from '@components/NumberlessText';
import { Spacing, Width } from '@components/spacingGuide';

import Backup from '@assets/icons/GreenBackup.svg';
import GreenCross from '@assets/icons/GreenCross.svg';

//reminder every 3 days
const REMINDER_THRESHOLD = 1000 * 60 * 60 * 24 * 3; //3 days

function shouldShowReminder(latestBackupTime: string | null | undefined) {
    console.log('latestBackupTime', latestBackupTime);
    if (latestBackupTime === '') {
        return true;
    } else if (latestBackupTime) {
        try {
            const timeOfBackup = new Date(latestBackupTime);
            const now: Date = new Date();
            const timeDiff = now.getTime() - timeOfBackup.getTime();
            console.log('timeDiff', timeDiff);
            return timeDiff > REMINDER_THRESHOLD;
        } catch (error) {
            return false;
        }
    } else {
        return false;
    }
}

function BackupReminder({ lastBackupTime, hideReminder, onBackupPress, onClosePress }: { lastBackupTime: string | undefined, hideReminder: boolean, onBackupPress: () => void, onClosePress: () => void }): ReactNode {

    const profile = useSelector(state => state.profile.profile);

    const { showReminder, reminderText } = useMemo(() => {
        if (hideReminder) {
            return { showReminder: false, reminderText: '' };
        } else {
            const latestBackupTime = profile?.lastBackupTime || lastBackupTime;
            return { showReminder: shouldShowReminder(latestBackupTime), reminderText: latestBackupTime ? `It's been a while since you last backed up your data. Backup now to avoid losing your data.` : 'You haven\'t backed up your data yet. Backup now to avoid losing your data.' };
        }
    }, [hideReminder, lastBackupTime, profile]);

    return (
        showReminder ? (
                <View style={styles.mainContainer}>
                    <TouchableOpacity onPress={onBackupPress} style={styles.backupContainer}>
                        <View style={styles.svg1Container}>
                            <Backup width={24} height={24} />
                        </View>
                        <NumberlessText
                            style={styles.textContainer}
                            textColor={Colors.common.boldAccentColors.darkGreen}
                            fontSizeType={FontSizeType.m}
                            fontWeight={FontWeight.rg}>
                            {reminderText}
                        </NumberlessText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClosePress} style={styles.svg2Container}>
                        <GreenCross width={20} height={20} />
                    </TouchableOpacity>
                </View>) : null
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        width: Width.screen - 2*Spacing.s,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.s,
        paddingVertical: Spacing.s,
        borderRadius: Spacing.l,
        backgroundColor: Colors.common.lowAccentColors.darkGreen,
    },
    backupContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    textContainer: {
        width: Width.screen - 128,
        textDecorationLine: 'underline',
    },
    svg1Container: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    svg2Container: {
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default BackupReminder;
