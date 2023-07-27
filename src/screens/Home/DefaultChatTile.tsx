import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";
import { NumberlessItalicText } from "../../components/NumberlessText";
import BottomNavNew from '../../../assets/icons/BottomNavNewInactive.svg';

function DefaultChatTile(defaultTile: {id: string}) {
    const navigation = useNavigation();
    const handleNavigate = () => {
      navigation.navigate('ConnectionCentre');
    }
    return (
        <Pressable style={styles.defaultTileContainer} onPress={handleNavigate}>
          <View style={styles.newIcon}>
            <BottomNavNew width={50} height={50}/>
          </View>
          <NumberlessItalicText style={styles.defaultTileText}>Add a new contact</NumberlessItalicText>
        </Pressable>
      );
}

const styles = StyleSheet.create({
    defaultTileContainer: {
        flex: 1,
        marginTop: 7,
        borderRadius: 14,
        shadowOpacity: 13,
        shadowOffset: {
            width: 14,
            height: 8,
        },
        backgroundColor: '#FFF6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    defaultTileText: {
        color: '#A1A1A1',
    },
    newIcon: {
        width: 50,
        height: 50,
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
    },
});

export default DefaultChatTile;