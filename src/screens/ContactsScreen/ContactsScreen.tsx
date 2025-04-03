import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useColors} from '@components/colorGuide';
import TopBarDescription from '@components/Text/TopBarDescription';
import {Spacing} from '@components/spacingGuide';
import {useNavigation} from '@react-navigation/native';
import NewContactOptions from './NewContactOptions';
import InviteContactsCard from './InviteContactsCard';
import {GradientScreenView} from '@components/GradientScreenView';

const ContactsScreen = () => {
  const Colors = useColors();

  const styles = styling(Colors);
  const navigation = useNavigation();

  // handles back navigation on backpress
  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <GradientScreenView
      color={Colors}
      title="Contacts"
      onBackPress={onBackPress}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={Colors.black}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarDescription
            theme={Colors.theme}
            description="Invite your contacts to experience Port,
where every conversation is secure and clutter-free."
          />
          <View style={styles.scrollableElementsParent}>
            <NewContactOptions />
            <View style={styles.card}>
              <InviteContactsCard />
            </View>
          </View>
        </View>
      </ScrollView>
    </GradientScreenView>
  );
};
const styling = (color: any) =>
  StyleSheet.create({
    scrollableElementsParent: {
      marginTop: -Spacing.xxl,
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
      gap: Spacing.l,
    },
    card: {marginHorizontal: Spacing.l, marginTop: Spacing.m},
    scrollContainer: {
      backgroundColor: color.background,
    },
  });

export default ContactsScreen;
