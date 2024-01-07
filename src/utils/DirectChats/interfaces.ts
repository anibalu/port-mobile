export interface LineData {
  name?: string | null;
  displayPic?: string | null;
  authenticated?: boolean | null;
  disconnected?: boolean | null;
  cryptoId?: string | null;
  connectedOn?: string | null;
  connectedUsing?: string | null;
}

export interface LineDataStrict extends LineData {
  name: string;
  displayPic?: string | null;
  authenticated: boolean;
  disconnected: boolean;
  cryptoId: string;
  connectedOn: string;
  connectedUsing?: string | null;
}
