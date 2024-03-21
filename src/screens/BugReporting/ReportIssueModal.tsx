import React from 'react';
import {StyleSheet, View} from 'react-native';

import InfoIcon from '@assets/icons/Information.svg';
import WorldIcon from '@assets/icons/WorldIcon.svg';
import GreyArrowRight from '@assets/icons/GreyArrowRight.svg';
import {useNavigation} from '@react-navigation/native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors, screen} from '@components/ComponentUtils';
import Notch from '@components/Modals/Notch';
import {GenericButton} from '@components/GenericButton';

interface reportIssueProps {
  setReportBugModalOpen: Function;
}

export default function ReportIssueModal(props: reportIssueProps) {
  const {setReportBugModalOpen} = props;
  const navigation = useNavigation();
  const onClickReportProblem = () => {
    navigation.navigate('AddCategoryScreen');
    setReportBugModalOpen(p => !p);
  };
  const onClickSuggestFeature = () => {
    navigation.navigate('SuggestAFeature');
    setReportBugModalOpen(p => !p);
  };

  return (
    <View style={styles.editRegion}>
      <Notch />

      <View style={styles.rowStyles}>
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.primary}
          style={styles.titleText}>
          Need help?
        </NumberlessText>
      </View>
      <GenericButton
        textStyle={styles.buttonText}
        buttonStyle={styles.button}
        IconLeft={InfoIcon}
        iconSizeRight={15}
        iconSize={50}
        IconRight={GreyArrowRight}
        onPress={onClickReportProblem}>
        Report a problem
      </GenericButton>
      <GenericButton
        buttonStyle={styles.button}
        textStyle={styles.buttonText}
        iconSizeRight={15}
        iconSize={50}
        IconLeft={WorldIcon}
        IconRight={GreyArrowRight}
        onPress={onClickSuggestFeature}>
        Suggest a feature
      </GenericButton>
    </View>
  );
}

const styles = StyleSheet.create({
  editRegion: {
    backgroundColor: 'white',
    flexDirection: 'column',
    width: screen.width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 30,
  },
  titleText: {
    width: 330,
    marginTop: -10,
  },
  rowStyles: {
    flexDirection: 'row',
  },
  button: {
    width: screen.width - 48,
    borderRadius: 16,
    height: 70,
    marginTop: 17,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: PortColors.primary.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: PortColors.primary.grey.light,
  },
  buttonText: {
    color: PortColors.text.primary,
    fontSize: 14,
    fontWeight: '400',
    paddingLeft: 15,
    paddingRight: 10,
    width: 160,
  },
});
