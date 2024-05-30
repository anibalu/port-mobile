import Groups from '@assets/icons/bugReporting/Groups.';
import Others from '@assets/icons/bugReporting/Others.';
import SuperPorts from '@assets/icons/bugReporting/SuperPorts.';
import Chatting from '@assets/icons/bugReporting/Chatting.svg';
import Connecting from '@assets/icons/bugReporting/Connecting.svg';

/**
 * categories for bug reporting
 * @param index
 * @param value, Name of category
 * @param Img , Icon to be used
 * @param subCategory ,subcategory for the particular category
 */

/**
 * subcategories for bug reporting
 * @param index
 * @param content, Name of subcategory
 */

export const categories = [
  {
    index: 1,
    value: 'Chatting',
    Img: Chatting,
    subCategory: [
      {index: '1', content: 'Call/Video chatting'},
      {index: '2', content: 'Contact Sharing'},
      {index: '3', content: 'Voice Messages'},
      {index: '4', content: 'Replying to messages'},
      {index: '5', content: 'Message Permissions'},
      {index: '6', content: 'Sharing Media/Docs/Links'},
      {index: '7', content: 'Forwarding messages'},
    ],
  },
  {
    index: 2,
    value: 'Connecting',
    Img: Connecting,
    subCategory: [
      {index: '1', content: 'Showing a QR code'},
      {index: '2', content: 'Scanning a QR code'},
      {index: '3', content: 'Sending a link'},
      {index: '4', content: 'Clicking a link'},
      {index: '5', content: 'NFC Issues'},
    ],
  },
  {
    index: 3,
    value: 'Superports',
    Img: SuperPorts,
    subCategory: [
      {index: '1', content: 'Creating a Superport'},
      {index: '2', content: 'Using a Superport'},
      {index: '3', content: 'Deleting a Superport'},
    ],
  },
  {
    index: 4,
    value: 'Groups',
    Img: Groups,
    subCategory: [
      {index: '1', content: 'Creating a group'},
      {index: '2', content: 'Joining a group'},
      {index: '3', content: 'Inviting to a group'},
      {index: '4', content: 'Messaging a group'},
      {index: '5', content: 'Leaving a group'},
    ],
  },
  {
    index: 5,
    value: 'Others',
    Img: Others,
    subCategory: [{index: '1', content: 'Others'}],
  },
];
