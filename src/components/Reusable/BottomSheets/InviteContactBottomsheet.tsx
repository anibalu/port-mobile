import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React, {useEffect, useState} from 'react';
import {Linking, Share, StyleSheet, View} from 'react-native';
import DynamicColors from '@components/DynamicColors';
import LargeTextInput from '../Inputs/LargeTextInput';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {useTheme} from 'src/context/ThemeContext';
import SecondaryButton from '../LongButtons/SecondaryButton';
import {getBundleClickableLink} from '@utils/Ports';
import {generateNewPortBundle} from '@utils/Ports/direct';
import {defaultFolderId} from '@configs/constants';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import WhatsAppLogo from '@assets/icons/WhatsAppLogo.svg';
import SMSIcon from '@assets/icons/SMSRed.svg';

const defaultLinkText = 'Loading...';

const InviteContactBottomsheet = ({
  name = '',
  number: phoneNumber = '',
  email = '',
  visible = false,
  setVisible,
}: {
  name: string;
  number: string;
  email: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const [text, setText] = useState<string>('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [link, setLink] = useState<string>(defaultLinkText);

  useEffect(() => {
    // Only set text if the name prop changes
    if (name) {
      setText(`Hey ${name}! I am inviting you to connect with me on Port.`);
    }
    if (visible) {
      // Don't unnecessarily use up Ports
      (async () => {
        const portToShare = await generateNewPortBundle(
          name,
          'forever',
          null,
          defaultFolderId,
        );
        const portLink = await getBundleClickableLink(
          BundleTarget.direct,
          portToShare.portId,
          JSON.stringify(portToShare),
        );
        setLink(portLink);
      })();
    }
  }, [name, visible]);

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
  ];
  const results = useDynamicSVG(svgArray);
  const AddMessage = results.AddMessage;
  const EmailIcon = results.EmailIcon;

  const {themeValue} = useTheme();

  return (
    <View>
      <PrimaryBottomSheet
        showClose={true}
        visible={showShareOptions}
        bgColor="g"
        onClose={() => {
          setVisible(false);
          setShowShareOptions(false);
        }}
        title="Send invite over">
        <View
          style={{
            width: '100%',
            gap: PortSpacing.secondary.bottom,
            marginTop: PortSpacing.primary.top,
          }}>
          {email && (
            <SecondaryButton
              buttonText={'Mail'}
              secondaryButtonColor={themeValue === 'dark' ? 'w' : 'black'}
              Icon={EmailIcon}
              iconSize="s"
              onClick={() => {
                Linking.openURL(
                  `mailto:${email}?subject=Try out Port!&body=${
                    text + '\n' + link
                  }`,
                );
                setVisible(false);
                setShowShareOptions(false);
              }}
            />
          )}
          {phoneNumber && phoneNumber !== '' && (
            <View style={{width: '100%', gap: PortSpacing.secondary.bottom}}>
              <SecondaryButton
                buttonText={'Message'}
                secondaryButtonColor="r"
                iconSize="s"
                Icon={SMSIcon}
                onClick={() => {
                  Linking.openURL(
                    `sms:${phoneNumber}?&body=${text + '\n' + link}`,
                  );
                  setVisible(false);
                  setShowShareOptions(false);
                }}
              />
              <SecondaryButton
                buttonText={'WhatsApp'}
                secondaryButtonColor="green"
                Icon={WhatsAppLogo}
                iconSize="s"
                onClick={() => {
                  Linking.openURL(
                    `https://wa.me/${phoneNumber}/?&text=${encodeURIComponent(
                      text + '\n' + link,
                    )}`,
                  );
                  setVisible(false);
                  setShowShareOptions(false);
                }}
              />
            </View>
          )}
          <PrimaryButton
            buttonText="Share"
            primaryButtonColor="black"
            disabled={false}
            isLoading={false}
            onClick={() => {
              Share.share({message: text + '\n' + link});
              setVisible(false);
              setShowShareOptions(false);
            }}
          />
        </View>
      </PrimaryBottomSheet>
      <PrimaryBottomSheet
        showClose={true}
        visible={visible && !showShareOptions}
        bgColor="g"
        onClose={() => setVisible(false)}
        title={`Invite ${name}`}>
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
            disabled={defaultLinkText === link}
            isLoading={false}
            onClick={() => {
              setShowShareOptions(true);
              setVisible(false);
            }}
            primaryButtonColor={themeValue === 'dark' ? 'p' : 'black'}
          />
        </View>
      </PrimaryBottomSheet>
    </View>
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
  });

export default InviteContactBottomsheet;
