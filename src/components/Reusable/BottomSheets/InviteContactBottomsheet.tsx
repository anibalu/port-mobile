import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  getWeight,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import DynamicColors from '@components/DynamicColors';
import LargeTextInput from '../Inputs/LargeTextInput';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {useTheme} from 'src/context/ThemeContext';
import SecondaryButton from '../LongButtons/SecondaryButton';
import {generateBundle, getBundleClickableLink} from '@utils/Ports';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import Share from 'react-native-share';
import Contacts from 'react-native-contacts';
import {jsonToUrl} from '@utils/JsonToUrl';
import LineSeparator from '../Separators/LineSeparator';

/**
 * When modal is mounted, it needs to:
 * 1. Get into a loading state
 * 2. On loading state ending, there are 2 options:
 *  a. Port link generation has failed and thus we show a try again button. Clicking on this button restarts the loading state.
 *  b. Port link generation succeeds and we show the preview text and link.
 * 3. On clicking on share, we show various options: email (if emails array length > 0), message, whatsapp (if phone number array length > 0), share on other platform.
 * 4. If email is clicked, user gets to choose an email to send it to if there's more than 1 email.
 * 5. If phone number is clicked, user gets to choose phone number to send it to if there's more than 1 phone number.
 * 6. Linking out of the app based on the user's decision.
 */

const InviteContactBottomsheet = ({
  name,
  phoneNumber,
  email,
  visible,
  onClose,
}: {
  name: string;
  phoneNumber: Contacts.PhoneNumber[];
  email: Contacts.EmailAddress[];
  visible: boolean;
  onClose: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const [text, setText] = useState<string>('');
  //If link is null at the end of load, we assume an error has occured.
  const [link, setLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onShareClicked, setOnShareClicked] = useState<boolean>(false);

  const [onEmailClicked, setOnEmailClicked] = useState<boolean>(false);
  const [onMessageClicked, setOnMessageClicked] = useState<boolean>(false);
  const [onWhatsappClicked, setOnWhatsappClicked] = useState<boolean>(false);

  const onModalClose = () => {
    setIsLoading(true);
    setLink(null);
    setText('');
    setOnShareClicked(false);
    setOnEmailClicked(false);
    setOnMessageClicked(false);
    setOnWhatsappClicked(false);
    onClose();
  };

  //load up and set port link and preview text.
  const onLoad = async () => {
    setIsLoading(true);
    setLink(null);
    setText('');
    try {
      const portToShare = await generateBundle(
        BundleTarget.direct,
        undefined,
        name,
      );
      let portLink = null;
      try {
        portLink = await getBundleClickableLink(
          BundleTarget.direct,
          portToShare.portId,
          JSON.stringify(portToShare),
        );
      } catch (error) {
        portLink = jsonToUrl(portToShare as any);
      }
      if (portLink) {
        setLink(portLink);
        setText(
          `Hey ${name}! I am inviting you to connect with me on Port. Click on the link below to connect with me.`,
        );
      }
    } catch (error) {
      console.error('Error sharing port link: ', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const svgArray = [
    {
      assetName: 'AddMessage',
      light: require('@assets/light/icons/AddMessage.svg').default,
      dark: require('@assets/dark/icons/AddMessage.svg').default,
    },
    {
      assetName: 'EmailIcon',
      light: require('@assets/icons/EmailBlack.svg').default,
      dark: require('@assets/icons/EmailWhite.svg').default,
    },
    {
      assetName: 'Retry',
      light: require('@assets/light/icons/Retry.svg').default,
      dark: require('@assets/dark/icons/Retry.svg').default,
    },
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
    {
      assetName: 'WhatsAppLogo',
      light: require('@assets/light/icons/WhatsApp.svg').default,
      dark: require('@assets/dark/icons/WhatsApp.svg').default,
    },
    {
      assetName: 'Message',
      light: require('@assets/light/icons/Message.svg').default,
      dark: require('@assets/dark/icons/Message.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const AddMessage = results.AddMessage;
  const EmailIcon = results.EmailIcon;
  const Retry = results.Retry;
  const RightChevron = results.RightChevron;
  const WhatsAppLogo = results.WhatsAppLogo;
  const Message = results.Message;

  const {themeValue} = useTheme();

  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      bgColor="g"
      onClose={onModalClose}
      title={`Invite ${name} to Port`}>
      {isLoading ? (
        //If port link generation is in progress, show loader
        <View style={{paddingVertical: PortSpacing.secondary.uniform}}>
          <ActivityIndicator size={'small'} color={Colors.primary.accent} />
        </View>
      ) : //If port link generation has succeeded.
      link ? (
        //If share has been clicked, show various share options
        onShareClicked ? (
          //If an option has been selected
          onEmailClicked || onMessageClicked || onWhatsappClicked ? (
            <>
              {onEmailClicked && !onMessageClicked && !onWhatsappClicked && (
                //let selecting email options go here
                <SimpleCard style={styles.card}>
                  <NumberlessText
                    style={styles.options}
                    textColor={Colors.text.primary}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.sb}>
                    Select an email to send the invite over
                  </NumberlessText>
                  {email.map((item, index) => (
                    <>
                      <Pressable
                        style={styles.optionStyle}
                        key={index}
                        onPress={() => {
                          Linking.openURL(
                            `mailto:${item.email}?subject=Try out Port!&body=${
                              text + '\n' + link
                            }`,
                          );
                        }}>
                        <NumberlessText
                          textColor={Colors.text.primary}
                          fontSizeType={FontSizeType.m}
                          fontType={FontType.rg}>
                          {item.email}
                        </NumberlessText>
                        <RightChevron />
                      </Pressable>
                      {!(index === email.length - 1) && <LineSeparator />}
                    </>
                  ))}
                </SimpleCard>
              )}
              {onMessageClicked && !onWhatsappClicked && !onEmailClicked && (
                //let selecting message options go here
                <SimpleCard style={styles.card}>
                  <NumberlessText
                    style={styles.options}
                    textColor={Colors.text.primary}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.md}>
                    Select a number to send the invite over.
                  </NumberlessText>
                  {phoneNumber.map((item, index) => (
                    <>
                      <Pressable
                        style={styles.optionStyle}
                        key={index}
                        onPress={() => {
                          Linking.openURL(
                            `sms:${item.number}?&body=${text + '\n' + link}`,
                          );
                        }}>
                        <NumberlessText
                          textColor={Colors.text.primary}
                          fontSizeType={FontSizeType.m}
                          fontType={FontType.md}>
                          {item.number}
                        </NumberlessText>
                        <RightChevron />
                      </Pressable>
                      {!(index === phoneNumber.length - 1) && <LineSeparator />}
                    </>
                  ))}
                </SimpleCard>
              )}
              {onWhatsappClicked && !onMessageClicked && !onEmailClicked && (
                //let selecting whatsapp options go here
                <SimpleCard style={styles.card}>
                  <NumberlessText
                    style={styles.options}
                    textColor={Colors.text.primary}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.md}>
                    Select a number to send the invite over.
                  </NumberlessText>
                  {phoneNumber.map((item, index) => (
                    <>
                      <Pressable
                        style={styles.optionStyle}
                        key={index}
                        onPress={() => {
                          Linking.openURL(
                            `https://wa.me/${
                              item.number
                            }/?&text=${encodeURIComponent(text + '\n' + link)}`,
                          );
                        }}>
                        <NumberlessText
                          textColor={Colors.text.primary}
                          fontSizeType={FontSizeType.m}
                          fontType={FontType.md}>
                          {item.number}
                        </NumberlessText>
                        <RightChevron />
                      </Pressable>
                      {!(index === phoneNumber.length - 1) && <LineSeparator />}
                    </>
                  ))}
                </SimpleCard>
              )}
            </>
          ) : (
            //else let them select an option
            <>
              <View
                style={{
                  width: '100%',
                  gap: PortSpacing.secondary.bottom,
                  marginTop: PortSpacing.primary.top,
                }}>
                {email.length > 0 && (
                  <SecondaryButton
                    buttonText={'Mail'}
                    secondaryButtonColor={themeValue === 'dark' ? 'w' : 'black'}
                    Icon={EmailIcon}
                    iconSize="s"
                    onClick={() => {
                      if (email.length === 1) {
                        Linking.openURL(
                          `mailto:${
                            email[0].email
                          }?subject=Try out Port!&body=${text + '\n' + link}`,
                        );
                      } else {
                        setOnEmailClicked(true);
                      }
                    }}
                  />
                )}
                {phoneNumber.length > 0 && (
                  <View
                    style={{width: '100%', gap: PortSpacing.secondary.bottom}}>
                    <SecondaryButton
                      buttonText={'Message'}
                      secondaryButtonColor={
                        themeValue === 'dark' ? 'w' : 'black'
                      }
                      iconSize="s"
                      Icon={Message}
                      onClick={() => {
                        if (phoneNumber.length === 1) {
                          Linking.openURL(
                            `sms:${phoneNumber[0].number}?&body=${
                              text + '\n' + link
                            }`,
                          );
                        } else {
                          setOnMessageClicked(true);
                        }
                      }}
                    />
                    <SecondaryButton
                      buttonText={'WhatsApp'}
                      secondaryButtonColor={
                        themeValue === 'dark' ? 'w' : 'black'
                      }
                      Icon={WhatsAppLogo}
                      iconSize="s"
                      onClick={() => {
                        if (phoneNumber.length === 1) {
                          Linking.openURL(
                            `https://wa.me/${
                              phoneNumber[0].number
                            }/?&text=${encodeURIComponent(text + '\n' + link)}`,
                          );
                        } else {
                          setOnWhatsappClicked(true);
                        }
                      }}
                    />
                  </View>
                )}

                <NumberlessText
                  style={{alignSelf: 'center'}}
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.rg}>
                  Or
                </NumberlessText>
                <PrimaryButton
                  buttonText="Share on other platforms"
                  primaryButtonColor="b"
                  disabled={false}
                  isLoading={false}
                  onClick={() => {
                    try {
                      Share.open({
                        title: 'Inviting existing contact to Port',
                        message: text + '\n' + link,
                      }).catch(error => {
                        console.log('Error sharing port: ', error);
                      });
                    } catch (error) {
                      console.log('Error sharing port', error);
                    }
                  }}
                />
              </View>
            </>
          )
        ) : (
          //else show, preview text and link
          <>
            <SimpleCard style={styles.NoteCardWrapper}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  Add a custom message
                </NumberlessText>
                <AddMessage width={16} height={16} />
              </View>
              <LargeTextInput
                placeholderText="Type a custome not to send here..."
                setText={setText}
                text={text}
                maxLength={1000}
                showLimit={true}
              />
            </SimpleCard>
            <SimpleCard style={styles.linkCardWrapper}>
              <NumberlessText
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                This link will be attached to your custom message.
              </NumberlessText>
              <NumberlessText
                textColor={Colors.primary.blue}
                fontSizeType={FontSizeType.l}
                fontType={FontType.rg}>
                {link}
              </NumberlessText>
            </SimpleCard>
            <View
              style={
                isIOS
                  ? {marginBottom: PortSpacing.secondary.bottom, width: '100%'}
                  : {marginBottom: 0, width: '100%'}
              }>
              <PrimaryButton
                buttonText="Share"
                disabled={false}
                isLoading={false}
                onClick={() => {
                  setOnShareClicked(true);
                }}
                primaryButtonColor={themeValue === 'dark' ? 'p' : 'black'}
              />
            </View>
          </>
        )
      ) : (
        //If link generation has failed, show try again
        <View style={styles.mainWrapper}>
          <NumberlessText
            style={styles.description}
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            Error generating a Port link for this contact. Please check your
            network connection and try again.
          </NumberlessText>
          <SecondaryButton
            buttonText={'Try Again'}
            secondaryButtonColor={'black'}
            Icon={Retry}
            iconSize={'s'}
            onClick={onLoad}
          />
        </View>
      )}
    </PrimaryBottomSheet>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    NoteCardWrapper: {
      width: '100%',
      paddingVertical: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginVertical: PortSpacing.secondary.uniform,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      gap: PortSpacing.secondary.uniform,
    },
    linkCardWrapper: {
      width: '100%',
      paddingVertical: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginBottom: PortSpacing.secondary.uniform,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      gap: PortSpacing.secondary.uniform,
    },
    mainWrapper: {
      flexDirection: 'column',
      width: '100%',
      marginTop: PortSpacing.intermediate.top,
      ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
    },
    title: {
      fontFamily: FontType.md,
      fontSize: FontSizeType.l,
      fontWeight: getWeight(FontType.md),
      marginLeft: PortSpacing.tertiary.left,
      color: PortColors.primary.red.error,
    },
    description: {
      width: '100%',
      marginBottom: PortSpacing.intermediate.bottom,
    },
    optionStyle: {
      paddingVertical: 10,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    card: {
      width: '100%',
      marginTop: PortSpacing.secondary.top,
    },
    options: {
      marginVertical: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
  });

export default InviteContactBottomsheet;
