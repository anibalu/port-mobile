import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
/**
 * This is a critical error screen that is displayed when an error occurs.
 * This screen does not adhere to the standards used elsewhere in the app. This
 * is intentional. We cannot rely on any other providers for safe areas or topbars
 * because this is a critical error screen, adjacent to all other providers.
 */
const CriticalError: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>
      Oops! Something went wrong, but we're already on it. Please close the app
      completely and restart to continue.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  text: {
    color: 'orange',
    textAlign: 'center',
  },
});

export default CriticalError;
