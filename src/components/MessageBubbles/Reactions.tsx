import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {reactionMapping} from '@configs/reactionmapping';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

export const RenderReactionBar = ({
  handleReaction,
  message,
  setFocusVisible,
  richReactions,
}: {
  setFocusVisible: (visible: boolean) => void;
  handleReaction: (arg0: any, arg1: string) => void;
  message: SavedMessageParams;
  richReactions: any;
}) => {
  const selfReactionObj = richReactions.find(
    (reaction: {senderId: string}) => reaction.senderId === 'SELF',
  );
  const selfReaction = selfReactionObj ? selfReactionObj.reaction : false;
  return (
    <View style={styles.reactionSelection}>
      {reactionMapping.map(item => (
        <View key={item} style={styles.reactionsWrapper}>
          <Pressable
            style={StyleSheet.compose(
              styles.reactionsWrapper,
              message.hasReaction &&
                selfReaction === item &&
                richReactions && {
                  backgroundColor: PortColors.stroke,
                  padding: 5,
                  borderRadius: 12,
                  alignItems: 'center',
                  textAlign: 'center',
                  justifyContent: 'center',
                },
            )}
            key={item}
            onPress={() => {
              setFocusVisible(false), handleReaction(message, item);
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.exs}
              fontType={FontType.rg}
              allowFontScaling={false}>
              {item}
            </NumberlessText>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export function RenderReactions({
  reactions,
  showReactionRibbon = () => {},
}: {
  reactions: any[];
  showReactionRibbon?: Function;
}): ReactNode {
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
    height: 50,
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
