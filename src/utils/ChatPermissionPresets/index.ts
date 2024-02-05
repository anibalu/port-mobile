import {MasterPermissions} from '@utils/ChatPermissions/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import * as storage from '@utils/Storage/permissionPresets';
import {PermissionPreset, PermissionPresetUpdate} from './interfaces';

export const defaultMasterDirectChatPermissions: MasterPermissions = {
  notifications: true,
  autoDownload: false,
  displayPicture: true,
  contactSharing: false,
  disappearingMessages: 0,
  readReceipts: false,
};

export function getDefaultMasterPermissions(): MasterPermissions {
  return {...defaultMasterDirectChatPermissions};
}

// set up default permission on app launch
export async function setUpPermissionPresetDefault(): Promise<PermissionPreset> {
  const defaultPermission = await storage.getDefaultPreset();

  const permission = {
    ...getDefaultMasterPermissions(),
    isDefault: true,
    presetId: generateRandomHexId(),
    name: 'Default',
  };
  if (!defaultPermission) {
    await storage.addNewPreset(permission);
    return permission;
  } else {
    return defaultPermission;
  }
}

// get the default permission preset
export async function getDefaultPermissionPreset(): Promise<PermissionPreset> {
  const defaultPermission = await storage.getDefaultPreset();
  if (defaultPermission) {
    return defaultPermission;
  } else {
    return await setUpPermissionPresetDefault();
  }
}

// get all permission presets
export async function getAllPermissionPresets(): Promise<PermissionPreset[]> {
  return await storage.getPermissionPresets();
}

// get master permissions(only permissions) for preset
export async function getMasterPermissionsForPreset(
  presetId: string,
): Promise<MasterPermissions> {
  const preset = await getPermissionPreset(presetId);
  return preset as MasterPermissions;
}

// get master permissions(only permissions) for all preset

export async function getMasterPermissionsForAllPresets(): Promise<
  MasterPermissions[]
> {
  const presets = await getAllPermissionPresets();
  return presets as MasterPermissions[];
}

// get a particular preset
export async function getPermissionPreset(
  presetId: string | null,
): Promise<PermissionPreset> {
  const defaultPreset = await getDefaultPermissionPreset();
  if (!presetId) {
    return defaultPreset;
  }
  const permissionPreset = await storage.getPermissionPreset(presetId);
  const returnedPreset = permissionPreset ? permissionPreset : defaultPreset;
  return returnedPreset;
}

export async function getPermissionPresetPermissions(
  presetId: string | null,
): Promise<MasterPermissions> {
  return (await getPermissionPreset(presetId)) as MasterPermissions;
}

// add a new preset
export async function addNewPermissionPreset(
  name: string,
  presetParams: MasterPermissions,
): Promise<PermissionPreset> {
  const newPresetId = generateRandomHexId();
  await storage.addNewPreset({
    ...presetParams,
    name,
    presetId: newPresetId,
  });
  return {
    ...presetParams,
    name,
    presetId: newPresetId,
  };
}

// update a preset
export async function updatePermissionPreset(
  presetId: string,
  update: PermissionPresetUpdate,
): Promise<void> {
  await storage.editPreset(presetId, update);
}

// delete a preset
export async function deletePermissionPreset(presetId: string): Promise<void> {
  await storage.deletePermissionPreset(presetId);
}

// edit the name of preset
export async function editPermissionPresetName(
  presetId: string,
  updatedName: string,
): Promise<void> {
  await updatePermissionPreset(presetId, {name: updatedName});
}

export async function deleteAllPermissionPresets() {
  const presets = await getAllPermissionPresets();
  for (let index = 0; index < presets.length; index++) {
    const preset = presets[index];
    if (!preset.isDefault) {
      await deletePermissionPreset(preset.presetId);
    }
  }
}
