import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import BlackAngleRight from '@assets/icons/BlackAngleRight.svg';
import PendingRequestIcon from '@assets/icons/PendingRequestNew.svg';

const SideDrawerOption = ({
  onClick,
  IconLeft,
  showPending = false,
  title,
  badge = 0,
}: {
  onClick: () => void;
  IconLeft: FC<SvgProps>;
  showPending?: boolean;
  title: string;
  badge?: number;
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.listItem}>
        {showPending ? (
          <View style={{width: 24}}>
            <PendingRequestIcon width={20} height={20} />
          </View>
        ) : (
          <View style={{width: 24}}>
            <IconLeft width={20} height={20} />
          </View>
        )}
        <View style={styles.listContentWrapper}>
          <NumberlessText
            style={{color: PortColors.primary.black}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {title}
          </NumberlessText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: PortSpacing.tertiary.uniform,
          }}>
          {badge > 0 && (
            <View
              style={StyleSheet.compose(
                badge > 9
                  ? styles.badgeWrapper
                  : styles.badgeWrapperSingleDigit,
                {
                  backgroundColor: PortColors.background,
                },
              )}>
              <NumberlessText
                style={{
                  color: PortColors.primary.blue.app,
                }}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                {badge > 99 ? '99+' : badge}
              </NumberlessText>
            </View>
          )}
          <BlackAngleRight width={20} height={20} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: PortSpacing.secondary.uniform,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: PortColors.stroke,
  },
  badgeWrapperSingleDigit: {
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContentWrapper: {
    marginLeft: PortSpacing.tertiary.left,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default SideDrawerOption;
