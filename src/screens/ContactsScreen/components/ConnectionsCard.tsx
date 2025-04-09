import GradientCard from '@components/Cards/GradientCard';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {useColors} from '@components/colorGuide';
import {Spacing} from '@components/spacingGuide';
import {DEFAULT_NAME} from '@configs/constants';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import React from 'react';
import {StyleSheet, View} from 'react-native';

const ConnectionsCard = ({
  allConnections,
}: {
  allConnections: ConnectionInfo[];
}) => {
  const Colors = useColors();
  const styles = styling(Colors);

  return (
    <GradientCard style={styles.card}>
      <NumberlessText
        textColor={Colors.text.title}
        style={{marginBottom: Spacing.s}}
        fontWeight={FontWeight.md}
        fontSizeType={FontSizeType.m}>
        Port Contacts
      </NumberlessText>
      {allConnections.map((item, index) => {
        return (
          <View
            style={StyleSheet.compose(styles.list, {
              borderBottomWidth: allConnections.length - 1 === index ? 0 : 0.5,
              borderBottomColor: Colors.stroke,
            })}>
            <AvatarBox avatarSize="s" profileUri={item.pathToDisplayPic} />
            <NumberlessText
              numberOfLines={1}
              textColor={Colors.text.title}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.m}>
              {item.name || DEFAULT_NAME}
            </NumberlessText>
          </View>
        );
      })}
    </GradientCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    rowItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomColor: color.stroke,
      paddingVertical: Spacing.m,
    },
    card: {
      paddingHorizontal: Spacing.l,
      backgroundColor: color.surface,
    },
    list: {
      paddingVertical: Spacing.s,
      gap: Spacing.l,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default ConnectionsCard;
