/**
 * Manage your own media stream in a call
 */

import {MediaStream, mediaDevices} from 'react-native-webrtc';

interface MediaStreamInitialConstraints {
  audio: boolean;
  video: boolean;
}

export class MediaStreamManager {
  /**
   * The media stream
   */
  stream?: MediaStream;
  /**
   * The initial video state
   */
  private initialVideoState: boolean;
  constructor(defaultVideoOn: boolean = true) {
    this.initialVideoState = defaultVideoOn;
  }
  /**
   * Initialize the manager and the local media stream
   */
  async init() {
    const initialConstraints: MediaStreamInitialConstraints = {
      audio: true, // Why would you call without audio? We'll assume that Shantanav doesn't exist.
      video: true,
    };
    this.stream = await mediaDevices.getUserMedia(initialConstraints);
    this.stream.getAudioTracks().forEach(track => (track.enabled = true));
    this.stream
      .getVideoTracks()
      .forEach(track => (track.enabled = this.initialVideoState));
  }

  /**
   * Set the current device's audio stream
   * @param on whether the audio stream should be on
   */
  setAudioStream(on: boolean): void {
    const audioTrack = this.stream?.getAudioTracks()[0];
    console.log('Setting audio stream to: ', on);
    if (audioTrack) {
      audioTrack.enabled = on;
    }
  }

  /**
   * Set the current device's video stream
   * @param on whether the video stream should be on
   */
  setVideoStream(on: boolean): void {
    const videoTrack = this.stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = on;
    }
  }

  /**
   * Get the device's media stream
   * @returns
   */
  getMediaStream() {
    return this.stream;
  }

  /**
   * Switch my camera
   */
  switchCamera() {
    const videoTrack = this.stream?.getVideoTracks()[0];
    if (videoTrack) {
      const constraints = videoTrack.getConstraints();
      if (constraints && constraints.facingMode) {
        constraints.facingMode =
          constraints.facingMode === 'environment' ? 'user' : 'environment';
      }
      videoTrack.applyConstraints(constraints);
    }
  }

  /**
   * Stop the capture of audio and video
   */
  stopStreaming() {
    this.stream?.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (error) {
        console.error('Error stopping track: ', error);
      }
    });
  }
}
