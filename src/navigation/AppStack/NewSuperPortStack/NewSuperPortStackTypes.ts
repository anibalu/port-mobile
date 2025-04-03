import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';

export type NewSuperPortStackParamList = {
  SuperPortQRScreen: {
    portId?: string;
    label?: string;
    limit?: number;
    permissions?: PermissionsStrict;
    folderId?: string;
  };
  SuperPortSettingsScreen: undefined;
};
