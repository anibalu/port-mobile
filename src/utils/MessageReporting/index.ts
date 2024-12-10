export {createLineMessageReport} from './line';
export {createGroupMessageReport} from './group';

type BaseReport = {
  timestamp: string;
  line_id: string;
  message: string;
  additional_info?: string | null;
  screen_name: string;
  device_id?: string | null;
  report_type: string;
};

export type LineIllegalReport = BaseReport;

export type GroupIllegalReport = BaseReport & {
  group_id: string;
  member_id: string;
};

export type attachedFiles = {
  uri: string;
  type: string;
  name: string;
};

export enum REPORT_TYPES {
  CP = 'cp',
  TRAFFICKING = 'trafficking',
  TOURISM = 'tourism',
  MOLESTATION = 'molestation',
  MISLEADING_DOMAIN = 'misleading_domain',
  MISLEADING_WORDS_DIGITAL_IMAGES = 'misleading_words_digital_images',
  ONLINE_ENTICEMENT = 'online_enticement',
  UNSOLICITED_OBSCENE_MATERIAL = 'unsolicited_obscene_material',
}
