import React, {useCallback} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import CrossIcon from '../../../assets/icons/cross.svg';
import InfoIcon from '../../../assets/icons/Information.svg';
import WorldIcon from '../../../assets/icons/WorldIcon.svg';
import GreyArrowRight from '../../../assets/icons/GreyArrowRight.svg';
import {useNavigation} from '@react-navigation/native';

interface reportIssueProps {
  setReportBugModalOpen: Function;
  reportbugModalOpen: boolean;
}

export default function ReportIssueModal(props: reportIssueProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {setReportBugModalOpen, reportbugModalOpen} = props;
  const navigation = useNavigation();
  const onClickReportProblem = useCallback(() => {
    navigation.navigate('AddCategoryScreen');
    setReportBugModalOpen(p => !p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onClickSuggestFeature = useCallback(() => {
    navigation.navigate('SuggestAFeature');
    setReportBugModalOpen(p => !p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.editRegion}>
      <View style={styles.rowStyles}>
        <Text style={styles.titleText}>Need help?</Text>
        <CrossIcon onPress={() => setReportBugModalOpen(p => !p)} />
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
    width: 400,
    backgroundColor: 'white',
    display: 'flex',
    paddingBottom: 20,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  titleText: {
    fontSize: 17,
    color: 'black',
    paddingRight: 20,
    width: 330,
  },
  rowStyles: {
    flexDirection: 'row',
  },
  button: {
    width: '100%',
    borderRadius: 16,
    height: 60,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    paddingLeft: 15,
    paddingRight: 10,
    width: 270,
  },
});
