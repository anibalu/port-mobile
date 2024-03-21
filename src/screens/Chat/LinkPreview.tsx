import {PortColors, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {useEffect, useMemo} from 'react';
import {ReactNode} from 'react';
import {StyleSheet, View, Image, Animated, Easing} from 'react-native';
import Cross from '@assets/icons/cross.svg';
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
              justifyContent: 'flex-start',
              height: '100%',
              borderWidth: 0.5,
              borderColor: PortColors.primary.grey.medium,
              borderRadius: 16,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: 76,
                backgroundColor: PortColors.primary.grey.medium,
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
              }}>
              <Animated.View style={{opacity: opacityAnimation}}>
                <LinkGrey height={20} width={20} />
              </Animated.View>
            </View>
            <View
              style={{
                padding: 8,
                gap: 2,
                flex: 1,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                backgroundColor: PortColors.primary.grey.light,
              }}>
              <GenericButton
                iconSizeRight={25}
                buttonStyle={StyleSheet.compose(styles.cancel, {
                  top: 8,
                  right: 8,
                })}
                IconRight={Cross}
                onPress={onCancelPreview}
              />
            </View>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              height: '100%',
              borderWidth: 0.5,
              borderColor: PortColors.primary.grey.medium,
              borderRadius: 16,
            }}>
            {OgImage || image ? (
              <Image
                resizeMode="contain"
                source={{uri: OgImage || image}}
                style={{
                  width: 76,
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                }}
              />
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 76,
                  backgroundColor: PortColors.primary.grey.medium,
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                }}>
                <LinkGrey height={20} width={20} />
              </View>
            )}

            <View style={styles.descContainer}>
              <View style={styles.detailsContainer}>
                {(OgTitle || title) && (
                  <NumberlessText
                    style={{flex: 1, maxWidth: '90%'}}
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
                  style={
                    !data?.title || !data?.description
                      ? {
                          textAlignVertical: 'center',
                          lineHeight: isIOS ? 70 : 50,
                          flex: 1,
                        }
                      : {flex: 1}
                  }
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
    borderRadius: 16,
    margin: 8,
    height: 90,
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
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    flex: 1,
    backgroundColor: PortColors.primary.grey.light,
    marginRight: 1,
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
