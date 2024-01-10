import {PortColors} from '@components/ComponentUtils';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useEffect, useState} from 'react';

import Delete from '@assets/icons/deleteRed.svg';
import {GenericButton} from '@components/GenericButton';
import GenericModal from '@components/GenericModal';
import GenericTopBar from '@components/GenericTopBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {MAX_PERMISSION_PRESETS} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import {
  addNewPermissionPreset,
  deletePermissionPreset,
  editPermissionPresetName,
  getAllPermissionPresets,
  getDefaultMasterPermissions,
  getDefaultPermissionPreset,
  getPermissionPreset,
  updatePermissionPreset,
} from '@utils/ChatPermissionPresets';
import {PermissionPreset} from '@utils/ChatPermissionPresets/interfaces';
import {getLabelByTimeDiff} from '@utils/ChatPermissions';
import {
  booleanKeysOfDirectPermissions,
  booleanKeysOfGroupPermissions,
  booleanKeysOfPermissions,
  numberKeysOfPermissions,
} from '@utils/ChatPermissions/interfaces';
import {processName} from '@utils/Profile';
import {ScrollView, StyleSheet, View} from 'react-native';
import AddNew from './AddNew';
import DeleteModal from './DeleteModal';
import DisappearingMessage from './DisappearingMessage';
import Permissions from './Permissions';
import {deepEqual} from './deepEqual';

const Presets = () => {
  const navigation = useNavigation();

  const [availablePresets, setAvailablePresets] = useState<PermissionPreset[]>(
    [],
  );
  const filters = ['All', 'Direct Chats', 'Groups'];
  const [loading, setLoading] = useState(false);

  // load all permission presets
  useEffect(() => {
    (async () => {
      const defaultPreset = await getDefaultPermissionPreset();
      const presets = await getAllPermissionPresets();
      setAvailablePresets(presets);
      setSelectedPreset(defaultPreset);
      setModifiedPreset(defaultPreset);
    })();
  }, []);

  // to add a new preset, only need to enter
  // the name of the preset
  const addNewPreset = async (name: string) => {
    let newPreset: PermissionPreset | null = null;
    const presets = await getAllPermissionPresets();
    if (presets.length > MAX_PERMISSION_PRESETS) {
      //throw error
    } else {
      newPreset = await addNewPermissionPreset(
        name,
        getDefaultMasterPermissions(),
      );
    }
    setAvailablePresets(await getAllPermissionPresets());
    if (newPreset) {
      setSelectedPreset({...newPreset});
      setModifiedPreset({...newPreset});
    }
  };
  const editExistingPresetName = async (presetId: string, name: string) => {
    const newName = processName(name);
    await editPermissionPresetName(presetId, newName);
    setAvailablePresets(await getAllPermissionPresets());
    const editedPreset = await getPermissionPreset(presetId);
    setSelectedPreset({...editedPreset});
    setModifiedPreset({...editedPreset});
  };
  const deletePreset = async () => {
    if (selectedPreset) {
      await deletePermissionPreset(selectedPreset.presetId);
    }
    setAvailablePresets(await getAllPermissionPresets());
    const defaultPreset = await getDefaultPermissionPreset();
    setSelectedPreset({...defaultPreset});
    setModifiedPreset({...defaultPreset});
  };

  // list of filters
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDisappearClicked, setIsDisappearClicked] = useState(false);

  // if edit(long press) is pressed
  const [isEdit, setIsEdit] = useState(false);

  // preset selected work, personal, etc
  const [selectedPreset, setSelectedPreset] = useState<PermissionPreset | null>(
    null,
  );
  const [modifiedPreset, setModifiedPreset] = useState<PermissionPreset | null>(
    null,
  );
  const [selectedFilter, setSelectedFilter] = useState<string>('All'); // subcategory selected  new port or group

  // utils for styling of preset
  const isPresetSelected = (presetId: string) =>
    selectedPreset?.presetId === presetId;

  const getPresetStyle = (presetId: string) =>
    isPresetSelected(presetId)
      ? styles.categoryTileActive
      : styles.categoryTileInactive;

  // utils for styling of filter

  const isSubcategorySelected = (item: string) => selectedFilter === item;

  const getSubcategoryStyle = (item: string) =>
    isSubcategorySelected(item)
      ? styles.subcategoryTileActive
      : styles.subcategoryTileInactive;

  // util for mapping over particular filters
  const mappingObject = () => {
    if (selectedFilter === 'All') {
      return [...booleanKeysOfPermissions, ...numberKeysOfPermissions];
    } else if (selectedFilter === 'Direct Chats') {
      return [...booleanKeysOfDirectPermissions, ...numberKeysOfPermissions];
    } else if (selectedFilter === 'Groups') {
      return [...booleanKeysOfGroupPermissions, ...numberKeysOfPermissions];
    }
  };

  const duration = modifiedPreset?.disappearingMessages;
  const timelabel = getLabelByTimeDiff(duration);

  // util for rendering the toggle settings for the particular category
  // and subcategory
  const renderPermissionValues = (preset: PermissionPreset | null) => {
    if (!preset) {
      return null;
    }

    const masterKeys = mappingObject();
    return (
      <Permissions
        masterKeys={masterKeys}
        setIsDisappearClicked={setIsDisappearClicked}
        timelabel={timelabel}
        preset={preset}
        setModifiedPreset={setModifiedPreset}
      />
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <GenericTopBar
        title={`Create your own presets (${availablePresets.length}/${MAX_PERMISSION_PRESETS})`}
        onBackPress={() => {
          navigation.goBack();
        }}
        barStyle={{backgroundColor: PortColors.primary.grey.light}}
        titleStyle={{color: PortColors.text.title}}
      />
      <ScrollView style={{marginBottom: 60}}>
        <View
          style={{
            backgroundColor: PortColors.primary.grey.light,
            paddingBottom: 20,
            paddingHorizontal: 25,
          }}>
          <View style={styles.tabcontainer}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              style={styles.presetext}>
              Permission preset set to:
            </NumberlessText>
            {availablePresets.length < MAX_PERMISSION_PRESETS && (
              <GenericButton
                buttonStyle={styles.addnewbutton}
                textStyle={styles.addnewtext}
                onPress={() => {
                  if (availablePresets.length < MAX_PERMISSION_PRESETS) {
                    setIsEdit(false);
                    setIsModalVisible(true);
                  }
                }}>
                + Add new
              </GenericButton>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              rowGap: 8,
              columnGap: 8,
            }}>
            {availablePresets.map(preset => {
              return (
                <NumberlessText
                  key={preset.presetId}
                  onLongPress={() => {
                    setIsEdit(true);
                    setIsModalVisible(true);
                  }}
                  onPress={() => {
                    setModifiedPreset(preset);
                    setSelectedPreset(preset);
                  }}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}
                  style={StyleSheet.compose(
                    styles.categoryStyle,
                    getPresetStyle(preset.presetId),
                  )}>
                  {preset.name}
                </NumberlessText>
              );
            })}
          </View>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            style={styles.longpresstext}>
            *long press preset to edit name
          </NumberlessText>
        </View>

        <NumberlessText
          style={styles.filtertext}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          Filter by
        </NumberlessText>

        <View style={styles.subcategorycontainer}>
          {filters.map(subcategory => {
            return (
              <NumberlessText
                key={subcategory}
                onPress={() => setSelectedFilter(subcategory)}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}
                style={StyleSheet.compose(
                  styles.subcategoryStyle,
                  getSubcategoryStyle(subcategory),
                )}>
                {subcategory}
              </NumberlessText>
            );
          })}
        </View>

        {renderPermissionValues(modifiedPreset)}
      </ScrollView>
      <View style={styles.buttonrow}>
        {selectedPreset && !selectedPreset.isDefault && (
          <GenericButton
            IconLeft={Delete}
            buttonStyle={styles.deletebutton}
            textStyle={styles.deletebuttontext}
            onPress={() => setIsDeleteModalVisible(true)}>
            Delete preset
          </GenericButton>
        )}
        <GenericButton
          disabled={deepEqual(selectedPreset, modifiedPreset)}
          buttonStyle={
            deepEqual(selectedPreset, modifiedPreset)
              ? styles.disabled
              : styles.save
          }
          loading={loading}
          onPress={async () => {
            if (modifiedPreset?.presetId) {
              setLoading(true);
              await updatePermissionPreset(modifiedPreset.presetId, {
                ...modifiedPreset,
              });
              setSelectedPreset({...modifiedPreset});
              setAvailablePresets(await getAllPermissionPresets());
              setLoading(false);
            }
          }}>
          Save
        </GenericButton>
      </View>

      <GenericModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(p => !p);
        }}>
        <AddNew
          isEdit={isEdit}
          selectedCategory={selectedPreset}
          addNewPreset={addNewPreset}
          editExistingPresetName={editExistingPresetName}
          setIsModalVisible={setIsModalVisible}
          setSelectedCategory={setSelectedPreset}
        />
      </GenericModal>
      <GenericModal
        visible={isDeleteModalVisible}
        onClose={() => {
          setIsDeleteModalVisible(p => !p);
        }}>
        <DeleteModal
          deletePreset={deletePreset}
          setIsDeleteModalVisible={setIsDeleteModalVisible}
        />
      </GenericModal>
      <GenericModal
        visible={isDisappearClicked}
        onClose={() => {
          setIsDisappearClicked(p => !p);
        }}>
        <DisappearingMessage
          setModifiedPreset={setModifiedPreset}
          selected={timelabel}
          setIsDisappearClicked={setIsDisappearClicked}
        />
      </GenericModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: PortColors.primary.white,
  },
  filtertext: {
    color: PortColors.primary.blue.app,
    marginTop: 20,
    marginLeft: 20,
  },
  buttonrow: {
    flexDirection: 'row',
    height: 60,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 10,
  },
  deletebutton: {
    flex: 1,
    borderWidth: 1,
    borderColor: PortColors.primary.red.error,
    backgroundColor: 'white',
    marginRight: 20,
  },
  deletebuttontext: {
    color: PortColors.primary.red.error,
  },
  save: {
    flex: 1,
  },
  disabled: {
    flex: 1,
    backgroundColor: '#C9C9C9',
  },
  tabcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    backgroundColor: PortColors.primary.grey.light,
    alignItems: 'center',
  },
  subcategorycontainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 15,
    rowGap: 16,
    columnGap: 8,
    marginBottom: 40,
  },

  categoryStyle: {
    borderRadius: 8,
    padding: 8,
    overflow: 'hidden',
  },
  categoryTileActive: {
    backgroundColor: PortColors.primary.blue.app,
    color: PortColors.text.primaryWhite,
  },
  categoryTileInactive: {
    backgroundColor: PortColors.primary.white,
    color: PortColors.text.secondary,
  },

  subcategoryStyle: {
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  subcategoryTileActive: {
    backgroundColor: PortColors.primary.blue.app,
    color: PortColors.text.primaryWhite,
  },
  subcategoryTileInactive: {
    backgroundColor: PortColors.primary.grey.light,
    color: PortColors.text.title,
  },
  addnewbutton: {
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PortColors.primary.blue.app,
  },
  addnewtext: {
    color: PortColors.primary.blue.app,
  },
  textStyle: {
    color: PortColors.primary.black,
  },
  presetext: {
    color: PortColors.text.secondary,
  },
  longpresstext: {
    color: PortColors.text.secondary,
    alignSelf: 'flex-end',
    marginTop: 15,
  },
  permissiontile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 30,
  },
});

export default Presets;
