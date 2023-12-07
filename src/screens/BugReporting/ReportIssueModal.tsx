import React, {useCallback} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import CrossIcon from '@assets/icons/cross.svg';
import InfoIcon from '@assets/icons/Information.svg';
import WorldIcon from '@assets/icons/WorldIcon.svg';
import GreyArrowRight from '@assets/icons/GreyArrowRight.svg';
import {useNavigation} from '@react-navigation/native';
import {NumberlessMediumText} from '@components/NumberlessText';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';

interface reportIssueProps {
  setReportBugModalOpen: Function;
  reportbugModalOpen: boolean;
}

export default function ReportIssueModal(props: reportIssueProps) {
  const {setReportBugModalOpen} = props;
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
        <NumberlessMediumText style={styles.titleText}>
          Need help?
        </NumberlessMediumText>
        <CrossIcon
          style={{top: -8}}
          onPress={() => setReportBugModalOpen(p => !p)}
        />
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
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  titleText: {
    ...FontSizes[15].medium,
    color: 'black',
    paddingHorizontal: 15,
    width: 330,
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
    borderWidth: 2,
    borderColor: PortColors.primary.grey.light,
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
