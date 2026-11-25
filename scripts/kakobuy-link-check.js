/*
 * Fashion Sea · weekly dead-link check
 * =====================================
 * Checks every catalogue link on Kakobuy and lists the dead ones. It deletes
 * nothing: the owner reviews the list and decides.
 *
 * Why it runs in a browser: Kakobuy only shows Taobao items to logged-in
 * accounts and encrypts its item API, so a server can't tell a dead link from
 * a live one. This script loads each item page the normal way, in hidden
 * frames inside a logged-in Kakobuy tab, and reads what the page says.
 *
 * How to run (the weekly scheduled task does exactly this):
 *   1. Log in to Kakobuy, then open https://item2.kakobuy.com/ in that browser.
 *   2. Run this whole file in that tab's console.
 *   3. Start:   await window.fsLinkCheck.start()
 *      (options: { limit: 50 } to test on 50 links, { concurrency: 3 },
 *       { items: [...] } to check a given list instead of the catalogue)
 *   4. Watch:   window.fsLinkCheck.progress()
 *   5. Result:  window.fsLinkCheck.report()  (also saved in localStorage
 *      under "fs-linkcheck-report", so it survives closing the console)
 *
 * A link only counts as dead if Kakobuy says "This product may not exist" on
 * three separate checks (Kakobuy is flaky: a single miss means nothing).
 *
 * Kakobuy also rate-limits: after a few hundred pages in a few minutes it says
 * "may not exist" for EVERY item for a while. So the check goes at a steady
 * pace (3 pages at a time, a short gap between pages) and keeps re-checking a
 * "canary" item it saw alive at the start. When the canary suddenly looks
 * dead, the last batch is thrown away, the check pauses (10, 20, then 30 min)
 * and redoes that batch. If Kakobuy is still blocking after that, it stops
 * with an error instead of reporting hundreds of false dead links.
 */
;(() => {
  const CATALOGUE_URL = 'https://v0-fashionsea.vercel.app/api/catalogue'
  const SITE_URL = 'https://v0-fashionsea.vercel.app'
  const ITEM_PAGE = 'https://item2.kakobuy.com/item/details?url='
  const PAGE_TIMEOUT = 30000
  const RECHECK_PAUSE = 20000
  const PAGE_GAP = 1200 // between two pages in the same lane
  const BATCH = 30 // re-check the canary after this many pages
  const BACKOFF_MS = [10, 20, 30].map((m) => m * 60000)
  const REPORT_KEY = 'fs-linkcheck-report'
  // If more than this share of links looks dead on the first pass, something
  // else is wrong (logged out, Kakobuy down): stop instead of reporting.
  const MAX_DEAD_SHARE = 0.25

  if (location.hostname !== 'item2.kakobuy.com') {
    throw new Error('Run this on https://item2.kakobuy.com/ (logged in to Kakobuy).')
  }

  // ---- timers that keep running when the tab is in the background --------
  let sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  try {
    const src = 'onmessage = (e) => setTimeout(() => postMessage(e.data[0]), e.data[1])'
    const worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })))
    const waiting = new Map()
    let seq = 0
    worker.onmessage = (e) => {
      const done = waiting.get(e.data)
      waiting.delete(e.data)
      if (done) done()
    }
    sleep = (ms) =>
      new Promise((r) => {
        const id = ++seq
        waiting.set(id, r)
        worker.postMessage([id, ms])
      })
  } catch {
    // Worker blocked: plain timers (slower if the tab is hidden).
  }

  // ---- link → Kakobuy item page -------------------------------------------
  function targetFor(link) {
    let u
    try {
      u = new URL(String(link).trim())
    } catch {
      return null
    }
    const host = u.hostname.replace(/^www\./, '').toLowerCase()
    if (/(^|\.)kakobuy\.com$/.test(host)) {
      const source = u.searchParams.get('url')
      return source ? ITEM_PAGE + encodeURIComponent(source) : null
    }
    // Kakobuy short links: the frame follows the redirect to the item page.
    if (host === 'ikako.vip') return u.href
    if (/(^|\.)(taobao|tmall|weidian|1688|jd)\.com$/.test(host)) return ITEM_PAGE + encodeURIComponent(u.href)
    return null
  }

  // ---- load one item page in a hidden frame and read the verdict ----------
  async function probe(url) {
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:fixed;left:-5000px;top:0;width:1280px;height:900px;border:0;visibility:hidden'
    frame.src = url
    document.body.appendChild(frame)
    const started = Date.now()
    let verdict = 'timeout'
    let landed = ''
    try {
      while (Date.now() - started < PAGE_TIMEOUT) {
        await sleep(700)
        let text = ''
        try {
          landed = frame.contentWindow.location.href
          text = frame.contentDocument && frame.contentDocument.body ? frame.contentDocument.body.innerText : ''
        } catch {
          continue // mid-redirect on another domain
        }
        if (/may not exist/i.test(text)) {
          verdict = 'dead'
          break
        }
        if (/CNY\s*[￥¥]\s*\d/.test(text)) {
          verdict = 'alive'
          break
        }
        if (/url not supported|not support this link/i.test(text)) {
          verdict = 'unsupported'
          break
        }
      }
    } finally {
      frame.src = 'about:blank'
      frame.remove()
    }
    return { verdict, landed, ms: Date.now() - started }
  }

  async function pool(list, concurrency, work, onEach) {
    let next = 0
    const runners = Array.from({ length: Math.min(concurrency, list.length) }, async () => {
      while (next < list.length && !state.stopRequested) {
        const i = next++
        const out = await work(list[i])
        onEach(list[i], out)
        await sleep(PAGE_GAP)
      }
    })
    await Promise.all(runners)
  }

  // ---- rate-limit guard: a known-alive "canary" item ----------------------
  async function canaryAlive() {
    if (!state.canary) return true
    for (let i = 0; i < 2; i++) {
      const { verdict } = await probe(state.canary.url)
      if (verdict === 'alive') return true
    }
    return false
  }

  /** First of the first 15 links that Kakobuy shows alive, or an error. */
  async function pickCanary(checkable) {
    for (const t of checkable.slice(0, 15)) {
      if (state.stopRequested) return
      const { verdict } = await probe(t.url)
      if (verdict === 'alive') {
        state.canary = { url: t.url, title: t.items[0] && t.items[0].title }
        return
      }
    }
    throw new Error(
      'None of the first 15 links loaded as alive on Kakobuy, so Kakobuy is blocking the check right now (too many pages recently) or this browser is logged out. Nothing was reported. Try again later.',
    )
  }

  /**
   * Check `list` in batches; after each batch the canary must still be alive,
   * otherwise that batch's verdicts are dropped and it is redone after a pause.
   */
  async function guardedRun(list, conc) {
    state.pass += 1
    state.done = 0
    state.total = list.length
    for (let start = 0; start < list.length && !state.stopRequested; ) {
      const batch = list.slice(start, start + BATCH)
      const added = []
      await pool(batch, conc, (t) => probe(t.url), (t, out) => {
        t.checks.push(out.verdict)
        added.push(t)
      })
      if (await canaryAlive()) {
        state.done += batch.length
        start += BATCH
        state.blockedPauses = 0
        continue
      }
      // Kakobuy is rate-limiting: these verdicts can't be trusted.
      for (const t of added) t.checks.pop()
      const wait = BACKOFF_MS[state.blockedPauses || 0]
      if (wait === undefined) {
        throw new Error(
          `Kakobuy kept blocking the check (its canary item "${state.canary.title}" showed as missing for over an hour) after ${state.done} links of pass ${state.pass}. Nothing was reported. Try again later.`,
        )
      }
      state.blockedPauses = (state.blockedPauses || 0) + 1
      state.totalPauses = (state.totalPauses || 0) + 1
      state.status = 'paused'
      state.resumeAt = Date.now() + wait
      await sleep(wait)
      state.status = 'running'
      state.resumeAt = null
    }
  }

  // ---- state --------------------------------------------------------------
  const state = {
    status: 'idle',
    pass: 0,
    done: 0,
    total: 0,
    startedAt: null,
    finishedAt: null,
    error: null,
    stopRequested: false,
    targets: [], // { url, items: [{ id, row, title, link, key }], checks: [] }
    result: null,
  }

  // The download from a Kakobuy tab sometimes fails once or twice in a row
  // ("Failed to fetch"), which used to end the whole weekly run. Retry for
  // about two minutes before giving up.
  const CATALOGUE_RETRIES_MS = [0, 5000, 15000, 30000, 60000]

  async function loadCatalogue() {
    let lastError = null
    for (let i = 0; i < CATALOGUE_RETRIES_MS.length; i++) {
      if (CATALOGUE_RETRIES_MS[i]) await sleep(CATALOGUE_RETRIES_MS[i])
      try {
        // Alternate between a fresh copy and the normal (edge-cached) one.
        const res = await fetch(CATALOGUE_URL, i % 2 ? {} : { cache: 'no-store' })
        if (!res.ok) throw new Error(`Catalogue answered ${res.status}`)
        const items = await res.json()
        if (!Array.isArray(items) || !items.length) throw new Error('Catalogue is empty')
        state.catalogueTries = i + 1
        return items
      } catch (err) {
        lastError = err
      }
    }
    throw new Error(
      `Could not download the catalogue from ${CATALOGUE_URL} after ${CATALOGUE_RETRIES_MS.length} tries (${
        lastError && lastError.message ? lastError.message : lastError
      }).`,
    )
  }

  function slugify(title) {
    const s = String(title || '')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/g, '')
    return s || 'item'
  }

  function buildReport() {
    const dead = []
    const unsure = []
    const unsupported = []
    let alive = 0
    for (const t of state.targets) {
      const v = t.checks
      const row = (item) => ({
        sheetRow: Number(item.id) + 1,
        title: item.title,
        link: item.link,
        itemPage: `${SITE_URL}/item/${slugify(item.title)}-${item.key}`,
        checks: v.join(' / '),
      })
      if (v.includes('alive')) alive += t.items.length
      else if (t.unsupported || v.every((x) => x === 'unsupported')) unsupported.push(...t.items.map(row))
      else if (v.length >= 3 && v.every((x) => x === 'dead')) dead.push(...t.items.map(row))
      else unsure.push(...t.items.map(row))
    }
    const bySheetRow = (a, b) => a.sheetRow - b.sheetRow
    return {
      checkedAt: new Date().toISOString(),
      catalogueItems: state.targets.reduce((n, t) => n + t.items.length, 0),
      uniqueLinks: state.targets.length,
      alive,
      dead: dead.sort(bySheetRow),
      unsure: unsure.sort(bySheetRow),
      unsupported: unsupported.sort(bySheetRow),
      minutes: Math.round((Date.now() - state.startedAt) / 60000),
    }
  }

  async function start(options = {}) {
    if (state.status === 'running' || state.status === 'paused') return 'already running'
    const concurrency = options.concurrency || 3
    Object.assign(state, { status: 'running', pass: 0, done: 0, total: 0, startedAt: Date.now(), finishedAt: null, error: null, stopRequested: false, result: null, canary: null, blockedPauses: 0, totalPauses: 0, resumeAt: null })
    try {
      // options.items: check a given list instead of the live catalogue (tests).
      let items = Array.isArray(options.items) ? options.items : await loadCatalogue()
      if (options.limit) items = items.slice(0, options.limit)

      // One check per unique Kakobuy page (colourway duplicates share a link).
      const byUrl = new Map()
      const unsupported = []
      for (const it of items) {
        const url = targetFor(it.link)
        const entry = { id: it.id, title: it.title, link: it.link, key: it.key }
        if (!url) {
          unsupported.push(entry)
          continue
        }
        if (!byUrl.has(url)) byUrl.set(url, { url, items: [], checks: [] })
        byUrl.get(url).items.push(entry)
      }
      state.targets = [...byUrl.values()]
      for (const e of unsupported) state.targets.push({ url: null, items: [e], checks: ['unsupported'], unsupported: true })

      const run = (list, conc) => guardedRun(list, conc)

      // Pass 1: everything (after finding a canary that loads as alive).
      const checkable = state.targets.filter((t) => t.url)
      await pickCanary(checkable)
      await run(checkable, concurrency)
      const firstDead = checkable.filter((t) => t.checks[0] === 'dead').length
      if (checkable.length >= 50 && firstDead / checkable.length > MAX_DEAD_SHARE) {
        throw new Error(
          `${firstDead} of ${checkable.length} links looked dead on the first pass. That is not normal: check that this browser is logged in to Kakobuy and that Kakobuy works, then run again.`,
        )
      }

      // Passes 2 and 3: only links that weren't clearly alive, slower.
      for (let p = 0; p < 2 && !state.stopRequested; p++) {
        const again = checkable.filter((t) => !t.checks.includes('alive'))
        if (!again.length) break
        await sleep(RECHECK_PAUSE)
        await run(again, Math.max(1, Math.floor(concurrency / 2)))
      }
      // Links still without 3 verdicts (e.g. timeouts) get one more try each.
      const short = checkable.filter((t) => !t.checks.includes('alive') && t.checks.length < 3)
      if (short.length && !state.stopRequested) await run(short, 2)

      state.result = buildReport()
      try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(state.result))
      } catch {
        // too big for storage: still available via report()
      }
      state.status = state.stopRequested ? 'stopped' : 'done'
    } catch (err) {
      state.status = 'error'
      state.error = String(err && err.message ? err.message : err)
    } finally {
      state.finishedAt = Date.now()
    }
    return state.status
  }

  function progress() {
    const mins = state.startedAt ? Math.round(((state.finishedAt || Date.now()) - state.startedAt) / 60000) : 0
    return {
      status: state.status,
      pass: state.pass,
      done: state.done,
      total: state.total,
      minutes: mins,
      error: state.error,
      catalogueTries: state.catalogueTries || 0,
      canary: state.canary ? state.canary.title : null,
      pausesForBlocking: state.totalPauses || 0,
      resumeAt: state.resumeAt ? new Date(state.resumeAt).toISOString() : null,
      deadSoFar: state.targets.filter((t) => t.checks.length && t.checks.every((x) => x === 'dead')).length,
    }
  }

  function report() {
    if (state.result) return state.result
    try {
      return JSON.parse(localStorage.getItem(REPORT_KEY) || 'null')
    } catch {
      return null
    }
  }

  window.fsLinkCheck = {
    start,
    progress,
    report,
    stop: () => {
      state.stopRequested = true
      return 'stopping after the pages already loading'
    },
  }
  return 'Fashion Sea link check loaded. Start with: await window.fsLinkCheck.start()'
})()
