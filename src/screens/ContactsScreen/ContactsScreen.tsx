import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useColors } from '@components/colorGuide';
import { GradientScreenView } from '@components/GradientScreenView';
import { Spacing } from '@components/spacingGuide';
import TopBarDescription from '@components/Text/TopBarDescription';

import { getContacts } from '@utils/Storage/contacts';
import { ContactEntry } from '@utils/Storage/DBCalls/contacts';

import ConnectionsCard from './components/ConnectionsCard';
import NewContactOptions from './components/NewContactOptions';

const ContactsScreen = () => {
  const Colors = useColors();

  const styles = styling(Colors);
  const navigation = useNavigation();
  const [allConnections, setAllConnections] = useState<ContactEntry[]>([]);

  // handles back navigation on backpress
  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    (async () => {
      const checkForConnections = await getContacts();
      console.log("checkForConnections",checkForConnections)
      setAllConnections(checkForConnections);
    })();
  }, []);

  const renderContent = () => {
    return (
      <View style={styles.scrollContainer}>
        <TopBarDescription
          theme={Colors.theme}
          description="Invite more contacts to Port and enjoy a clutter-free, secure chat experience."
        />
        <View style={styles.scrollableElementsParent}>
          <View style={styles.card}>
            <NewContactOptions />
            <ConnectionsCard allConnections={allConnections} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <GradientScreenView
      color={Colors}
      title="Port contacts"
      onBackPress={onBackPress}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={Colors.black}>
      <FlatList
        data={[1]}
        renderItem={renderContent}
        showsVerticalScrollIndicator={false}
      />
    </GradientScreenView>
  );
};
const styling = (color: any) =>
  StyleSheet.create({
    scrollableElementsParent: {
      marginTop: -Spacing.xxl,
      paddingBottom: Spacing.l,
      gap: Spacing.m,
    },
    card: { marginHorizontal: Spacing.l, gap: Spacing.l },
    scrollContainer: {
      backgroundColor: color.background,
    },
  });

export default ContactsScreen;
