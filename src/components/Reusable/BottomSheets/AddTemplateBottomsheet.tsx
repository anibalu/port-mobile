import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';

import {generateRandomHexId} from '@utils/IdGenerator';
import {TemplateParams} from '@utils/Storage/DBCalls/templates';
import {addTemplate, editTemplate} from '@utils/Storage/templates';

import LargeTextInput from '../Inputs/LargeTextInput';
import SimpleInput from '../Inputs/SimpleInput';
import PrimaryButton from '../LongButtons/PrimaryButton';

import PrimaryBottomSheet from './PrimaryBottomSheet';

const AddTemplateBottomsheet = ({
  visible,
  templatetext,
  templatetitle,
  onClose,
  scope, //scope is used to determine whether we want to add or edit a template
  id, //templateid
  onSendMessage,
  loadTemplates,
}: {
  visible: boolean;
  onClose: () => void;
  templatetext?: string;
  templatetitle?: string;
  scope: 'add' | 'edit';
  id?: string;
  onSendMessage: (template: TemplateParams) => void;
  loadTemplates: () => Promise<void>;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const [title, setTitle] = useState(templatetitle || '');
  const [desc, setDesc] = useState(templatetext || '');
  const onSave = async () => {
    if (scope === 'add') {
      await addTemplate({
        templateId: generateRandomHexId(),
        template: desc,
        title: title,
      });
      setDesc('');
      setTitle('');
    } else {
      if (id) {
        await editTemplate({
          templateId: id,
          template: desc,
          title: title,
        });
      }
    }
    await loadTemplates();
    onClose();
  };

  const onSaveAndSend = async () => {
    if (scope === 'add') {
      const templateId = generateRandomHexId();
      await addTemplate({
        templateId: templateId,
        template: desc,
        title: title,
      });
      setDesc('');
      setTitle('');
      onSendMessage({
        templateId: templateId,
        template: desc,
        title: title,
      });
    } else {
      if (id) {
        await editTemplate({
          templateId: id,
          template: desc,
          title: title,
        });
        onSendMessage({
          templateId: id,
          template: desc,
          title: title,
        });
      }
    }
    onClose();
  };
  return (
    <PrimaryBottomSheet
      bgColor="g"
      showClose={false}
      visible={visible}
      title={scope === 'add' ? 'Create your template' : 'Edit your template'}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
        <SimpleInput
          placeholderText="Title"
          setText={setTitle}
          text={title}
          bgColor="w"
        />
        <View style={{marginTop: 8}} />
        <LargeTextInput
          maxLength={1000}
          setText={setDesc}
          text={desc}
          bgColor="w"
          placeholderText="Type your template message"
        />

        <View style={{marginTop: PortSpacing.secondary.top, gap: 8}}>
          <PrimaryButton
            buttonText="Save"
            primaryButtonColor="b"
            isLoading={false}
            disabled={!title || !desc}
            onClick={onSave}
          />
          <PrimaryButton
            primaryButtonColor="b"
            onClick={onSaveAndSend}
            buttonText="Save and send"
            isLoading={false}
            disabled={!title || !desc}
          />
        </View>
      </View>
    </PrimaryBottomSheet>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    mainWrapper: {
      flexDirection: 'column',
      width: '100%',
      marginTop: PortSpacing.intermediate.top,
      ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
    },
    title: {
      fontFamily: FontType.md,
      fontSize: FontSizeType.l,
      fontWeight: getWeight(FontType.rg),
      color: Colors.text.primary,
      marginLeft: PortSpacing.tertiary.left,
    },
    subDescText: {
      color: Colors.text.subtitle,
      marginBottom: PortSpacing.tertiary.bottom,
      marginLeft: 4,
      flex: 1,
    },
    descriptionWrapper: {
      flexDirection: 'column',
      overflow: 'hidden',
    },
  });

export default AddTemplateBottomsheet;
