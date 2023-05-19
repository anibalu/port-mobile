/**
 * The welcome screen that greets users when they first download the app
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SvgUri, SvgXml } from 'react-native-svg';


import Logo from '../../../assets/miscellaneous/appLogo.svg';
import Name from '../../../assets/miscellaneous/appName.svg';

function Welcome({ navigation }) {
    return (
        <View style={styles.background}>
            <View style={styles.greeting}>
                <Logo width={108} height={108} style={styles.logo}/>
                <Name width={255} height={95} />
            </View>
            <TouchableOpacity style={styles.button} 
                onPress={() => navigation.navigate('Onboarding')}
            >
                <Text style={styles.buttonText}>Get started</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
   background: {
    display: "flex",
    backgroundColor: "#547CEF",
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center"
   },
   greeting: {
    marginTop: "25%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: "30%"
   },
   logo: {
    flex: 0
   },
   name: {
    flex: 1
   },
   button: {
    backgroundColor: "#FFFFFF",
    marginBottom: "10%",
    width: "85%",
    height: 70,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
   },
   buttonText: {
    color: "#547CEF",
    fontSize: 17
   }

});

export default Welcome;