import ChatBackground from '@components/ChatBackground';
import {PortColors} from '@components/ComponentUtils';
import GenericTopBar from '@components/GenericTopBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import ViewFiles from './ViewFiles';
import ViewPhotosVideos from './ViewPhotosVideos';
type Props = NativeStackScreenProps<AppStackParamList, 'SharedMedia'>;

export type TabStackParamList = {
  ViewPhotosVideos: {chatId: string};
  ViewFiles: {chatId: string};
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
                      backgroundColor: PortColors.primary.blue.app,
                    }
                  : {
                      backgroundColor: PortColors.primary.grey.light,
                    },
              )}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                textColor={
                  isFocused
                    ? PortColors.text.primaryWhite
                    : PortColors.text.secondary
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

  return (
    <SafeAreaView>
      <ChatBackground />
      <GenericTopBar
        onBackPress={() => navigation.goBack()}
        title="Shared Media"
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
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabbarItemStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 58,
    marginHorizontal: 4,
  },
  tabbarContainerStyle: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 13,
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
  },
});
export default SharedMedia;
