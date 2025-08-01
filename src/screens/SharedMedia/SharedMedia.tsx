import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {SafeAreaView} from '@components/SafeAreaView';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';


import ViewFiles from './ViewFiles';
import ViewPhotosVideos from './ViewPhotosVideos';

type Props = NativeStackScreenProps<AppStackParamList, 'SharedMedia'>;

export type TabStackParamList = {
  ViewPhotosVideos: {chatId: string};
  ViewFiles: {chatId: string};
  ViewLinks: {chatId: string};
};

const Tab = createMaterialTopTabNavigator<TabStackParamList>();

function NumberlessTopTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View style={styles.tabbarContainerStyle}>
      {state.routes.map(
        (route: {key: string | number; name: any; params: any}, index: any) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // todo:navigation - this should be left as is
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              onPress={onPress}
              key={label}
              onLongPress={onLongPress}
              style={StyleSheet.compose(
                styles.tabbarItemStyle,
                isFocused
                  ? {
                      backgroundColor: Colors.primary.accent,
                    }
                  : {
                      backgroundColor: Colors.primary.surface2,
                    },
              )}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                textColor={
                  isFocused ? Colors.primary.white : Colors.text.primary
                }
                fontType={FontType.rg}>
                {label}
              </NumberlessText>
            </TouchableOpacity>
          );
        },
      )}
    </View>
  );
}

const SharedMedia = ({navigation, route}: Props) => {
  const {chatId} = route.params;
  const Colors = DynamicColors();

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <BackTopbar
          bgColor="w"
          onBackPress={() => navigation.goBack()}
          title="Shared media"
        />

        <Tab.Navigator
          initialRouteName="ViewPhotosVideos"
          tabBar={(props: any) => <NumberlessTopTabBar {...props} />}>
          <Tab.Screen
            name="ViewPhotosVideos"
            initialParams={{chatId: chatId}}
            component={ViewPhotosVideos}
            options={{
              title: 'Gallery',
            }}
          />
          <Tab.Screen
            name="ViewFiles"
            initialParams={{chatId: chatId}}
            component={ViewFiles}
            options={{
              title: 'Files',
            }}
          />
          {/* <Tab.Screen
          name="ViewLinks"
          initialParams={{chatId: chatId}}
          component={ViewLinks}
          options={{
            title: 'Links',
          }}
        /> */}
        </Tab.Navigator>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    tabbarItemStyle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      height: 40,
      marginHorizontal: 4,
    },
    tabbarContainerStyle: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: PortSpacing.tertiary.uniform,
      alignItems: 'center',
      backgroundColor: colors.primary.surface,
    },
  });
export default SharedMedia;
