import {
  PermissionPreset,
  PermissionPresetUpdate,
} from '@utils/ChatPermissionPresets/interfaces';

import * as dbCalls from './DBCalls/permissionPresets';

/**
 * Save a new preset. Does not handle limiting max preset count.
 * @param preset a preset to save
 */

export async function addNewPreset(preset: PermissionPreset) {
  await dbCalls.addNewPreset(preset);
}

/**
 * Edit an existing preset
 * @param presetId preset to edit
 * @param updated the updated values for the preset
 */
export async function editPreset(
  presetId: string,
  updated: PermissionPresetUpdate,
) {
  await dbCalls.editPreset(presetId, updated);
}

/**
 * Get all saved permission presets
 * @returns All saved presets
 */
export async function getPermissionPresets(): Promise<Array<PermissionPreset>> {
  return await dbCalls.getPermissionPresets();
}

/**
 * Get a particular permission preset
 * takes in @param presetId
 * @returns the preset
 */
export async function getPermissionPreset(
  presetId: string,
): Promise<PermissionPreset | null> {
  return await dbCalls.getPermissionPreset(presetId);
}

/**
 * Get a default permission preset
 * @returns the default preset
 */
export async function getDefaultPreset(): Promise<PermissionPreset | null> {
  return await dbCalls.getDefaultPreset();
}

/**
 * Delete a saved preset
 * @param presetId preset to delete
 */
export async function deletePermissionPreset(presetId: string) {
  await dbCalls.deletePermissionPreset(presetId);
}
