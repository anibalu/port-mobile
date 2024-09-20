import React, {useEffect, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useChatContext} from '@screens/GroupChat/ChatContext';
import {reactionMapping} from '@configs/reactionmapping';
import {getRichReactions} from '@utils/Storage/reactions';
import EmojiSelector from '@components/Reusable/BottomSheets/EmojiSelector';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

export const RenderReactionBar = () => {
  const [richReactions, setRichReactions] = useState<any>([]);
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] =
    useState<boolean>(false);

  const {onReaction, chatId, selectedMessage} = useChatContext();
  const message = selectedMessage?.message;
  const messageId = selectedMessage?.message.messageId;
  const selfReactionObj = richReactions.find(
    (reaction: {senderId: string}) => reaction.senderId === 'SELF',
  );
  const selfReaction = selfReactionObj ? selfReactionObj.reaction : false;

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const barWidth = useRef(new Animated.Value(0)).current;
  const emojiScales = useRef(
    reactionMapping.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const fetchRichReactions = async () => {
      if (messageId) {
        const richReactionsData = await getRichReactions(
          chatId,
          messageId,
          false,
        );
        setRichReactions(richReactionsData);
      }
    };

    // Start animations
    Animated.parallel([
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.stagger(
        40,
        emojiScales.map(scale =>
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();
    fetchRichReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId]);

  const onReactionPress = (item: any) => {
    message && onReaction(message, item);
  };

  const svgArray = [
    {
      assetName: 'PlusIcon',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const PlusIcon = results.PlusIcon;

  return (
    <Animated.View
      style={[
        styles.reactionSelection,
        {
          transform: [{scaleX: barWidth}],
        },
      ]}>
      {reactionMapping.map((item, index) => (
        <View key={item} style={styles.reactionsWrapper}>
          <Animated.View
            style={{
              transform: [{scale: emojiScales[index]}],
            }}>
            <Pressable
              style={StyleSheet.compose(
                styles.reactionsWrapper,
                message &&
                  message.hasReaction &&
                  selfReaction === item &&
                  richReactions &&
                  styles.hasReactionMessage,
              )}
              onPress={() => onReactionPress(item)}>
              <NumberlessText
                style={{
                  textAlign: 'center',
                }}
                fontSizeType={FontSizeType.esPlus}
                fontType={FontType.rg}
                allowFontScaling={false}>
                {item}
              </NumberlessText>
            </Pressable>
          </Animated.View>
        </View>
      ))}
      <View style={styles.reactionsWrapper}>
        <Pressable
          style={StyleSheet.compose(
            !selfReaction || reactionMapping.includes(selfReaction)
              ? styles.plusReactionsWrapper
              : styles.reactionsWrapper,
            styles.hasReactionMessage,
          )}
          onPress={() => {
            if (!selfReaction || reactionMapping.includes(selfReaction)) {
              setIsEmojiSelectorVisible(true);
            } else {
              message && onReaction(message, selfReaction);
            }
          }}>
          {!selfReaction || reactionMapping.includes(selfReaction) ? (
            <PlusIcon height={24} width={24} />
          ) : (
            <NumberlessText
              style={{textAlign: 'center'}}
              fontSizeType={FontSizeType.esPlus}
              fontType={FontType.rg}
              allowFontScaling={false}>
              {selfReaction}
            </NumberlessText>
          )}
        </Pressable>
      </View>
      <EmojiSelector
        isEmojiSelectorVisible={isEmojiSelectorVisible}
        setIsEmojiSelectorVisible={setIsEmojiSelectorVisible}
        onEmojiSelected={emoji => message && onReaction(message, emoji)}
      />
    </Animated.View>
  );
};

export function RenderReactions({
  reactions,
  showReactionRibbon = () => {},
}: {
  reactions: any[];
  showReactionRibbon?: Function;
}) {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <Pressable
      style={styles.reactionDisplay}
      onPress={() => showReactionRibbon()}>
      {reactions.map(item => {
        if (item[1] > 0) {
          return (
            <NumberlessText
              key={item[0]}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}>
              {item[0]} {item[1] > 1 && item[1]}
            </NumberlessText>
          );
        }
      })}
    </Pressable>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    reactionSelection: {
      overflow: 'hidden',
      backgroundColor: colors.primary.surface,
      borderRadius: 24,
      height: 53,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      flexDirection: 'row',
      marginBottom: 4,
      alignItems: 'center',
      paddingHorizontal: 4,
      justifyContent: 'center',
    },
    hasReactionMessage: {
      backgroundColor: colors.primary.surface2,
      alignItems: 'center',
      textAlign: 'center',
      justifyContent: 'center',
    },
    reactionsWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 44,
      height: 44,
      overflow: 'hidden',
      borderRadius: 100,
    },
    plusReactionsWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 32,
      height: 32,
      overflow: 'hidden',
      borderRadius: 100,
    },
    reactionDisplay: {
      backgroundColor: colors.primary.surface2,
      overflow: 'hidden',
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: colors.primary.surface,
      paddingVertical: 4,
      paddingHorizontal: 5,
      marginTop: -4,
    },
  });
