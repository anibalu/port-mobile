import React, {useEffect, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import Plus from '@assets/icons/plus.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors} from '@components/ComponentUtils';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {reactionMapping} from '@configs/reactionmapping';
import {getRichReactions} from '@utils/Storage/reactions';
import EmojiSelector from '@components/Reusable/BottomSheets/EmojiSelector';
import {getMessage} from '@utils/Storage/messages';

export const RenderReactionBar = () => {
  const [richReactions, setRichReactions] = useState<any>([]);
  const [message, setMessage] = useState<SavedMessageParams | null>(null);
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] =
    useState<boolean>(false);

  const {onReaction, setVisible, selectedMessages, chatId} = useChatContext();
  const messageId = selectedMessages[0];
  const selfReactionObj = richReactions.find(
    (reaction: {senderId: string}) => reaction.senderId === 'SELF',
  );
  const selfReaction = selfReactionObj ? selfReactionObj.reaction : false;

  const barWidth = useRef(new Animated.Value(20)).current;
  const emojiScales = useRef(
    reactionMapping.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const fetchRichReactionsAndMessage = async () => {
      const messageData = await getMessage(chatId, messageId);
      setMessage(messageData);
      // Fetch rich reactions asynchronously
      const richReactionsData = await getRichReactions(chatId, messageId);
      setRichReactions(richReactionsData);

      // Start animations
      Animated.parallel([
        Animated.timing(barWidth, {
          toValue: 270,
          duration: reactionMapping.length * 50,
          useNativeDriver: false,
        }),
        Animated.stagger(
          70,
          emojiScales.map(scale =>
            Animated.timing(scale, {
              toValue: 1,
              duration: 160,
              useNativeDriver: true,
            }),
          ),
        ),
      ]).start();
    };

    fetchRichReactionsAndMessage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReactionPress = (item: any) => {
    setVisible(false);
    message && onReaction(message, item);
  };

  return (
    <Animated.View
      style={StyleSheet.compose(styles.reactionSelection, {
        width: barWidth,
      })}>
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
                fontSizeType={FontSizeType.exs}
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
            styles.reactionsWrapper,
            styles.hasReactionMessage,
          )}
          onPress={() => {
            if (!selfReaction || reactionMapping.includes(selfReaction)) {
              setIsEmojiSelectorVisible(true);
            } else {
              setVisible(false);
              message && onReaction(message, selfReaction);
            }
          }}>
          <NumberlessText
            fontSizeType={FontSizeType.exs}
            fontType={FontType.rg}
            allowFontScaling={false}>
            {!selfReaction || reactionMapping.includes(selfReaction) ? (
              <Plus />
            ) : (
              selfReaction
            )}
          </NumberlessText>
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
              textColor={PortColors.subtitle}
              style={{textAlign: 'center'}}>
              {item[0]} {item[1] > 1 && item[1]}
            </NumberlessText>
          );
        }
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  reactionSelection: {
    overflow: 'hidden',
    backgroundColor: PortColors.primary.white,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: PortColors.stroke,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hasReactionMessage: {
    backgroundColor: PortColors.stroke,
    padding: 5,
    borderRadius: 12,
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
  },
  reactionsWrapper: {
    padding: 2,
  },
  reactionDisplay: {
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: PortColors.primary.border.dullGrey,
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 4,
    marginTop: -4,
  },
});
