import Delete from '@assets/icons/DeleteIcon.svg';
import Disconnect from '@assets/icons/Disconnect.svg';
import MoveFolder from '@assets/icons/FolderBlack.svg';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ChatTileProps} from '@components/ChatTile/ChatTile';
export function ChatActionsBar({
  selectedConnections,
  openModal,
  openMoveToFolder,
}: {
  selectedConnections: ChatTileProps[];
  openModal: () => void;
  openMoveToFolder: () => void;
}): ReactNode {
  return (
    <>
      {selectedConnections[0] && (
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
          {selectedConnections.length > 1 ? (
            <View style={styles.multiSelectedContainer}>
              <View style={styles.optionContainer}>
                <Pressable style={styles.optionBox} onPress={openMoveToFolder}>
                  <MoveFolder height={20} width={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={PortColors.title}>
                    Move to a folder
                  </NumberlessText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.singleSelectedContainer}>
              <View style={styles.optionContainer}>
                <Pressable style={styles.optionBox} onPress={openMoveToFolder}>
                  <MoveFolder height={20} width={20} />
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={PortColors.title}>
                    Move to a folder
                  </NumberlessText>
                </Pressable>
              </View>
              <View style={styles.optionContainer}>
                <Pressable style={styles.optionBox} onPress={openModal}>
                  {selectedConnections[0].disconnected ? (
                    <Delete width={20} height={20} />
                  ) : (
                    <Disconnect width={20} height={20} />
                  )}
                  <NumberlessText
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}
                    textColor={PortColors.primary.red.error}>
                    {selectedConnections[0].disconnected
                      ? 'Delete History'
                      : selectedConnections[0].authenticated
                      ? 'Disconnect Chat'
                      : 'Stop adding'}
                  </NumberlessText>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: PortSpacing.tertiary.top,
    paddingBottom: 10,
    backgroundColor: PortColors.primary.white,
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
