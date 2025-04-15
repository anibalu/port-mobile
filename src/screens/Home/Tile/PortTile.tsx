import React, {ReactNode, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {useColors} from '@components/colorGuide';
import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';

import {ChatType, ConnectionInfo} from '@utils/Storage/DBCalls/connections';

import {useTheme} from 'src/context/ThemeContext';

import RenderTimestamp from './RenderTimestamp';

export interface ChatTileProps extends ConnectionInfo {
  expired?: boolean;
  isReadPort?: boolean;
}

function FailureText(_: any): ReactNode {
  const colors = useColors();
  return (
    <NumberlessText
      ellipsizeMode="tail"
      numberOfLines={2}
      fontType={FontType.rg}
      style={{
        flex: 1,
      }}
      fontSizeType={FontSizeType.m}
      textColor={colors.red}>
      Failed to add this contact. You used an expired Port.
    </NumberlessText>
  );
}

function PendingText({isGroup}: {isGroup: boolean}): ReactNode {
  return (
    <NumberlessText
      ellipsizeMode="tail"
      numberOfLines={1}
      fontType={FontType.rg}
      style={{
        flex: 1,
      }}
      fontSizeType={FontSizeType.m}
      textColor={'red'}>
      {isGroup ? 'Adding new group...' : 'Adding new contact'}
    </NumberlessText>
  );
}

export default function PortTile(
  initialProps: ConnectionInfo & {
    isReadPort: true;
    expired: boolean;
    setSelectedPortProps: (x: any) => void;
  },
): ReactNode {
  const [props, setProps] = useState(initialProps);
  useMemo(() => {
    setProps(initialProps);
  }, [initialProps]);

  const selectPort = (): void => {
    props.setSelectedPortProps(props);
    return;
  };

  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const styles = styling(Colors, themeValue);

  return (
    <View style={{...styles.container, justifyContent: 'flex-end'}}>
      <View style={styles.container}>
        <Pressable
          style={styles.tile}
          onPress={selectPort}
          pointerEvents="box-only">
          <View style={styles.avatarArea}>
            <AvatarBox profileUri={props.pathToDisplayPic} avatarSize="s+" />
          </View>
          <View style={styles.nonAvatarArea}>
            <View style={styles.nameAndTimestamp}>
              <View style={styles.nameContainer}>
                <NumberlessText
                  textColor={Colors.primary.mainelements}
                  style={{flexShrink: 1}}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  fontType={FontType.md}
                  fontSizeType={FontSizeType.l}>
                  {props.name || 'New contact'}
                </NumberlessText>
              </View>
              <RenderTimestamp timestamp={props.timestamp} />
            </View>
            <View style={styles.textAndStatus}>
              {
                //if not authenticated yet, could be a read port
                props.expired ? (
                  <FailureText />
                ) : (
                  <PendingText
                    isGroup={props.connectionType === ChatType.group}
                  />
                )
              }
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styling = (colors: any, themeValue: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: screen.width,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
    },
    checkboxContainer: {
      height: '100%',
      paddingLeft: 18,
      alignItems: 'flex-start',
      justifyContent: 'center',
      position: 'absolute',
      left: 0,
      flex: 1,
      width: screen.width,
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginHorizontal: PortSpacing.tertiary.uniform,
      paddingTop: PortSpacing.secondary.uniform,
      overflow: 'hidden',
    },
    selectionOverlaySelectionMode: {
      position: 'absolute',
      flex: 1,
      right: PortSpacing.tertiary.uniform,
      height: '100%',
      backgroundColor: colors.primary.accentOverlay,
    },
    avatarArea: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: PortSpacing.tertiary.uniform,
      alignSelf: 'center',
      paddingBottom: PortSpacing.medium.uniform,
    },
    nonAvatarArea: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      borderBottomColor: colors.primary.stroke,
      borderBottomWidth: 0.25,
      flex: 1,
      paddingBottom: PortSpacing.medium.uniform,
    },
    nameAndTimestamp: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    textAndStatus: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
    },
    nameContainer: {
      overflow: 'hidden',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: PortSpacing.tertiary.right,
    },
    labelWrapper: {
      flexBasis: 45,
      flexGrow: 1,
      alignItems: 'flex-start',
    },
    new: {
      backgroundColor: colors.primary.accent,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      minWidth: 20,
    },
  });
