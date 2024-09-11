import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {useEffect, useMemo} from 'react';
import {ReactNode} from 'react';
import {StyleSheet, View, Image, Animated, Easing} from 'react-native';
import {GenericButton} from '@components/GenericButton';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
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
  const Colors = DynamicColors();
  const styles = styling(Colors);

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

  const svgArray = [
    {
      assetName: 'LinkGrey',
      dark: require('@assets/dark/icons/LinkGrey.svg').default,
      light: require('@assets/light/icons/LinkGrey.svg').default,
    },
    {
      assetName: 'Cross',
      dark: require('@assets/dark/icons/Cross.svg').default,
      light: require('@assets/light/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const LinkGrey = results.LinkGrey;
  const Cross = results.Cross;

  if (showPreview) {
    return (
      <View style={styles.previewContainer}>
        {loading ? (
          <View style={styles.previewWrapper}>
            <View style={styles.previewLeft}>
              <Animated.View style={{opacity: opacityAnimation}}>
                <LinkGrey height={20} width={20} />
              </Animated.View>
            </View>
            <View
              style={StyleSheet.compose(styles.descContainer, {
                backgroundColor: Colors.primary.surface2,
              })}>
              <View style={styles.detailsContainer}>
                <GenericButton
                  iconSizeRight={20}
                  buttonStyle={styles.cancel}
                  IconRight={Cross}
                  onPress={onCancelPreview}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.imgContainer}>
            {OgImage || image ? (
              <Image
                source={{uri: OgImage || image}}
                style={{
                  width: LINK_MEDIA_WIDTH,
                }}
              />
            ) : (
              <View style={styles.linkCardWrapper}>
                <LinkGrey height={20} width={20} />
              </View>
            )}
            <View style={styles.descContainer}>
              <View style={styles.detailsContainer}>
                {(OgTitle || title) && (
                  <NumberlessText
                    numberOfLines={2}
                    style={{flex: 1}}
                    textColor={Colors.text.primary}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.md}>
                    {OgTitle || title}
                  </NumberlessText>
                )}
                <GenericButton
                  iconSizeRight={20}
                  buttonStyle={styles.cancel}
                  IconRight={Cross}
                  onPress={onCancelPreview}
                />
              </View>
              {(OgDescription || description) && (
                <NumberlessText
                  textColor={Colors.labels.text}
                  fontSizeType={FontSizeType.s}
                  numberOfLines={1}
                  fontType={FontType.rg}>
                  {OgDescription || description}
                </NumberlessText>
              )}
              {(OgUrl || url || link) && (
                <NumberlessText
                  textColor={Colors.text.subtitle}
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

const styling = (colors: any) =>
  StyleSheet.create({
    previewContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      minHeight: LINK_MEDIA_MIN_HEIGHT,
      width: '100%',
    },
    linkCardWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: LINK_MEDIA_WIDTH,
    },
    previewLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: LINK_MEDIA_WIDTH,
    },
    previewWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderRadius: PortSpacing.secondary.uniform,
      overflow: 'hidden',
    },
    detailsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
    },
    descContainer: {
      padding: 8,
      gap: 2,
      width: TEXT_WIDTH,
      backgroundColor: colors.primary.surface,
    },
    imgContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderRadius: PortSpacing.secondary.uniform,
      overflow: 'hidden',
    },
    cancel: {
      backgroundColor: 'transparent',
      margin: 0,
      padding: 0,
    },
  });
