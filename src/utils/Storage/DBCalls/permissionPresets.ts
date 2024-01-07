import {
  PermissionPreset,
  PermissionPresetUpdate,
} from '@utils/ChatPermissionPresets/interfaces';
import {runSimpleQuery} from './dbCommon';
import {keysOfPermissions} from '@utils/ChatPermissions/interfaces';

function toBoolOrNull(a: number | null): boolean | null {
  if (a) {
    return true;
  } else if (a === 0) {
    return false;
  } else {
    return null;
  }
}

/**
 * Save a new preset. Does not handle limiting max preset count.
 * @param preset a preset to save
 */
export async function addNewPreset(preset: PermissionPreset) {
  await runSimpleQuery(
    `
    INSERT INTO permissionPresets
    (
      presetId,
      name,
      isDefault,
      notifications,
      autoDownload,
      displayPicture,
      contactSharing
    ) VALUES (?,?,?,?,?,?,?);
    `,
    [
      preset.presetId,
      preset.name,
      preset.isDefault,
      preset.notifications,
      preset.autoDownload,
      preset.displayPicture,
      preset.contactSharing,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
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
  await runSimpleQuery(
    `
    UPDATE permissionPresets
    SET
    name = COALESCE(?, name),
    notifications = COALESCE(?, notifications),
    autoDownload = COALESCE(?, autoDownload),
    displayPicture = COALESCE(?, displayPicture),
    contactSharing = COALESCE(?, contactSharing)
    WHERE presetId = ? ;
    `,
    [
      updated.name,
      updated.notifications,
      updated.autoDownload,
      updated.displayPicture,
      updated.contactSharing,
      presetId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get all saved permission presets
 * @returns All saved presets
 */
export async function getPermissionPresets(): Promise<Array<PermissionPreset>> {
  let matches: Array<PermissionPreset> = [];
  await runSimpleQuery(
    `
    SELECT *
    FROM permissionPresets ;
    `,
    [],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const obj = results.rows.item(i);
        keysOfPermissions.forEach(key => {
          obj[key] = toBoolOrNull(obj[key]);
        });
        obj.isDefault = toBoolOrNull(obj.isDefault);
        matches.push(obj);
      }
    },
  );
  return matches;
}

/**
 * Get a default permission preset
 * @returns the default preset
 */
export async function getDefaultPreset(): Promise<PermissionPreset | null> {
  let match: PermissionPreset | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM permissionPresets
    WHERE isDefault = TRUE ;
    `,
    [],
    (tx, results) => {
      if (results.rows.length > 0) {
        const obj = results.rows.item(0);
        keysOfPermissions.forEach(key => {
          obj[key] = toBoolOrNull(obj[key]);
        });
        obj.isDefault = toBoolOrNull(obj.isDefault);
        match = obj;
      }
    },
  );
  return match;
}

/**
 * Get a particular permission preset
 * takes in @param presetId
 * @returns the preset
 */
export async function getPermissionPreset(
  presetId: string,
): Promise<PermissionPreset | null> {
  let match: PermissionPreset | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM permissionPresets
    WHERE presetId = ? ;
    `,
    [presetId],
    (tx, results) => {
      if (results.rows.length > 0) {
        const obj = results.rows.item(0);
        keysOfPermissions.forEach(key => {
          obj[key] = toBoolOrNull(obj[key]);
        });
        obj.isDefault = toBoolOrNull(obj.isDefault);
        match = obj;
      }
    },
  );
  return match;
}

/**
 * Delete a saved preset
 * @param presetId preset to delete
 */
export async function deletePermissionPreset(presetId: string) {
  await runSimpleQuery(
    `
    DELETE FROM permissionPresets
    WHERE presetId = ? ;
    `,
    [presetId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Check whether permission presets pass basic usage tests
 * @returns Success of the tests
 */
// export async function testPermissionPresets(): Promise<boolean> {
//   const preset = {
//     presetId: '12345678901234567890123456789012',
//     name: 'Work',
//     notifications: false,
//     autoDownload: true,
//     displayPicture: false,
//     contactSharing: false,
//   };

//   await addNewPreset(preset);
//   let savedPresets = await getPermissionPresets();
//   if (savedPresets.length < 1 || savedPresets[0].name !== preset.name) {
//     console.log('[DBCALLS PERMISSIONPRESETS] Did not find an expected preset');
//     return false;
//   }
//   preset.notifications = true;
//   await editPreset(preset.presetId, preset);
//   savedPresets = await getPermissionPresets();
//   if (savedPresets.length < 1 || !savedPresets[0].notifications) {
//     console.log(
//       '[DBCALLS PERMISSIONPRESETS] Updating a preset failed',
//       savedPresets,
//     );
//     return false;
//   }
//   await deletePermissionPreset(preset.presetId);
//   savedPresets = await getPermissionPresets();
//   if (savedPresets.length) {
//     console.log('[DBCALLS PERMISSIONPRESETS] Found a deleted preset');
//     return false;
//   }

//   console.log('[DBCALLS PERMISSIONPRESETS] Successfully passed all tests');
//   return true;
// }
