import {ARTIFICIAL_LOADER_INTERVAL} from '../../configs/constants';
import {
  disappearDuration,
  disappearOptions,
  disappearOptionsTypes,
  expiryDuration,
  expiryOptionsTypes,
} from './interfaces';

/**
 * converts an ISO timestamp into a user-readable timestamp string.
 * @param {string|undefined} ISOTime - ISO timestamp or undefined
 * @returns {string} - user-readable timestamp string
 */
export function getTimeStamp(ISOTime: string | undefined): string {
  if (!ISOTime) {
    return '';
  }
  try {
    // Format the time in 12-hour format with AM/PM
    const date = new Date(ISOTime);
    let formattedTime = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    formattedTime = formattedTime
      .replace(/\bam\b/i, 'AM')
      .replace(/\bpm\b/i, 'PM');
    return formattedTime;
  } catch (error) {
    return '';
  }
}

/**
 * converts an ISO timestamp into a user-readable 'time ago' timestamp string, used for superports.
 * @param {string|undefined|null} isoTimeString - ISO timestamp or undefined
 * @returns {string} - user-readable timestamp string
 */
export function formatTimeAgo(isoTimeString: string | undefined | null) {
  if (!isoTimeString) {
    return 'Unused';
  }
  const now = new Date();
  const time = new Date(isoTimeString);
  const diff = now.getTime() - time.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? '1 year ago' : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else if (weeks > 0) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else {
    return 'just now';
  }
}

/**
 * converts an ISO timestamp into a user-readable timestamp string, used for chattiles exclusively.
 * @param {string|undefined} ISOTime - ISO timestamp or undefined
 * @returns {string} - user-readable timestamp string
 */
export function getChatTileTimestamp(isoTimestamp: string): string {
  try {
    if (!isoTimestamp) {
      return '';
    }
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 1) {
      return 'Now';
    }
    if (diffMins < 60) {
      return diffMins === 1 ? '1m' : `${diffMins}m`;
    }
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
    if (
      now.getDate() - date.getDate() === 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return 'Yesterday';
    }
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'numeric',
      year: '2-digit',
    };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Incorrect timestamp: ', error);
    return '';
  }
}

/**
 * converts an ISO timestamp into a user-readable timestamp string, used for chattiles exclusively.
 * @param {string|undefined} ISOTime - ISO timestamp or undefined
 * @returns {string} - user-readable timestamp string
 */
export function getReadableTimestamp(
  ISOTime: string | undefined | null,
): string {
  if (!ISOTime) {
    return '';
  }
  try {
    // Format the time in 12-hour format with AM/PM
    const date = new Date(ISOTime);
    let formattedTime = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    //Comparing dates, if today's message we send the time, else a DD/MM/YY object
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today > date) {
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric', // Day of the month
        month: 'numeric', // Full month name
        year: 'numeric', // Four-digit year
      };
      formattedTime = date.toLocaleDateString(undefined, options);
      return formattedTime;
    }
    formattedTime = formattedTime
      .replace(/\bam\b/i, 'AM')
      .replace(/\bpm\b/i, 'PM');
    return formattedTime;
  } catch (error) {
    return '';
  }
}

/**
 * Check if 2 different timestamps are on the same day (in the local timezone)
 * @param ISOTimeString1 timestamp 1
 * @param ISOTimeString2 timestamp 2
 * @returns
 */
export function checkDateBoundary(
  ISOTimeString1: string | null,
  ISOTimeString2: string | null,
): boolean {
  try {
    if (!ISOTimeString1 || !ISOTimeString2) {
      return false;
    }
    const date1 = new Date(ISOTimeString1);
    const date2 = new Date(ISOTimeString2);

    // Compare the year, month, and day components of the dates.
    return date1.toDateString() !== date2.toDateString();
  } catch (error) {
    console.log('Check date boundary error: ', error);
    return false;
  }
}

export function checkMessageTimeGap(
  ISOTimeString1: string | null,
  ISOTimeString2: string | null,
  timeGap: number,
): boolean {
  try {
    if (!ISOTimeString1 || !ISOTimeString2) {
      return false;
    }
    const date1 = new Date(ISOTimeString1);
    const date2 = new Date(ISOTimeString2);

    // Compare the year, month, and day components of the dates.
    return date1.getTime() - date2.getTime() > timeGap;
  } catch (error) {
    console.log('Check date boundary error: ', error);
    return false;
  }
}

/**
 * converts an ISO timestamp into a user-readable date boundary string.
 * @deprecated
 * @param {string|undefined} ISOTime - ISO timestamp or undefined
 * @returns {string} - user-readable date boundary string
 */
export function createDateBoundaryStamp(isoString: string | undefined): string {
  return getDateStamp(isoString);
}

/**
 * Creates an ISO time stamp of current time.
 * @returns {string} - ISO time stamp as a string
 */
export function generateISOTimeStamp() {
  const now: Date = new Date();
  return now.toISOString();
}

export function getEpochTime() {
  const now: Date = new Date();
  return Math.floor(now.valueOf());
}

//if you want to add artificial wait anywhere
export const wait = async (delay: number = ARTIFICIAL_LOADER_INTERVAL) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Convert an ISO timestamp into a human-readable string. Carveouts for today and yesterday.
 * @param isoString the target time to convert to a readable string
 * @returns a user-readable string
 */
export function getTimeAndDateStamp(
  isoString: string | null | undefined,
): string {
  if (!isoString) {
    return '';
  }
  const formattedDate = getDateStamp(isoString);
  const inputDate = new Date(isoString);
  const formattedTime = inputDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${formattedTime}, ${formattedDate}`;
}

export function getDateStamp(isoString: string | undefined): string {
  if (!isoString) {
    return '';
  }
  const targetDate = new Date(isoString);
  // Check today
  let cmpDate = new Date();
  if (targetDate.toDateString() === cmpDate.toDateString()) {
    return 'Today';
  }
  // Check yesterday
  cmpDate.setDate(cmpDate.getDate() - 1);
  if (targetDate.toDateString() === cmpDate.toDateString()) {
    return 'Yesterday';
  }
  // Check in the last week
  cmpDate.setDate(cmpDate.getDate() - 6); // 6 Because we decremented by 1 already
  if (targetDate.toISOString() >= cmpDate.toISOString()) {
    // The message was sent in the last week
    return (
      targetDate
        .toLocaleString(undefined, {weekday: 'long'})
        .split(' ')
        .at(0) as string
    ).slice(0, -1);
  }
  // Check this year
  cmpDate = new Date();
  if (cmpDate.getFullYear() === targetDate.getFullYear()) {
    return targetDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  // Finally, we resort to the whole string
  return targetDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getExpiryTimestamp(
  currentTimestamp: string,
  expiry: expiryOptionsTypes,
): string | null {
  const date = new Date(currentTimestamp);
  const addTime = expiryDuration[expiry];
  if (addTime) {
    date.setTime(date.getTime() + addTime);
    return date.toISOString();
  }
  return null;
}

export function hasExpired(expiryTimestamp?: string | null): boolean {
  try {
    if (!expiryTimestamp) {
      return false;
    }
    const timeStamp: Date = new Date(expiryTimestamp);
    const now: Date = new Date();
    const timeDiff = timeStamp.getTime() - now.getTime();
    if (timeDiff > 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log('Error checking time stamp validity: ', error);
    return true;
  }
}

export function getExpiryTag(expiryTimestamp: string | null): string {
  if (!expiryTimestamp) {
    return 'Does not expire';
  } else {
    try {
      const currentTime = new Date();
      const expiryTime = new Date(expiryTimestamp);
      const timeDifference = expiryTime.getTime() - currentTime.getTime();
      return formatTimeUntilExpiry(timeDifference);
    } catch (error) {
      return 'unknown expiry';
    }
  }
}

function formatTimeUntilExpiry(difference: number): string {
  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `Expires in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Expires in a minute';
  }
}

export function checkTimeout(
  timestamp: string | null | undefined,
  acceptedDuration: number,
): boolean {
  try {
    if (!timestamp) {
      console.log('NoTimestampToCheckTimeout: return expired');
      return false;
    }

    const timeStamp: Date = new Date(timestamp);

    const now: Date = new Date();
    const timeDiff = now.getTime() - timeStamp.getTime();
    if (timeDiff <= acceptedDuration) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('error checking timeout: ', error);
    return false;
  }
}

export function generateExpiresOnISOTimestamp(
  timeDiffMilliseconds: number | null,
): string | null {
  if (timeDiffMilliseconds === 0 || timeDiffMilliseconds === null) {
    return null; //no expiry
  }
  const currentTime = Date.now(); // Current time in milliseconds
  const expiresTime = new Date(currentTime + timeDiffMilliseconds); // Expiration time as a Date object
  return expiresTime.toISOString(); // Convert to ISO string
}

// convert milliseconds to MM:SS
export function formatDuration(milliseconds: number): string {
  // Convert milliseconds to seconds
  let seconds = Math.floor(milliseconds / 1000);

  // Calculate minutes
  let minutes = Math.floor(seconds / 60);

  // Calculate remaining seconds
  seconds = seconds % 60;

  // Format the result as "00:00 mins"
  return `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
}

export function getLabelByTimeDiff(
  duration?: number | null,
): disappearOptionsTypes {
  if (!duration) {
    return 'Off';
  }
  for (let index = 0; index < disappearOptions.length; index++) {
    const label = disappearOptions[index];
    const diff: number = disappearDuration[label];
    if (diff === duration) {
      return label as disappearOptionsTypes;
    }
  }

  return 'Off'; // If no matching label is found
}

/**
 * Function to get the elapsed time since a start time.
 * @param startTime - start time
 * @returns - time elapsed string in desired format.
 */
export function getElapsedTime(startTime: number): string {
  const currentTime = Date.now();

  // Calculate the time difference in milliseconds
  const timeElapsedMs = currentTime - startTime;

  // Convert milliseconds to seconds, minutes, and hours
  const seconds = Math.floor((timeElapsedMs / 1000) % 60);
  const minutes = Math.floor((timeElapsedMs / (1000 * 60)) % 60);
  const hours = Math.floor(timeElapsedMs / (1000 * 60 * 60));

  // Format the time as HH:MM:SS
  return `${hours}h:${minutes}m:${seconds}s`;
}
