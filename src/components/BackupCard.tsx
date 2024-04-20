import React, {useEffect, useState} from 'react';
import SimpleCard from './Reusable/Cards/SimpleCard';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {PortColors, PortSpacing} from './ComponentUtils';
import {StyleSheet, View} from 'react-native';
import Clock from '@assets/icons/Clock.svg';
import BlueRight from '@assets/icons/BlueRight.svg';
import TertiaryButton from './Reusable/LongButtons/TertiaryButton';
import {createSecureDataBackup} from '@utils/Backup/backupUtils';
import {getLastBackupTime} from '@utils/Profile';
import {getChatTileTimestamp} from '@utils/Time';

const BackupCard = () => {
  const [lastBackup, setLastBackup] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLastBackup(await getLastBackupTime());
    })();
  }, []);

  const onBackupPress = async () => {
    setLoading(true);
    await createSecureDataBackup();
    setLastBackup(await getLastBackupTime());
    setLoading(false);
  };

  return (
    <SimpleCard style={styles.card}>
      <View style={styles.title}>
        <View style={{flexDirection: 'row'}}>
          <Clock />
          <NumberlessText
            style={{marginLeft: PortSpacing.tertiary.left}}
            textColor={PortColors.primary.black}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Backup
          </NumberlessText>
        </View>
        <NumberlessText
          style={styles.pill}
          textColor={PortColors.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          {lastBackup
            ? getChatTileTimestamp(lastBackup)
            : 'No backups available'}
        </NumberlessText>
      </View>
      <NumberlessText
        style={{marginLeft: PortSpacing.tertiary.left}}
        textColor={PortColors.subtitle}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.s}>
        A local backup containing all your connections and folders will be
        created on your device. Currently, Port does not support backing up chat
        history.
      </NumberlessText>
      <View style={styles.button}>
        <TertiaryButton
          tertiaryButtonColor="b"
          disabled={loading}
          onClick={onBackupPress}
          buttonText="Create a backup"
        />
        <BlueRight style={{marginTop: 1}} />
      </View>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingTop: PortSpacing.secondary.uniform,
    marginTop: PortSpacing.primary.top,
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PortSpacing.medium.bottom,
  },
  pill: {
    backgroundColor: PortColors.primary.grey.light,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-end',
  },
});

export default BackupCard;
