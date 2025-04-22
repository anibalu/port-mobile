import { PortBundle } from '@utils/Ports/interfaces';
import PortGenerator from '@utils/Ports/SingleUsePorts/PortGenerator/PortGenerator';

export type NewPortStackParamList = {
  PortQRScreen: {
    portClass: PortGenerator;
    bundle: PortBundle;
    link: string;
  };
  PortSettingsScreen: undefined;
};
