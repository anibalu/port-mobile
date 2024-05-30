import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {useEffect, useMemo} from 'react';
import {ReactNode} from 'react';
import {StyleSheet, View, Image, Animated, Easing} from 'react-native';
import Cross from '@assets/icons/BlackCross.svg';
import LinkGrey from '@assets/icons/linkDarkGrey.svg';
import {GenericButton} from '@components/GenericButton';
interface LinkPreviewData {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  'og:description'?: string;
  'og:title'?: string;
  'og:url'?: string;
  'og:image'?: string;
}

const LINK_MEDIA_WIDTH = '25%';
const TEXT_WIDTH = '75%';
const LINK_MEDIA_MIN_HEIGHT = 72;

export default function LinkPreview({
  loading = false,
  data,
  link,
  showPreview,
  setShowPreview = (x: boolean) => {
    console.log(x);
  },
}: {
  loading: boolean;
  link: string;
  data: LinkPreviewData | null;
  showPreview: boolean;
  setShowPreview?: (x: boolean) => void;
}): ReactNode {
  const {
    title,
    description,
    url,
    image,
    'og:url': OgUrl,
    'og:description': OgDescription,
    'og:title': OgTitle,
    'og:image': OgImage,
  } = data || {};

  const onCancelPreview = () => {
    setShowPreview(false);
  };

  const opacityAnimation = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnimation, {
          toValue: 0.3,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    if (loading) {
      breathingAnimation.start();
    } else {
      breathingAnimation.stop();
      opacityAnimation.setValue(1);
    }

    return () => {
      breathingAnimation.stop();
    };
  }, [loading, opacityAnimation]);

  if (showPreview) {
    return (
      <View style={styles.previewContainer}>
        {loading ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 24,
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: LINK_MEDIA_WIDTH,
                backgroundColor: PortColors.primary.grey.medium,
              }}>
              <Animated.View style={{opacity: opacityAnimation}}>
                <LinkGrey height={20} width={20} />
              </Animated.View>
            </View>
            <View style={styles.descContainer}>
              <View style={styles.detailsContainer}>
                <GenericButton
                  iconSizeRight={24}
                  buttonStyle={styles.cancel}
                  IconRight={Cross}
                  onPress={onCancelPreview}
                />
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 24,
              overflow: 'hidden',
            }}>
            {OgImage || image ? (
              <Image
                source={{uri: OgImage || image}}
                style={{
                  width: LINK_MEDIA_WIDTH,
                }}
              />
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: LINK_MEDIA_WIDTH,
                  backgroundColor: PortColors.primary.grey.medium,
                }}>
                <LinkGrey height={20} width={20} />
              </View>
            )}
            <View style={styles.descContainer}>
              <View style={styles.detailsContainer}>
                {(OgTitle || title) && (
                  <NumberlessText
                    numberOfLines={2}
                    textColor={PortColors.text.primary}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.md}>
                    {OgTitle || title}
                  </NumberlessText>
                )}
                <GenericButton
                  iconSizeRight={24}
                  buttonStyle={styles.cancel}
                  IconRight={Cross}
                  onPress={onCancelPreview}
                />
              </View>
              {(OgDescription || description) && (
                <NumberlessText
                  textColor={PortColors.text.primary}
                  fontSizeType={FontSizeType.s}
                  numberOfLines={1}
                  fontType={FontType.rg}>
                  {OgDescription || description}
                </NumberlessText>
              )}
              {(OgUrl || url || link) && (
                <NumberlessText
                  textColor={PortColors.text.secondary}
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}>
                  {OgUrl || url || link}
                </NumberlessText>
              )}
            </View>
          </View>
        )}
      </View>
    );
  } else {
    return;
  }
}

const styles = StyleSheet.create({
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 4,
    minHeight: LINK_MEDIA_MIN_HEIGHT,
    width: '100%',
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5,
  },
  descContainer: {
    padding: 8,
    gap: 2,
    width: TEXT_WIDTH,
    backgroundColor: PortColors.background,
  },
  cancel: {
    backgroundColor: 'transparent',
    padding: 0,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 99,
  },
});
