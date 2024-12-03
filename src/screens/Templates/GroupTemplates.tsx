import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';

import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {TemplateParams} from '@utils/Storage/DBCalls/templates';
import {getAllTemplates} from '@utils/Storage/templates';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import TemplateCard from './TemplateCard';
import AddTemplateBottomsheet from '@components/Reusable/BottomSheets/AddTemplateBottomsheet';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import {PortSpacing} from '@components/ComponentUtils';
import NoTemplate from '@assets/icons/NoTemplate.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import Group from '@utils/Groups/Group';
import {DEFAULT_AVATAR, DEFAULT_GROUP_MEMBER_NAME} from '@configs/constants';

const GroupTemplates = ({route}) => {
  const {chatId} = route.params;
  const Colors = DynamicColors();
  // used to set templates after the db call
  const [templates, setTemplates] = useState<TemplateParams[]>([]);
  // to open add/edittemplate bottomsheet
  const [openBottomsheet, setOpenBottomsheet] = useState<boolean>(false);
  // to set chat authentication
  // to set chat disconnection
  const [disconnected, setDisconnected] = useState(false);
  const [groupPhoto, setGroupPhoto] = useState(DEFAULT_AVATAR);
  const [groupName, setGroupName] = useState(DEFAULT_GROUP_MEMBER_NAME);
  const navigation = useNavigation<any>();
  const svgArray = [
    {
      assetName: 'PlusIcon',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const PlusIcon = results.PlusIcon;

  // db call to get all available templates
  const loadTemplates = async () => {
    const response = await getAllTemplates();
    setTemplates(response);
  };

  useEffect(() => {
    (async () => {
      const chat = new Group(chatId);
      const chatData = await chat.getData();
      setGroupPhoto(chatData?.groupPicture);
      setDisconnected(chatData?.disconnected);
      setGroupName(chatData?.name);
    })();
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      (() => {
        loadTemplates();
      })();
    }, []),
  );

  const renderTemplate = (item: any) => {
    return (
      <TemplateCard
        loadTemplates={loadTemplates}
        onSendMessage={onSendMessage}
        template={item.item}
      />
    );
  };

  const onSendMessage = (template: TemplateParams) => {
    navigation.push('GroupChat', {
      chatId,
      isConnected: !disconnected,
      profileUri: groupPhoto || DEFAULT_AVATAR,
      name: groupName,
      ifTemplateExists: template, //if template is selected, we will send it as params to chat screen
    });
  };

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <BackTopbar
          bgColor="w"
          onBackPress={() => navigation.goBack()}
          title="Message templates"
        />
        <View style={styles.container}>
          {templates.length > 0 ? (
            <>
              <FlatList
                style={{width: '100%'}}
                data={templates}
                keyExtractor={item => item.templateId}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                renderItem={renderTemplate}
              />
            </>
          ) : (
            <View style={styles.notemplate}>
              <NoTemplate style={{alignSelf: 'center'}} />
              <NumberlessText
                style={{textAlign: 'center'}}
                textColor={Colors.text.primary}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.xl}>
                No Templates
              </NumberlessText>
              <NumberlessText
                style={{
                  textAlign: 'center',
                  marginTop: PortSpacing.tertiary.top,
                }}
                textColor={Colors.text.subtitle}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.l}>
                Use templates to avoid typing out the same messages over and
                over.
              </NumberlessText>
            </View>
          )}
        </View>
        <View
          style={{
            padding: PortSpacing.tertiary.uniform,
          }}>
          <SecondaryButton
            Icon={PlusIcon}
            secondaryButtonColor="black"
            onClick={() => setOpenBottomsheet(p => !p)}
            buttonText="Add a template"
          />
        </View>
      </SafeAreaView>
      <AddTemplateBottomsheet
        loadTemplates={loadTemplates}
        onSendMessage={onSendMessage}
        visible={openBottomsheet}
        scope="add"
        onClose={() => setOpenBottomsheet(p => !p)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: PortSpacing.secondary.top,
    paddingHorizontal: PortSpacing.tertiary.uniform,
  },
  notemplate: {
    alignSelf: 'center',
    flex: 1,
  },
});
export default GroupTemplates;
