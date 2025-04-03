import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';

export type NewPortStackParamList = {
  PortQRScreen: {
    portId?: string;
    contactName?: string;
    permissions?: PermissionsStrict;
    folderId?: string;
  };
  PortSettingsScreen: undefined;
};
