# Flow

## Send

### Identifying the Link:

- To identify if entered text in message bar input is a link or not, I have created a utility function `extractLink` in `BubbleUtils`. This function take a string, split the whole string by spaces and runs a Regex check on each. ('https' or 'http' required)
  The function returns the first string from the array of links, which satisfies the regex.

### Fetching the Data:

- Once there is a url, the function `fetchData` will be called which extracts meta data using the library `OpenGraphParser`. And the Data will be saved in a local state.
- The fetch call will auto get canceled, as we will reject the new promise, after 2 seconds even if we don't have the data.
- To add debouncing, we are using 'debounce' by lodash.
- LinkPreview component will render through MessageBar at the same time we detect the link, UI will show loading when the data is getting fetched and it will display the link as text in the preview if no data.
  If the link is valid and we receive some meta data, then we will display that in the link preview as 'title', 'description' and image.
- Preferance is to print 'og' data first if present, else we will print website's header meta data.

### On Send:

- On message send, we are initializing a large file directory first `initialiseLargeFileDirAsync` inside the function `downloadImageToMediaDir` and then downloading the image in file directory. The initialization function return a promise that resolves to the path to the file (chatId) directory. File name here is a random generated hexId.
- The function `downloadImageToMediaDir` internally calls `downloadImage`, which takes 'from' and 'to' locations paths and writes file using `RNFS`.
- On promise resolve, we are downloading the file in `doc` and on error we will delete the file.
- In send class if the content type of sent message in 'link', then we are running `updateConnectionOnNewMessage` async function. This sends the message with bunch of properties such as read receipts including the Open Graph data.
- On send we run the function `preProcessMessage` which internally calls `preProcessLinkPreviewMessage` for content type link and it add an entry to the media table in `dB` and Saves relative URIs for the paths, updating it.
- Destination path of download file has a limit of 256 characters.
- Link has a separate`ContentType` itself, i.e. `link = 18`.
- If sender has canceled the preview we won't store and send the data, same if there is no data available on sender's side top begin with.

# Edge Cases

- Only the first url in input will show the preview.
- If user deletes the text/url, the preview will disappear.
- Cases are handled on request fail or no data.
- If user cancels the preview, it won't get send with chat data to receiver.
- Input includes text also with link, text in next line indent.

# EXternal Libraries

- react-native-opengraph-kit (https://www.npmjs.com/package/react-native-opengraph-kit)

# Test Cases (Examples)

- 'https://meta.co', 'http://meta.co', 'https://meta.com', 'https://meta.com and somerandom text', 'https://bbc.com'

# UI Cases

### Message bar Link Preview

1. Card with link text (no data)
2. Card with title, desc, Image with link.
3. Card with title and Desc or just title.

### Chat Tile Link Preview

1. Card with Image, title and desc
2. Card with no img and possibly no desc
