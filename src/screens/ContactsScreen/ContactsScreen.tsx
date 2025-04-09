import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useColors } from '@components/colorGuide';
import TopBarDescription from '@components/Text/TopBarDescription';
import { Spacing } from '@components/spacingGuide';
import { useNavigation } from '@react-navigation/native';
import NewContactOptions from './components/NewContactOptions';
import InviteContactsCard from './components/InviteContactsCard';
import { GradientScreenView } from '@components/GradientScreenView';
import { ConnectionInfo } from '@utils/Storage/DBCalls/connections';
import ConnectionsCard from './components/ConnectionsCard';
import { getDirectChats } from '@utils/DirectChats';

const ContactsScreen = () => {
  const Colors = useColors();

  const styles = styling(Colors);
  const navigation = useNavigation();
  const [allConnections, setAllConnections] = useState<ConnectionInfo[]>([]);

  // handles back navigation on backpress
  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    (async () => {
      const checkForConnections = await getDirectChats();
      setAllConnections(checkForConnections);
    })();
  }, []);

  return (
    <GradientScreenView
      color={Colors}
      title="Port contacts"
      onBackPress={onBackPress}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={Colors.black}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarDescription
            theme={Colors.theme}
            description="Invite more contacts to Port and enjoy a clutter-free, secure chat experience."
          />
          <View style={styles.scrollableElementsParent}>
            <View style={styles.card}>
              <NewContactOptions />
              {allConnections.length > 0 ? (
                <ConnectionsCard allConnections={allConnections} />
              ) : (
                <InviteContactsCard />)
              }
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
      paddingBottom: Spacing.l,
      gap: Spacing.m,
    },
    card: { marginHorizontal: Spacing.l, gap: Spacing.l },
    scrollContainer: {
      backgroundColor: color.background,
    },
  });

export default ContactsScreen;
