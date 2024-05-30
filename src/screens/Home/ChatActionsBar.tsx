import Delete from '@assets/icons/DeleteIcon.svg';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ChatTileProps} from '@components/ChatTile/ChatTile';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
export function ChatActionsBar({
  selectedConnections,
  openModal,
  openMoveToFolder,
}: {
  selectedConnections: ChatTileProps[];
  openModal: () => void;
  openMoveToFolder: () => void;
}): ReactNode {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'AddFolder',
      light: require('@assets/light/icons/AddFolder.svg').default,
      dark: require('@assets/dark/icons/AddFolder.svg').default,
    },
    {
      assetName: 'Disconnect',
      light: require('@assets/light/icons/Disconnect.svg').default,
      dark: require('@assets/dark/icons/Disconnect.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const AddFolder = results.AddFolder;
  const Disconnect = results.Disconnect;

  // Check if all connections are un authenticated
  const allUnAuthenticated = selectedConnections.every(
    connection => !connection.authenticated,
  );
  // Check if all connections are disconnected
  const allDisconnected = selectedConnections.every(
    connection => connection.disconnected,
  );
  // Check if all connections are not disconnected
  const allNotDisconnected = selectedConnections.every(
    connection => !connection.disconnected,
  );
  return (
    <>
      {selectedConnections.length > 0 && (
        <View
          style={
            isIOS
              ? {
                  ...styles.parentContainer,
                  paddingBottom: 20,
                  marginBottom: -20,
                }
              : {
                  ...styles.parentContainer,
                }
          }>
          <View style={styles.singleSelectedContainer}>
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={openMoveToFolder}>
                <AddFolder height={20} width={20} />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={Colors.text.primary}>
                  Move to a folder
                </NumberlessText>
              </Pressable>
            </View>
            {allDisconnected && (
              <View style={styles.optionContainer}>
                <Pressable style={styles.optionBox} onPress={openModal}>
                  <Delete width={20} height={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={Colors.primary.red}>
                    Delete history
                  </NumberlessText>
                </Pressable>
              </View>
            )}
            {allNotDisconnected && (
              <View style={styles.optionContainer}>
                <Pressable style={styles.optionBox} onPress={openModal}>
                  <Disconnect width={20} height={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={Colors.primary.red}>
                    {selectedConnections.length > 1
                      ? 'Disconnect chats'
                      : 'Disconnect chat'}
                  </NumberlessText>
                </Pressable>
              </View>
            )}
            {!allNotDisconnected && !allDisconnected && allUnAuthenticated && (
              <View style={styles.optionContainer}>
                <Pressable style={styles.optionBox} onPress={openModal}>
                  <Disconnect width={20} height={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={Colors.primary.red}>
                    Stop adding
                  </NumberlessText>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    parentContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: PortSpacing.tertiary.top,
      paddingBottom: 10,
      backgroundColor: colors.primary.surface,
    },
    singleSelectedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    multiSelectedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    optionContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionBox: {
      height: 55,
      gap: PortSpacing.tertiary.uniform,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },
    optionText: {
      fontSize: 12,
    },
  });
