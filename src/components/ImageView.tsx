import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {PortColors, screen} from './ComponentUtils';
import LinearGradient from 'react-native-linear-gradient';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {ImageZoom} from '@likashefqet/react-native-image-zoom';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const ImageView = ({
  fileUri,
  attachedText,
}: {
  fileUri: string;
  attachedText: string;
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <GestureHandlerRootView style={{flex: 1, width: screen.width}}>
      <View style={{flex: 1, width: screen.width}}>
        <ImageZoom
          isDoubleTapEnabled
          isPinchEnabled
          style={{
            width: screen.width,
            flex: 1,
          }}
          uri={fileUri}
          resizeMode="contain"
        />
        {attachedText && (
          <LinearGradient
            style={styles.gradientContainer}
            colors={['transparent', 'black']}>
            <ScrollView>
              {attachedText && (
                <Pressable onPress={toggleText}>
                  {showFullText ? (
                    <NumberlessText
                      textColor={PortColors.primary.white}
                      fontSizeType={FontSizeType.l}
                      fontType={FontType.rg}>
                      {attachedText}
                    </NumberlessText>
                  ) : (
                    <NumberlessText
                      ellipsizeMode="tail"
                      numberOfLines={3}
                      textColor={PortColors.primary.white}
                      fontSizeType={FontSizeType.l}
                      fontType={FontType.rg}>
                      {attachedText}
                    </NumberlessText>
                  )}
                </Pressable>
              )}
            </ScrollView>
          </LinearGradient>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    position: 'absolute',
    bottom: 0,
    marginRight: 10,
    paddingLeft: 10,
    width: screen.width,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: 250,
  },
});

export default ImageView;
