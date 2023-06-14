import React, {useState} from 'react';
import {SafeAreaView} from '../../components/SafeAreaView';
import {ScrollView, StatusBar, StyleSheet, View, Dimensions, Text} from 'react-native';
import Topbar from './TopBar';
import ConnectionDisplay from './ConnectionDisplay';
import { NumberlessMediumText, NumberlessRegularText } from '../../components/NumberlessText';
import { useNavigation } from '@react-navigation/native';

function NewContact() {
    const navigation = useNavigation();
    const [label, setLabel] = useState<string>("");
    const [qrCodeData, setQRCodeData] = useState("");
    const [linkData, setLinkData] = useState("");
    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView style={styles.scrollView}>
                <View style={styles.mainBox}>
                    <ConnectionDisplay label={label} setLabel={setLabel} qrCodeData={qrCodeData} setQRCodeData={setQRCodeData} linkData={linkData} setLinkData={setLinkData}/>
                    <View style={styles.educationBox}>
                        <NumberlessMediumText style={styles.titleText}>
                            Add Education Here.
                        </NumberlessMediumText>
                        <NumberlessRegularText style={styles.educationText}>
                            Lorem ipsum dolor sit amet consectetur. Magna eget faucibus pellentesque sit fusce fames vel. Neque placerat.
                        </NumberlessRegularText>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.topBox}>
                <Topbar onPress={() => {navigation.navigate('ConnectionCentre')}}/>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    screen: {
      width: '100%',
      height: '100%',
      backgroundColor: '#EEE',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    topBox: {
        position: 'absolute',
        width: '100%',
    },
    scrollView: {
        width: '100%',
    },
    mainBox: {
        height: '100%',
        width: '100%',
        paddingTop: 51,
        alignItems: 'center',
    },
    educationBox: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 30,
    },
    titleText: {
        fontSize: 15,
        marginBottom: 20,
    },
    educationText: {
        fontSize: 15,
    },
  });

export default NewContact;