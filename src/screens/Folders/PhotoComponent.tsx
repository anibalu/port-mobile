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
    <View>
      <View
        style={{
          height: 35,
          flexDirection: 'row',
          gap: -8,
          alignItems: 'center',
        }}>
        {photos.map((item, index) => {
          return (
            <View>
              <View
                key={index}
                style={{
                  borderRadius: 50,
                  borderWidth: 1.5,
                  borderColor: 'white',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AvatarBox avatarSize="es" profileUri={item} />
              </View>
            </View>
          );
        })}
        {connectionsCount > 4 && (
          <View
            style={{
              borderWidth: 1.5,
              borderRadius: 50,
              borderColor: 'white',
              backgroundColor: Colors.primary.surface2,
              height: 27,
              width: 27,
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
