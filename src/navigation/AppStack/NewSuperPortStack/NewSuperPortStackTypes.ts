import { DirectSuperportBundle } from '@utils/Ports/interfaces';
import SuperPortGenerator from '@utils/Ports/SuperPorts/SuperPortGenerator/SuperPortGenerator';

export type NewSuperPortStackParamList = {
  SuperPortQRScreen: {
    superPortClass: SuperPortGenerator;
    bundle: DirectSuperportBundle;
    link: string;
  };
  SuperPortSettingsScreen: undefined;
};
