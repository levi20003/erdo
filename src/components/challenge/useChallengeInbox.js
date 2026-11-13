import { useCallback, useEffect, useState } from 'react'
import { classifyIncoming, decodeChallenge } from '../../lib/challenge'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import { useToast } from '../toast/ToastProvider'

const readToken = () => {
  const m = window.location.hash.match(/^#k=([A-Za-z0-9_-]+)$/)
  return m ? m[1] : window.location.hash.startsWith('#k=') ? '' : null
}

/**
 * Picks up a challenge link (#k=…) when the app opens or the hash changes:
 * an invitation opens the invite sheet, a friend's update is applied right away.
 * The token is removed from the address so a reload doesn't apply it twice.
 */
export function useChallengeInbox() {
  const { state, actions } = useAppStore()
  const { push } = useToast()
  const [invite, setInvite] = useState(null)

  const check = useCallback(() => {
    const token = readToken()
    if (token === null) return
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#fokusz`)
    const link = decodeChallenge(token)
    if (!link) return push(t.challenge.invalid, 'danger')
    const kind = classifyIncoming(link, state.challenges)
    if (kind === 'invite') setInvite(link)
    else if (kind === 'update') {
      actions.updateChallenge(link)
      push(t.challenge.updated(link.name, link.done, link.goal), 'success')
    } else push(kind === 'own' ? t.challenge.own : t.challenge.unknown)
  }, [state.challenges, actions, push])

  useEffect(() => {
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [check])

  return { invite, closeInvite: () => setInvite(null) }
}
