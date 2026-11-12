import { useEffect, useRef } from 'react'
import { setAmbientVolume, startAmbient, stopAmbient } from '../lib/sound'

/**
 * Background sound during focus: plays while a focus block owned by this tab
 * runs and the user picked a soundscape; fades out the moment the block ends,
 * fails or is given up. It only ever stops what it started, so a preview
 * playing in Settings is left alone.
 */
export function useSoundscape(focusing, sound) {
  const active = focusing && sound.ambient !== 'off'
  const started = useRef(false)

  useEffect(() => {
    if (active) {
      startAmbient(sound.ambient, sound.ambientVolume)
      started.current = true
    } else if (started.current) {
      stopAmbient()
      started.current = false
    }
    // Volume changes are handled below without restarting the soundscape.
  }, [active, sound.ambient]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (active) setAmbientVolume(sound.ambientVolume)
  }, [active, sound.ambientVolume])

  useEffect(
    () => () => {
      if (started.current) stopAmbient()
    },
    [],
  )
}
