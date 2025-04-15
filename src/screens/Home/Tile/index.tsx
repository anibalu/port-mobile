import React from 'react';

import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';

import ActiveChatTile from './ActiveChatTile';
import PortTile from './PortTile';

export type TileProps = ConnectionInfo & {
  setSelectedPortProps: (x: TileProps & {isReadPort: true}) => void;
} & ( // Common stuff
    | {
        // In the case that it is a read port, we need expiry
        isReadPort: true;
        expired: boolean;
      }
    | {
        // If it's not a read port, expiry is not needed
        isReadPort: false;
      }
  );

export default function Tile(props: TileProps) {
  if (props.isReadPort) {
    // Return the read port version
    return <PortTile {...props} />;
  }
  // return the chat tile
  return <ActiveChatTile {...props} />;
}
