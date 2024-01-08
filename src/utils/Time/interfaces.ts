export const expiryOptions: expiryOptionsTypes[] = [
  'forever',
  '1 hour',
  '12 hours',
  '1 day',
  '1 week',
];
export type expiryOptionsTypes =
  | '1 hour'
  | '12 hours'
  | '1 day'
  | '1 week'
  | 'forever';
export const expiryDuration: {[key in expiryOptionsTypes]: number | null} = {
  '1 hour': 1 * 60 * 60 * 1000,
  '12 hours': 12 * 60 * 60 * 1000,
  '1 day': 24 * 60 * 60 * 1000,
  '1 week': 7 * 24 * 60 * 60 * 1000,
  forever: null,
};

export const disappearOptions: disappearOptionsTypes[] = [
  '1 min',
  '1 hour',
  '12 hours',
  '1 day',
  '1 week',
  'Off',
];
export type disappearOptionsTypes =
  | '1 min'
  | '1 hour'
  | '12 hours'
  | '1 day'
  | '1 week'
  | 'Off';

export const disappearDuration: {[key in disappearOptionsTypes]: number} = {
  '1 min': 60 * 1000,
  '1 hour': 1 * 60 * 60 * 1000,
  '12 hours': 12 * 60 * 60 * 1000,
  '1 day': 24 * 60 * 60 * 1000,
  '1 week': 7 * 24 * 60 * 60 * 1000,
  Off: 0,
};
