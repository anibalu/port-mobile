import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';

type BulletPoint = {
  text: string;
  icon?: string; // This can be any icon (like emoji or an imported SVG)
  bold?: boolean;
  accentColor?: boolean;
};

type OnboardingMessageBubbleProps = {
  title?: string;
  points: BulletPoint[];
  titleColor?: string; // Optional custom color for background
  sender?: boolean;
  typingAnimationDelay?: number;
  showTyping?: boolean;
  typingAnimationStartDelay?: number;
};

const OnboardingMessageBubble: React.FC<OnboardingMessageBubbleProps> = ({
  title,
  points,
  titleColor,
  sender = false,
  typingAnimationDelay = 3000,
  typingAnimationStartDelay = 0,
  showTyping = false,
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors, sender, showTyping);
  // Animation references for slide and fade-in
  const translateX = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [isTyping, setIsTyping] = useState(showTyping);
  const [isVisible, setIsVisible] = useState(false);

  // Animated values for typing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Start animation and visibility after the specified start delay
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsVisible(true);

      // Start the slide and fade-in animations
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      if (showTyping) {
        setIsTyping(true); // Trigger typing animation
      }
    }, typingAnimationStartDelay);

    return () => clearTimeout(startTimeout);
  }, [showTyping, translateX, opacity, typingAnimationStartDelay]);

  // Typing animation for dots
  useEffect(() => {
    if (isTyping) {
      // Bounce effect for each dot
      const bounceDot = (dot: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -5,
              duration: 300,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };

      bounceDot(dot1, 0);
      bounceDot(dot2, 150); // Slight delay between dots
      bounceDot(dot3, 300);

      // Set timeout to stop typing and show main content after delay
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, typingAnimationDelay);

      return () => clearTimeout(typingTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping]);

  return isVisible ? (
    <Animated.View
      style={[
        styles.animatedContainer,
        !sender && {
          transform: [{translateX}],
          opacity,
        },
      ]}>
      <SimpleCard style={styles.cardContainer}>
        {isTyping ? (
          // Typing animation with 3 bouncing dots
          <View style={styles.typingContainer}>
            <Animated.View
              style={[styles.dot, {transform: [{translateY: dot1}]}]}
            />
            <Animated.View
              style={[styles.dot, {transform: [{translateY: dot2}]}]}
            />
            <Animated.View
              style={[styles.dot, {transform: [{translateY: dot3}]}]}
            />
          </View>
        ) : (
          <>
            {title && (
              <NumberlessText
                textColor={titleColor || Colors.text.primary}
                fontType={FontType.sb}
                fontSizeType={FontSizeType.m}>
                {title}
              </NumberlessText>
            )}

            {points.map((point, index) => (
              <View key={index} style={styles.bulletPointRow}>
                {point.icon && (
                  <NumberlessText
                    textColor={Colors.text.primary}
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.m}>
                    {point.icon}
                  </NumberlessText>
                )}

                <NumberlessText
                  style={styles.text}
                  textColor={
                    point.accentColor
                      ? Colors.primary.accentLight
                      : sender
                      ? Colors.primary.white
                      : Colors.text.primary
                  }
                  fontType={point.bold ? FontType.sb : FontType.rg}
                  fontSizeType={FontSizeType.m}>
                  {point.text}
                </NumberlessText>
              </View>
            ))}
          </>
        )}
      </SimpleCard>
    </Animated.View>
  ) : null; // Don't render anything until the delay passes
};

const styling = (Colors: any, sender?: boolean, showTyping?: boolean) =>
  StyleSheet.create({
    animatedContainer: {
      maxWidth: 280,
      marginLeft: sender ? 'auto' : undefined,
      marginRight: showTyping ? 'auto' : undefined,
    },
    cardContainer: {
      backgroundColor: sender ? Colors.primary.accent : Colors.primary.surface2,
      paddingHorizontal: PortSpacing.medium.uniform,
      paddingVertical: sender
        ? PortSpacing.tertiary.uniform
        : PortSpacing.secondary.uniform,
      gap: PortSpacing.medium.uniform,
    },
    bulletPointRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: PortSpacing.medium.uniform,
    },
    text: {
      flex: sender || showTyping ? 0 : 1,
    },
    // Typing animation container
    typingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: PortSpacing.tertiary.uniform,
      height: 20,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.text.subtitle,
    },
  });

export default OnboardingMessageBubble;
