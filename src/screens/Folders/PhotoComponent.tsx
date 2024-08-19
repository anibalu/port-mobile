import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import React from 'react';
import {View} from 'react-native';

export const PhotoComponent = ({
  photos,
  connectionsCount,
}: {
  photos: (string | null | undefined)[];
  connectionsCount: number;
}) => {
  const Colors = DynamicColors();
  if (connectionsCount === 0) {
    return <View style={{height: 35}} />;
  }
  return (
    <View style={{height: 35}}>
      <View style={{flexDirection: 'row', gap: -8}}>
        {photos.map((item, index) => {
          return (
            <View
              key={index}
              style={{
                height: 35,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <AvatarBox avatarSize="es" profileUri={item} />
            </View>
          );
        })}
        {connectionsCount > 4 && (
          <View
            style={{
              borderWidth: 2,
              borderRadius: 50,
              borderColor: 'white',
              backgroundColor: Colors.primary.surface2,
              height: 28,
              width: 28,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}>
              +{connectionsCount - 4}
            </NumberlessText>
          </View>
        )}
      </View>
    </View>
  );
};
