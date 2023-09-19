export function getTimeStamp(ISOTime: string | undefined) {
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

export function getTime(ISOTime: string | undefined) {
  if (!ISOTime) {
    return '';
  }

  const datetime = new Date(ISOTime);
  try {
    return datetime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    console.log('invalid datetime: ', ISOTime);
    return '';
  }
}

export function checkDateBoundary(
  ISOTimeString1: string | undefined,
  ISOTimeString2: string | undefined,
) {
  if (!ISOTimeString1 || !ISOTimeString1) {
    return false;
  } else {
    const date1 = new Date(ISOTimeString1);
    const date2 = new Date(ISOTimeString2);

    // Compare the year, month, and day components of the dates.
    return (
      date1.getFullYear() !== date2.getFullYear() ||
      date1.getMonth() !== date2.getMonth() ||
      date1.getDate() !== date2.getDate()
    );
  }
}
export function formatISODate(isoString: string | undefined): string {
  if (isoString === undefined) {
    return '';
  }
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // Full weekday name
    day: 'numeric', // Day of the month
    month: 'long', // Full month name
    year: 'numeric', // Four-digit year
  };

  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString('en-US', options);

  return formattedDate;
}

export function generateId() {
  const date = new Date();
  return date.getTime().toString();
}

export function createTimeStamp() {
  const now = new Date();
  return now.toISOString();
}
