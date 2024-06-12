import React, {useEffect, useState} from 'react';
import SimpleCard from './Reusable/Cards/SimpleCard';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {PortSpacing} from './ComponentUtils';
import {StyleSheet, View} from 'react-native';
import TertiaryButton from './Reusable/LongButtons/TertiaryButton';
import {createSecureDataBackup} from '@utils/Backup/backupUtils';
import {getLastBackupTime} from '@utils/Profile';
import {getChatTileTimestamp} from '@utils/Time';
import DynamicColors from './DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

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

  const Colors = DynamicColors();

  const svgArray = [
    // 1.Clock
    {
      assetName: 'Clock',
      light: require('@assets/light/icons/Clock.svg').default,
      dark: require('@assets/dark/icons/Clock.svg').default,
    },
    {
      assetName: 'RightArrowIcon',
      light: require('@assets/light/icons/RightArrowIcon.svg').default,
      dark: require('@assets/dark/icons/RightArrowIcon.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Clock = results.Clock;
  const RightArrowIcon = results.RightArrowIcon;

  const styles = styling(Colors);

  return (
    <SimpleCard style={styles.card}>
      <View style={styles.title}>
        <View style={{flexDirection: 'row'}}>
          <Clock />

          <NumberlessText
            style={{marginLeft: PortSpacing.tertiary.left}}
            textColor={Colors.text.primary}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            Backup
          </NumberlessText>
        </View>
        <View style={styles.pill}>
          <NumberlessText
            textColor={Colors.text.subtitle}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            {lastBackup
              ? getChatTileTimestamp(lastBackup)
              : 'No backups available'}
          </NumberlessText>
        </View>
      </View>
      <NumberlessText
        style={{marginLeft: PortSpacing.tertiary.left}}
        textColor={Colors.text.subtitle}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
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
        <RightArrowIcon style={{marginTop: 1}} />
      </View>
    </SimpleCard>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    card: {
      width: '100%',
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingTop: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.secondary.top,
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: PortSpacing.medium.bottom,
    },
    pill: {
      backgroundColor: colors.primary.lightgrey,
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
