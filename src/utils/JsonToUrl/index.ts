export function jsonToUrl(
  json: {[key: string]: string | number} | null,
): string | null {
  if (!json) {
    return null;
  }
  const baseUrl = 'https://porting.me/';
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(json)) {
    params.append(key, value.toString());
  }

  return `${baseUrl}?${params.toString()}`;
}

export function urlToJson(url: string): Record<string, string | number> {
  const urlWithoutQuotes = url.replace(/^"?(.*?)"?$/, '$1'); //to remove quote at edge in a string
  const queryString = decodeURIComponent(urlWithoutQuotes).split('?')[1];
  if (!queryString) {
    return {};
  }

  const paramsArray = queryString.split('&'); // Parse query string

  const jsonParams: Record<string, string | number> = {};
  for (const param of paramsArray) {
    const [key, value] = param.split('=');
    let newVal = value;
    if (value.includes('+')) {
      newVal = value.split('+').join(' ');
    }
    if (key === 'target') {
      // eslint-disable-next-line radix
      jsonParams[key] = parseInt(newVal);
    } else {
      jsonParams[key] = newVal;
    }
  }

  return jsonParams;
}
