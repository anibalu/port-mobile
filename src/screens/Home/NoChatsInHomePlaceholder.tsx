import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {SafeAreaView} from '@components/SafeAreaView';
import {useNavigation} from '@react-navigation/native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React from 'react';
import {View} from 'react-native';

const NoChatsInHomePlaceholder = () => {
  const svgArray = [
    {
      assetName: 'NoChatsPoster',
      light: require('@assets/light/icons/NoChatsPoster.svg').default,
      dark: require('@assets/dark/icons/NoChatsPoster.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const NoChatsPoster = results.NoChatsPoster;

  const navigation = useNavigation();
  const Colors = DynamicColors();

  return (
    <SafeAreaView style={{backgroundColor: Colors.primary.background, flex: 1}}>
      <SimpleCard
        style={{
          padding: PortSpacing.tertiary.uniform,
          marginHorizontal: PortSpacing.tertiary.uniform,
        }}>
        <NoChatsPoster
          style={{alignSelf: 'center'}}
          width={screen.width - 50}
        />
        <NumberlessText
          style={{marginLeft: 8}}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.xl}
          fontType={FontType.sb}>
          Looks like you haven’t shown any chats in home
        </NumberlessText>
        <NumberlessText
          style={{marginLeft: 8}}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}>
          In order to use folders, you need to have at least one connection.
          Invite people to connect with you now!
        </NumberlessText>
        <View style={{marginTop: PortSpacing.secondary.top}}>
          <PrimaryButton
            disabled={false}
            isLoading={false}
            onClick={() => {
              navigation.navigate('FolderStack', {screen: 'Folders'});
            }}
            buttonText="Go to folders"
            primaryButtonColor={'b'}
          />
        </View>
      </SimpleCard>
    </SafeAreaView>
  );
};

export default NoChatsInHomePlaceholder;
