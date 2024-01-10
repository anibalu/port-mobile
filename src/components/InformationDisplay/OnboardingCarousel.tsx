import S1 from '@assets/carousels/s1.svg';
import S2 from '@assets/carousels/s2.svg';
import S3 from '@assets/carousels/s3.svg';
import RightArrow from '@assets/icons/DoubleArrowRightGrey.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode, useRef, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import store from '@store/appStore';

const PARENT_WIDTH = screen.width / 1.2;
const PARENT_HEIGHT = screen.height / 1.3;

const SVG_WIDTH = screen.width / 1.3;
const SVG_HEIGHT = screen.height / 3;

function OnboardingCarousel(): ReactNode {
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselRef = useRef<any>();

  const onSkip = (): void => {
    store.dispatch({
      type: 'HIDE_ONBOARDING_INFO',
    });
  };

  const renderCarouselItem = ({item}: {item: any}): ReactNode => {
    switch (item) {
      case 0:
        return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <GenericButton
              onPress={onSkip}
              textStyle={styles.skipTextStyle}
              buttonStyle={styles.skipButton}>
              SKIP
            </GenericButton>
            <NumberlessText
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}
              style={{marginTop: 50}}
              textColor={PortColors.text.title}>
              Open and close "ports"
            </NumberlessText>
            <S1 style={{marginTop: 50}} width={SVG_WIDTH} height={SVG_HEIGHT} />
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              style={styles.descriptionStyle}
              textColor={PortColors.text.secondary}>
              Tap, click, or scan to open single-use ports without sharing phone
              numbers. Close the port at any time or keep it open indefinitely.
            </NumberlessText>
          </View>
        );

      case 1:
        return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <GenericButton
              onPress={onSkip}
              textStyle={styles.skipTextStyle}
              buttonStyle={styles.skipButton}>
              SKIP
            </GenericButton>
            <NumberlessText
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}
              style={{
                marginTop: 50,
                paddingHorizontal: 24,
                textAlign: 'center',
              }}
              textColor={PortColors.text.title}>
              Adjust permissions and profiles
            </NumberlessText>
            <S2 width={SVG_WIDTH} height={SVG_HEIGHT} />

            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              style={styles.descriptionStyle}
              textColor={PortColors.text.secondary}>
              Set permissions like calling or media sharing on a on-off basis or
              en masse via profiles like “Colleagues or Friends”.
            </NumberlessText>
          </View>
        );
      case 2:
        return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <NumberlessText
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}
              style={{marginTop: 50}}
              textColor={PortColors.text.title}>
              Publish "superports"
            </NumberlessText>
            <S3 width={SVG_WIDTH} height={SVG_HEIGHT} />
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              style={styles.descriptionStyle}
              textColor={PortColors.text.secondary}>
              Publish "superports" to your social channels to funnel new
              conversations safely onto Port or use them to port over large
              groups.
            </NumberlessText>
          </View>
        );
    }
  };

  const renderPagination = (): ReactNode => {
    return (
      <Pagination
        dotsLength={3}
        activeDotIndex={activeIndex}
        dotStyle={{
          width: 8,
          height: 8,
          borderRadius: 5,
          backgroundColor: PortColors.primary.blue.app,
        }}
        inactiveDotStyle={{
          backgroundColor: PortColors.primary.blue.app,
        }}
        inactiveDotOpacity={0.3}
        inactiveDotScale={0.6}
      />
    );
  };

  return (
    <View
      style={{
        height: PARENT_HEIGHT,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: PortColors.primary.white,
      }}>
      <Carousel
        layout="default"
        ref={carouselRef}
        onSnapToItem={(index: number) => setActiveIndex(index)}
        data={[0, 1, 2]}
        sliderWidth={PARENT_WIDTH}
        itemWidth={PARENT_WIDTH}
        renderItem={renderCarouselItem}
      />
      {renderPagination()}
      {activeIndex > 0 && (
        <Pressable
          hitSlop={{top: 15, left: 15, bottom: 15, right: 15}}
          style={{position: 'absolute', left: 34, bottom: 30}}>
          <RightArrow
            onPress={() => {
              if (activeIndex > 0) {
                carouselRef.current.snapToItem(activeIndex - 1);
              }
            }}
            style={{
              transform: [{rotateY: '180deg'}],
            }}
            width={15}
            height={14}
          />
        </Pressable>
      )}
      <Pressable
        hitSlop={{top: 15, left: 15, bottom: 15, right: 15}}
        style={{position: 'absolute', right: 34, bottom: 30}}>
        <RightArrow
          onPress={() => {
            if (activeIndex >= 2) {
              onSkip();
            } else {
              carouselRef.current.snapToItem(activeIndex + 1);
            }
          }}
          width={15}
          height={14}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  skipButton: {
    backgroundColor: PortColors.primary.white,
    position: 'absolute',
    right: 31,
    top: 0,
  },
  descriptionStyle: {
    textAlign: 'center',
    paddingHorizontal: 30,
    marginTop: 30,
  },
  skipTextStyle: {
    color: PortColors.text.secondary,
    fontWeight: '400',
    fontFamily: FontType.rg,
  },
});

export default OnboardingCarousel;
