import DynamicColors from '@components/DynamicColors';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import React from 'react';
import {View} from 'react-native';
import SuperportsTopbar from './SuperportsTopbar';
import {PortSpacing} from '@components/ComponentUtils';
import SuperportsInfoImg from '@assets/miscellaneous/SuperportsInfo.svg';
import DashedLine from '@assets/miscellaneous/DashedLine.svg';
import PlusViolet from '@assets/icons/PlusViolet.svg';
import ShareViolet from '@assets/icons/ShareViolet.svg';
import AddUserViolet from '@assets/icons/AddUserViolet.svg';
import NewSuperport from '@assets/dark/icons/NewSuperport.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {useNavigation} from '@react-navigation/native';

const SuperportsInfo = ({
  name,
  avatar,
}: {
  name: string;
  avatar: FileAttributes;
}) => {
  const Colors = DynamicColors();
  const navigation = useNavigation();

  const onClose = () => {
    navigation.goBack();
  };

  const onCreateSuperport = () => {
    navigation.navigate('SuperportScreen', {
      name,
      avatar,
    });
  };

  return (
    <>
      <SuperportsTopbar heading={'Superports'} onIconRightPress={onClose} />
      <View
        style={{
          marginHorizontal: PortSpacing.secondary.uniform,
          marginVertical: PortSpacing.medium.uniform,
          padding: PortSpacing.secondary.uniform,
          borderRadius: PortSpacing.secondary.uniform,
          backgroundColor: Colors.primary.surface,
          gap: PortSpacing.primary.uniform,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: Colors.primary.surface2,
            borderRadius: PortSpacing.tertiary.uniform,
          }}>
          <SuperportsInfoImg />
        </View>
        <View
          style={{
            gap: 4,
          }}>
          <NumberlessText
            fontSizeType={FontSizeType.xl}
            fontType={FontType.sb}
            textColor={Colors.text.primary}>
            Create your first superport
          </NumberlessText>
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.rg}
            textColor={Colors.text.subtitle}>
            Tag your contacts to folder to better organize and prioritize your
            chats
          </NumberlessText>
        </View>
        <View
          style={{
            gap: PortSpacing.intermediate.uniform,
          }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: PortSpacing.tertiary.uniform,
              zIndex: 1,
              backgroundColor: Colors.primary.surface,
            }}>
            <View
              style={{
                backgroundColor: Colors.lowAccentColors.blue,
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
                width: 32,
                borderRadius: 100,
              }}>
              <PlusViolet height={18} width={18} />
            </View>
            <NumberlessText
              style={{flex: 1}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}>
              Create and customize your multi-use Superport
            </NumberlessText>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: PortSpacing.tertiary.uniform,
              zIndex: 1,
              backgroundColor: Colors.primary.surface,
            }}>
            <View
              style={{
                backgroundColor: Colors.lowAccentColors.blue,
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
                width: 32,
                borderRadius: 100,
              }}>
              <ShareViolet height={18} width={18} />
            </View>
            <NumberlessText
              style={{flex: 1}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}>
              Share with your contacts via text, email, or any messaging
              platform.
            </NumberlessText>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: PortSpacing.tertiary.uniform,
              zIndex: 1,
              backgroundColor: Colors.primary.surface,
            }}>
            <View
              style={{
                backgroundColor: Colors.lowAccentColors.blue,
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
                width: 32,
                borderRadius: 100,
              }}>
              <AddUserViolet height={18} width={18} />
            </View>
            <NumberlessText
              style={{flex: 1}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}>
              Your contacts simply scan the QR code or click the link and form a
              connection with you
            </NumberlessText>
          </View>
          <View
            style={{
              position: 'absolute',
              top: PortSpacing.secondary.uniform,
              left: PortSpacing.secondary.uniform,
            }}>
            <DashedLine />
          </View>
          <PrimaryButton
            buttonText="Create a Superport"
            disabled={false}
            isLoading={false}
            onClick={onCreateSuperport}
            primaryButtonColor="p"
            Icon={NewSuperport}
            iconSize="m"
          />
        </View>
      </View>
    </>
  );
};

export default SuperportsInfo;
