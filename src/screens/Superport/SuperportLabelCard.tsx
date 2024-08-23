import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import ToggleSwitch from 'toggle-switch-react-native';
import SuperportLinkedFolderCard from './SuperportLinkedFolderCard';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';

const SuperportLabelCard = ({
  autoFolderCreateToggle,
  createdFolderName,
  permissionsArray,
  label,
  chosenFolder,
  showEmptyLabelError,
  setOpenModal,
  onChooseFolder,
  onEditFolder,
  autoCreateFolder,
  setAutoCreateFolder,
}: {
  createdFolderName: string;
  autoCreateFolder: boolean;
  setAutoCreateFolder: (x: boolean) => void;
  permissionsArray: PermissionsStrict;
  autoFolderCreateToggle: boolean;
  chosenFolder: FolderInfo;
  onEditFolder: () => void;
  onChooseFolder: () => void;
  showEmptyLabelError: boolean;
  label: string;
  setOpenModal: (p: boolean) => void;
}) => {
  const onToggleChange = () => {
    setAutoCreateFolder(p => !p);
  };
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'FilterIcon',
      light: require('@assets/light/icons/Label.svg').default,
      dark: require('@assets/dark/icons/Label.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const FilterIcon = results.FilterIcon;

  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
        gap: PortSpacing.intermediate.bottom,
      }}>
      <View style={styles.headngWrapper}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <FilterIcon width={20} height={20} />
          <NumberlessText
            style={{
              color: Colors.text.primary,
              marginLeft: PortSpacing.tertiary.left,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.l}>
            Superport name *
          </NumberlessText>
        </View>
        <View style={{marginTop: PortSpacing.tertiary.bottom}}>
          <NumberlessText
            style={{color: Colors.text.subtitle}}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            Adding a name to this Superport makes it easy to recognize it in
            your Superports tab.
          </NumberlessText>
        </View>
      </View>

      <View style={showEmptyLabelError && styles.inputcard}>
        <EditableInputCard
          setOpenModal={setOpenModal}
          text={label}
          placeholder={'Ex. "My Website superport"'}
        />
      </View>
      {autoFolderCreateToggle && (
        <View
          style={{
            gap: PortSpacing.tertiary.uniform,
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          {showEmptyLabelError && (
            <NumberlessText
              style={styles.errorContainer}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.s}>
              This field is mandatory.
            </NumberlessText>
          )}
          <NumberlessText
            style={{flex: 1}}
            textColor={Colors.text.subtitle}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            Automatically create a new folder and link it to this Superport.
          </NumberlessText>
          <ToggleSwitch
            isOn={autoCreateFolder}
            onColor={Colors.primary.darkGreen}
            offColor={Colors.primary.lightgrey}
            onToggle={onToggleChange}
          />
        </View>
      )}
      {(createdFolderName || label || !autoCreateFolder) && (
        <SuperportLinkedFolderCard
          permissionsArray={permissionsArray}
          chosenFolder={chosenFolder}
          onEditFolder={onEditFolder}
          onChooseFolder={onChooseFolder}
          toggleState={autoCreateFolder}
          folderName={createdFolderName || label}
          autoFolderCreateToggle={autoFolderCreateToggle}
        />
      )}
    </SimpleCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    errorContainer: {
      position: 'absolute',
      top: -PortSpacing.intermediate.top,
      left: 0,
      color: color.primary.red,
      paddingLeft: PortSpacing.tertiary.left,
      paddingTop: 2,
    },
    inputcard: {
      borderWidth: 1,
      borderColor: color.primary.red,
      borderRadius: 16,
      overflow: 'hidden',
    },
    headngWrapper: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
  });

export default SuperportLabelCard;
