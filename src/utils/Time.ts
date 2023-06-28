export function getTimeStamp(ISOTime: string | undefined) {
  if (!ISOTime) {
    return '';
  }
  const datetime = new Date(ISOTime);
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  if (datetime < midnight) {
    // This happened before today in current timezone
    return datetime.toLocaleDateString();
  } else {
    return datetime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
    console.log('invbalid datetime: ', ISOTime);
    return '';
  }
}
