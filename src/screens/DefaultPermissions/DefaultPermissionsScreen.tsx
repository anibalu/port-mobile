import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {defaultPermissions, defaultPermissionsId} from '@configs/constants';
import {Height, Spacing} from '@components/spacingGuide';
import PrimaryButton from '@components/Buttons/PrimaryButton';
import {useColors} from '@components/colorGuide';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';
import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import ExpandableLocalPermissionsCard from '@components/PermissionsCards/ExpandableLocalPermissionsCard';

type Props = NativeStackScreenProps<
  AppStackParamList,
  'DefaultPermissionsScreen'
>;

const DefaultPermissionsScreen = ({navigation, route}: Props) => {
  const {isFromOnboarding} = route.params || {};

  const [isLoading, setIsLoading] = useState(true);

  const [permissions, setPermissions] = useState<PermissionsStrict>({
    ...defaultPermissions,
  });
  const [editedPermissions, setEditedPermissions] = useState<PermissionsStrict>(
    {
      ...defaultPermissions,
    },
  );

  const didPermissionsChange = useMemo(() => {
    if (isFromOnboarding) {
      return true;
    }
    return JSON.stringify(permissions) !== JSON.stringify(editedPermissions);
  }, [permissions, editedPermissions, isFromOnboarding]);

  const [permissionRequestFailed, _setPermissionRequestFailed] =
    useState(false);

  const color = useColors();

  const onNavigateOut = () => {
    if (isFromOnboarding) {
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeTab'}],
      });
    } else {
      navigation.goBack();
    }
  };

  const onBackPress = () => {
    onNavigateOut();
  };

  const onSave = async () => {
    setPermissions(editedPermissions);
    await updatePermissions(defaultPermissionsId, editedPermissions);
    // onNavigateOut();
  };

  const styles = styling(color);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const permissions = await getPermissions(defaultPermissionsId);
      setPermissions(permissions);
      setEditedPermissions(permissions);
      //check and request app permissions
      setIsLoading(false);
    })();
  }, []);

  return (
    <>
      <CustomStatusBar theme={color.theme} backgroundColor={color.background} />
      <SafeAreaView backgroundColor={color.background}>
        <GenericBackTopBar
          onBackPress={isFromOnboarding ? undefined : onBackPress}
          theme={color.theme}
          backgroundColor={color.background}
        />
        <ScrollView contentContainerStyle={styles.mainContainer}>
          <View style={{gap: Spacing.m, marginBottom: Spacing.xl}}>
            <NumberlessText
              textColor={color.text.title}
              fontWeight={FontWeight.sb}
              fontSizeType={FontSizeType.es}>
              {'Set up default permissions'}
            </NumberlessText>
            <NumberlessText
              textColor={color.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              These permissions are used as the default template for all new
              contacts and Ports.
            </NumberlessText>
          </View>
          <ExpandableLocalPermissionsCard
            heading={'New Contact can'}
            permissions={editedPermissions}
            setPermissions={setEditedPermissions}
            expandable={false}
            bottomText={
              'You can change these permissions individually for each contact and Port later.'
            }
          />
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            isLoading={isLoading}
            theme={color.theme}
            text={
              isFromOnboarding
                ? permissionRequestFailed
                  ? 'Proceed anyway'
                  : 'Proceed'
                : 'Save'
            }
            disabled={!didPermissionsChange}
            onClick={onSave}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    topBarContainer: {
      height: Height.topbar,
      marginTop: Spacing.l,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mainContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
    },
    footer: {
      backgroundColor: Colors.surface,
      padding: Spacing.l,
      flexDirection: 'row',
    },
  });
export default DefaultPermissionsScreen;
