import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SoundName =
  | 'rattle'
  | 'scratch'
  | 'drumroll'
  | 'reveal'
  | 'heartbeat'
  | 'boom'
  | 'chime';

const MUTE_KEY = 'fate_muted';

const soundFiles: Record<SoundName, number> = {
  rattle: require('@/assets/sounds/fate/spin-rattle.wav'),
  scratch: require('@/assets/sounds/fate/record-scratch.wav'),
  drumroll: require('@/assets/sounds/fate/drumroll.wav'),
  reveal: require('@/assets/sounds/fate/fate-reveal.wav'),
  heartbeat: require('@/assets/sounds/fate/heartbeat.wav'),
  boom: require('@/assets/sounds/fate/boom.wav'),
  chime: require('@/assets/sounds/fate/soft-chime.wav'),
};

export interface UseSoundsReturn {
  play: (name: SoundName) => Promise<void>;
  stop: (name: SoundName) => Promise<void>;
  isLoaded: boolean;
  muted: boolean;
  setMuted: (muted: boolean) => void;
}

export function useSounds(): UseSoundsReturn {
  const soundsRef = useRef<Map<SoundName, AudioPlayer>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [muted, setMutedState] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
      } catch {
        // audio mode is not critical — continue
      }

      const storedMute = await AsyncStorage.getItem(MUTE_KEY);
      if (storedMute === 'true') {
        setMutedState(true);
        mutedRef.current = true;
      }

      for (const [name, source] of Object.entries(soundFiles) as [SoundName, number][]) {
        if (cancelled) return;
        try {
          soundsRef.current.set(name, createAudioPlayer(source));
        } catch {
          // Sound loading failed — continue without it
        }
      }
      if (!cancelled) setIsLoaded(true);
    }

    init();

    return () => {
      cancelled = true;
      for (const player of soundsRef.current.values()) {
        player.remove();
      }
      soundsRef.current.clear();
    };
  }, []);

  const play = useCallback(async (name: SoundName) => {
    if (mutedRef.current) return;
    const player = soundsRef.current.get(name);
    if (!player) return;
    try {
      await player.seekTo(0);
      player.play();
    } catch {
      // Playback failed — ignore
    }
  }, []);

  const stop = useCallback(async (name: SoundName) => {
    const player = soundsRef.current.get(name);
    if (!player) return;
    try {
      player.pause();
    } catch {
      // Already stopped or removed
    }
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    mutedRef.current = value;
    AsyncStorage.setItem(MUTE_KEY, String(value));
  }, []);

  return { play, stop, isLoaded, muted, setMuted };
}
