import React, {useState, useEffect} from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { LABEL_INPUT_LIMIT } from "../../configs/constants";
import Scan from "../../../assets/icons/Scan.svg";
import Share from "../../../assets/icons/Share.svg";
import Logo from "../../../assets/icons/Logo.svg";
import Refresh from "../../../assets/icons/Refresh.svg";
import { getQRData } from "../../actions/GetQRData";
import QRCode from "react-native-qrcode-svg";
import { NumberlessClickableText, NumberlessMediumText } from "../../components/NumberlessText";
import OptionToggle from "./OptionToggle";
import { convertQRtoLink } from "../../actions/ConvertQRtoLink";

type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

function ConnectionDisplay({label, setLabel, qrCodeData, setQRCodeData, linkData, setLinkData}) {
    const [isQR, setIsQR] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [viewWidth, setViewWidth] = useState(0);
    const [generate, setGenerate] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoadingLink, setIsLoadingLink] = useState(true);

    const onLayout = event => {
      const {width} = event.nativeEvent.layout;
      setViewWidth(width);
    };

    useEffect(() => {
        setLabel("");
        setLoading(true);
        setIsLoadingLink(true);
        const fetchQRCodeData = async () => {
            try {
                //use this function to generate and fetch QR code data.
                const data = await getQRData();
                setQRCodeData(data);
            } catch (error) {
                console.error('Error fetching QR code data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQRCodeData();
    }, [generate]);
    useEffect(() => {
        const fetchLinkData = async () => {
            try {
                //use this function to convert qr data to clickable link.
                const link = await convertQRtoLink(qrCodeData);
                setLinkData(link);
            } catch (error) {
                console.error('Error fetching Link:', error);
            } finally {
                setIsLoadingLink(false);
            }
        };
        if (isLoadingLink && (!isQR) && (!loading)) {
            fetchLinkData();
        }
    }, [isQR, loading])
    return(
        <View style={styles.container}>
            <OptionToggle isQR={isQR} setIsQR={setIsQR}/>
            <View style={styles.mainBox} onLayout={onLayout}>
                <TextInput
                    style={styles.labelInput}
                    maxLength={LABEL_INPUT_LIMIT}
                    placeholder={isFocused ? '' : 'Label (Optional)'}
                    placeholderTextColor="#A3A3A3"
                    onChangeText={(newLabel: string) => setLabel(newLabel)}
                    value={label}
                    textAlign="center"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <View style={{ height: viewWidth * 0.9, width: viewWidth * 0.9, justifyContent: 'center', alignItems: 'center' }}>
                    {loading ? (
                        <ActivityIndicator size={"large"} color={"#000000"} />
                    ) : (isQR ?
                        (<View style={styles.qrBox}>
                            <QRCode value={qrCodeData} size={viewWidth * 0.65} />
                            <View style={styles.logoBox}>
                                <Logo width={viewWidth * 0.12} height={viewWidth * 0.12} />
                            </View>
                        </View>) :
                        (<View style={styles.linkBox}>
                            <View>
                                {isLoadingLink ? (
                                        <ActivityIndicator size={"large"} color={"#000000"} />
                                ) :
                                    (
                                        <NumberlessClickableText style={styles.linkText} onPress={() => console.log("link pressed")}>{linkData}</NumberlessClickableText>
                                    )}
                            </View>
                        </View>)
                    )}
                </View>
                <View style={styles.buttonsBox}>
                    <View style={styles.buttonBoxLeft}>
                        <Pressable style={styles.button} onPress={() => console.log("Share Pressed")}>
                            <Share width={30} height={30} />
                        </Pressable>
                    </View>
                    <View style={styles.buttonBoxRight}>
                        <Pressable style={styles.button} onPress={() => console.log("Scan Pressed")}>
                            <Scan width={30} height={30} />
                        </Pressable>
                    </View>
                </View>
            </View>
            <Pressable style={styles.generateButton} onPress={() => setGenerate(generate+1)}>
                <Refresh height={24} width={24}/>
                <NumberlessMediumText style={styles.generateText}>Generate New</NumberlessMediumText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        width:'100%',
        alignItems: 'center',
    },
    mainBox: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        width: '74%',
        marginTop: 30,
    },
    labelInput: {
        width: '100%',
        height: 60,
        fontSize: 17,
        fontFamily: 'Rubik-Medium',
        color: '#A3A3A3',
        borderRadius: 16,
        backgroundColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonsBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#547CEF',
        borderRadius: 16,
        width: '100%',
    },
    buttonBoxLeft: {
        height: 60,
        paddingRight: 5,
        width: '50%',
    },
    buttonBoxRight: {
        height: 60,
        paddingLeft: 5,
        width: '50%',
    },
    qrBox: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkBox: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoBox: {
        position: 'absolute',
        backgroundColor: '#000000',
        padding: 5,
        borderRadius: 10,
    },
    generateButton: {
        width: '84%',
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginTop: 30,
    },
    generateText: {
        fontSize: 17,
        color: '#000000',
        marginLeft: 20,
    },
    linkText: {
        fontSize: 15,
        color: '#000000',
        textAlign: 'center',
    }
});

export default ConnectionDisplay;