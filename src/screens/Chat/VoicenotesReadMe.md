# Voice Notes Library:

We are using react-native-audio-recorder-player library to record and play voice notes.

# AudioPlayerContext:

We have made a useAudioPlayerContext which handles all utils for recording and playing voice notes. This approach has been taken because at any point in chat, we only want one instance of audioplayer.

# Functions in useAudioPlayerContext:

onPausePlay: Pauses player
onStartPlay: First stops any player that could be playing then starts player. If fileUri exists, then plays the file, otherwise plays the local file. We also record playtime in this function.
onStartRecord: Starts recording audio and sets the audio to be sent to db
onStopRecord: Stops recorder
deleteRecording: Deletes recording
sendRecording: Removes all listeners

# Message bar:

We have three kinds of message bar now

1. When audio is recording( isRecording and !hasRecorded)
2. When audio has been recorded (!isRecording and hasRecorded)
3. When text input is present (!isRecording and !hasRecorded)

# Audio Bubble

We set fileUri from message.data first.
We set playtime from the context
And progress is being set in startPlay function which takes in setProgress.
