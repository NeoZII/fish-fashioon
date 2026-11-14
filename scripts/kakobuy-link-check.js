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
 *      (options: { limit: 50 } to test on 50 links, { concurrency: 6 },
 *       { items: [...] } to check a given list instead of the catalogue)
 *   4. Watch:   window.fsLinkCheck.progress()
 *   5. Result:  window.fsLinkCheck.report()  (also saved in localStorage
 *      under "fs-linkcheck-report", so it survives closing the console)
 *
 * A link only counts as dead if Kakobuy says "This product may not exist" on
 * three separate checks (Kakobuy is flaky: a single miss means nothing).
 */
;(() => {
  const CATALOGUE_URL = 'https://v0-fashionsea.vercel.app/api/catalogue'
  const SITE_URL = 'https://v0-fashionsea.vercel.app'
  const ITEM_PAGE = 'https://item2.kakobuy.com/item/details?url='
  const PAGE_TIMEOUT = 30000
  const RECHECK_PAUSE = 20000
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
      }
    })
    await Promise.all(runners)
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

  async function loadCatalogue() {
    const res = await fetch(CATALOGUE_URL, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Catalogue answered ${res.status}`)
    const items = await res.json()
    if (!Array.isArray(items) || !items.length) throw new Error('Catalogue is empty')
    return items
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
    if (state.status === 'running') return 'already running'
    const concurrency = options.concurrency || 6
    Object.assign(state, { status: 'running', pass: 0, done: 0, total: 0, startedAt: Date.now(), finishedAt: null, error: null, stopRequested: false, result: null })
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

      const run = async (list, conc) => {
        state.pass += 1
        state.done = 0
        state.total = list.length
        await pool(list, conc, (t) => probe(t.url), (t, out) => {
          t.checks.push(out.verdict)
          state.done += 1
        })
      }

      // Pass 1: everything.
      const checkable = state.targets.filter((t) => t.url)
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
        await run(again, Math.max(2, Math.floor(concurrency / 2)))
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
