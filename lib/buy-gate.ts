'use client'

import type { MouseEvent } from 'react'
import { track, type SignupPlace } from './track'

/**
 * "First time on Kakobuy?" step. The first time someone taps BUY, a small
 * sheet asks whether they already have a Kakobuy account. New people get the
 * sign-up link (with the coupons) first; people with an account go straight
 * to the item. The answer is remembered, so it's asked once per browser.
 */
export { SIGNUP_URL } from './buy-gate-url'

const ANSWER_KEY = 'fs:kakobuy-account'
export const BUY_GATE_EVENT = 'fs:buy-gate'

export type GateItem = { key: string; link: string; title: string }

function answered(): boolean {
  try {
    return window.localStorage.getItem(ANSWER_KEY) !== null
  } catch {
    return true // storage blocked: never block the BUY link
  }
}

export function rememberKakobuyAnswer(answer: 'has-account' | 'new') {
  try {
    window.localStorage.setItem(ANSWER_KEY, answer)
  } catch {
    // ignore
  }
}

/** onClick for every BUY link: counts the tap, shows the first-time step once. */
export function onBuyClick(e: MouseEvent<HTMLAnchorElement>, item: GateItem) {
  track({ t: 'buy', k: item.key })
  if (!item.link || answered()) return
  // Let ctrl/cmd-click etc. behave normally.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  window.dispatchEvent(new CustomEvent<GateItem>(BUY_GATE_EVENT, { detail: item }))
}

/** onClick for every Kakobuy sign-up link on the site. */
export function onSignupClick(place: SignupPlace) {
  track({ t: 'signup', p: place })
  rememberKakobuyAnswer('new')
}
