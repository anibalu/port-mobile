import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import Restore from '@assets/icons/Restore.svg';
import {StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {readSecureDataBackup} from '@utils/Backup/backupUtils';
import store from '@store/appStore';
import {useErrorModal} from 'src/context/ErrorModalContext';

const RestoreAccount = () => {
  const navigation = useNavigation();

  const {BackupRestoreError} = useErrorModal();

  const onSuccess = () => {
    store.dispatch({
      type: 'ONBOARDING_COMPLETE',
      payload: true,
    });
    setIsLoading(false);
  };

  const onFailure = () => {
    BackupRestoreError();
    setIsLoading(false);
  };
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={{backgroundColor: PortColors.background}}>
        <BackTopbar
          bgColor="w"
          title="Restore account"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.screen}>
          <View style={styles.mainText}>
            <Restore style={{alignSelf: 'center'}} />
            <NumberlessText
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}
              style={{
                textAlign: 'center',
                marginTop: PortSpacing.secondary.uniform,
              }}
              textColor={PortColors.title}>
              Restore from local backup
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              style={{
                textAlign: 'center',
                marginTop: PortSpacing.medium.uniform,
              }}
              textColor={PortColors.subtitle}>
              You can restore your connections from a local backup. If you
              choose not to, you won't be able to later.
            </NumberlessText>
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton
              buttonText="Choose backup file"
              disabled={false}
              isLoading={isLoading}
              onClick={async () => {
                setIsLoading(true);
                await readSecureDataBackup(onSuccess, onFailure);
                setIsLoading(false);
              }}
              primaryButtonColor="b"
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: screen.width,
  },
  mainText: {
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: PortSpacing.secondary.uniform,
    marginBottom: PortSpacing.secondary.bottom,
  },
});

export default RestoreAccount;
