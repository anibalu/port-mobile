import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import InfoIcon from '@assets/icons/Information.svg';
import WorldIcon from '@assets/icons/WorldIcon.svg';
import GreyArrowRight from '@assets/icons/GreyArrowRight.svg';
import {useNavigation} from '@react-navigation/native';
import {NumberlessMediumText} from '@components/NumberlessText';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import Notch from '@components/ConnectionModal/Notch';

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
        <NumberlessMediumText style={styles.titleText}>
          Need help?
        </NumberlessMediumText>
      </View>
      <Pressable style={styles.button} onPress={onClickReportProblem}>
        <InfoIcon />
        <Text style={styles.buttonText}>Report a problem</Text>
        <GreyArrowRight />
      </Pressable>
      <Pressable style={styles.button} onPress={onClickSuggestFeature}>
        <WorldIcon />
        <Text style={styles.buttonText}>Suggest a feature</Text>
        <GreyArrowRight />
      </Pressable>
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
    ...FontSizes[15].medium,
    color: 'black',
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
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    paddingLeft: 15,
    paddingRight: 10,
    width: 160,
  },
});
