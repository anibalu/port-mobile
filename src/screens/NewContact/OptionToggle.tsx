import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { NumberlessMediumText } from "../../components/NumberlessText";

type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

//TODO: make toggle animated
function OptionToggle(props: {isQR: boolean; setIsQR:SetStateFunction<boolean>;}) {
    if (props.isQR) {
        return(
            <View style={styles.toggleParent}>
                <View style={styles.on}>
                    <NumberlessMediumText style={styles.selectedText}>QR code</NumberlessMediumText>
                </View>
                <Pressable style={styles.off} onPress={() => props.setIsQR(false)}>
                    <NumberlessMediumText style={styles.unselectedText}>Link</NumberlessMediumText>
                </Pressable>
            </View>
            );
    }
    else {
        return(
            <View style={styles.toggleParent}>
                <Pressable style={styles.off} onPress={() => props.setIsQR(true)}>
                    <NumberlessMediumText style={styles.unselectedText}>QR code</NumberlessMediumText>
                </Pressable>
                <View style={styles.on}>
                    <NumberlessMediumText style={styles.selectedText}>Link</NumberlessMediumText>
                </View>
            </View>
            );
    }
}

const styles = StyleSheet.create({
    toggleParent: {
        borderRadius: 48,
        height: 60,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '74%',
        padding: 6,
        marginTop: 30,
    },
    on: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#547CEF',
        width: '50%',
        height: '100%',
        borderRadius: 24,
    },
    off: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        height: '100%',
    },
    selectedText: {
        fontSize: 17,
        color: '#FFFFFF',
    },
    unselectedText: {
        fontSize: 17,
        color: '#547CEF',
    },
});

export default OptionToggle;