/**
 * Interface translations: English, French, Russian, Polish.
 * Product titles, brands and sellers come from the sheet and stay as they are.
 *
 * Every language implements the same `Messages` shape, so a missing string is a
 * type error at build time rather than a blank button on the site.
 */

import { localeFor } from './money'

export const LANGS = ['en', 'fr', 'ru', 'pl'] as const
export type Lang = (typeof LANGS)[number]

export const LANG_NAMES: Record<Lang, { short: string; name: string }> = {
  en: { short: 'EN', name: 'English' },
  fr: { short: 'FR', name: 'Français' },
  ru: { short: 'RU', name: 'Русский' },
  pl: { short: 'PL', name: 'Polski' },
}

type Forms = { one: string; few?: string; many?: string; other: string }

const rules = new Map<Lang, Intl.PluralRules>()
/** Pick the right plural form ("1 item", "3 товара", "5 produktów"). */
function plural(lang: Lang, n: number, forms: Forms): string {
  let r = rules.get(lang)
  if (!r) {
    r = new Intl.PluralRules(localeFor(lang))
    rules.set(lang, r)
  }
  const cat = r.select(n) as keyof Forms
  return forms[cat] ?? forms.other
}

export function formatCount(lang: Lang, n: number): string {
  return n.toLocaleString(localeFor(lang))
}

type SectionId = 'drops' | 'archive' | 'sellers' | 'manifesto' | 'socials' | 'countdown' | 'favourites'
type Step = { title: string; body: string }

export type Messages = {
  /** Big menu labels and section titles. */
  section: Record<SectionId, string>
  /** Browser-tab titles. */
  tab: Record<SectionId, string>
  menu: {
    newBadge: (n: number) => string
    ariaNew: (label: string, n: number) => string
    ariaSaved: (label: string, n: number) => string
    burberryAria: string
    navigate: string
    confirm: string
    mainMenu: string
    slideshowAria: string
  }
  common: {
    menu: string
    back: string
    all: string
    category: string
    brand: string
    seller: string
    loading: string
    loadingSr: string
    close: string
    share: string
    copied: string
    copyLink: string
    buy: string
    items: (n: number) => string
    newCount: (n: number) => string
    searchPlaceholder: string
    searchAria: string
    clearSearch: string
    noItemsFound: string
    emptyDrawer: string
  }
  drops: { intro: string }
  archive: { intro: (n: number) => string }
  sellers: { intro: string }
  grid: {
    shuffle: string
    shuffleAria: string
    reported: string
    loadMore: string
    viewAria: (t: string) => string
    reportAria: (t: string) => string
    reportTitle: string
    buyAria: (t: string) => string
    reportItem: string
    deadLink: string
    outOfStock: string
    submit: string
    sending: string
    reportDialog: string
  }
  fav: {
    save: string
    saved: string
    addAria: (t: string) => string
    removeAria: (t: string) => string
    saveTip: string
    savedTip: string
    linkAria: (n: number) => string
  }
  favPage: {
    savedCount: (n: number) => string
    emptyLine: string
    totalPrefix: string
    beforeShipping: string
    withoutPrice: (n: number) => string
    howItWorks: string
    clearAll: string
    tapAgain: string
    unavailable: (n: number) => string
    remove: string
    loadingFavs: string
    noFavs: string
  }
  intro: {
    kicker: string
    title: string
    lead: string
    /** {heart}, {drops}, {all} are replaced with styled elements. */
    step1: string
    step2: string
    /** {buy} is replaced with a styled element. */
    step3: string
    note: string
    gotIt: string
    browse: string
  }
  filters: {
    title: string
    clearAll: string
    show: (n: number) => string
    close: string
    remove: (label: string, value: string) => string
    findBrand: string
    findSeller: string
    noMatch: (q: string) => string
  }
  item: {
    seller: string
    buyOn: string
    note: string
    eurNote: string
    howToBuy: string
    more: string
    shareText: (title: string, price: string | null) => string
  }
  manifesto: {
    intro: string
    cta: string
    ctaSub: string
    steps: Step[]
  }
  socials: { intro: string; comingSoon: string; footer: string }
  countdown: {
    days: string
    hrs: string
    min: string
    sec: string
    live: string
    black: string
    white: string
    purple: string
    caption: string
  }
  promo: {
    headline: string
    tapToCopy: string
    copied: string
    bodyBefore: string
    highlight: string
    bodyAfter: string
    claim: string
    noThanks: string
    dialogAria: string
    closeOffer: string
    copyAria: (code: string) => string
  }
  notFound: { title: string; body: string; browseAll: string; latest: string }
  prefs: {
    language: string
    currency: string
    aria: string
    /** `live`: the rate came from the ECB today (otherwise it's an approximation). */
    rate: (eurPerUsd: string, live: boolean) => string
  }
  /** Category chips and card tags (sheet values are English upper case). */
  categories: Record<string, string>
}

const en: Messages = {
  section: {
    drops: 'LATEST DROPS',
    archive: 'ALL ITEMS',
    sellers: 'SELLERS',
    manifesto: 'HOW TO BUY',
    socials: 'SOCIALS',
    countdown: 'BURBERRY PUFFER LINKS',
    favourites: 'MY FAVOURITES',
  },
  tab: {
    drops: 'Latest Drops',
    archive: 'All Items',
    sellers: 'Sellers',
    manifesto: 'How to Buy',
    socials: 'Socials',
    countdown: 'Burberry Puffer Links',
    favourites: 'My Favourites',
  },
  menu: {
    newBadge: (n) => `${n} NEW`,
    ariaNew: (label, n) => `${label}, ${n} new this week`,
    ariaSaved: (label, n) => `${label}, ${n} saved`,
    burberryAria: 'Open the Burberry puffer links',
    navigate: 'NAVIGATE',
    confirm: 'CONFIRM',
    mainMenu: 'Main menu',
    slideshowAria: 'Open all items',
  },
  common: {
    menu: 'MENU',
    back: 'BACK',
    all: 'ALL',
    category: 'CATEGORY',
    brand: 'BRAND',
    seller: 'SELLER',
    loading: 'LOADING',
    loadingSr: 'the catalogue',
    close: 'Close',
    share: 'SHARE',
    copied: 'COPIED',
    copyLink: 'COPY LINK',
    buy: 'BUY',
    items: (n) => `${formatCount('en', n)} ${n === 1 ? 'ITEM' : 'ITEMS'}`,
    newCount: (n) => `${formatCount('en', n)} NEW`,
    searchPlaceholder: 'Search items…',
    searchAria: 'Search items',
    clearSearch: 'Clear search',
    noItemsFound: 'NO ITEMS FOUND',
    emptyDrawer: 'NOTHING IN THIS DRAWER YET',
  },
  drops: { intro: 'Everything dropped in the last seven days. Daily updates!' },
  archive: { intro: (n) => `Every item catalogued: ${formatCount('en', n)} finds and more added daily.` },
  sellers: { intro: 'Every plug in one place, every seller verified before they touch the feed.' },
  grid: {
    shuffle: 'SHUFFLE',
    shuffleAria: 'Shuffle products',
    reported: 'THANKS, REPORTED!',
    loadMore: 'LOAD MORE',
    viewAria: (t) => `View ${t}`,
    reportAria: (t) => `Report ${t}`,
    reportTitle: 'Report this item',
    buyAria: (t) => `Buy ${t}`,
    reportItem: 'REPORT ITEM',
    deadLink: 'DEAD LINK',
    outOfStock: 'OUT OF STOCK',
    submit: 'SUBMIT',
    sending: 'SENDING…',
    reportDialog: 'Report product',
  },
  fav: {
    save: 'SAVE',
    saved: 'SAVED',
    addAria: (t) => `Save ${t} to My Favourites`,
    removeAria: (t) => `Remove ${t} from My Favourites`,
    saveTip: 'Save to My Favourites',
    savedTip: 'Saved to My Favourites',
    linkAria: (n) => `My Favourites (${n} saved)`,
  },
  favPage: {
    savedCount: (n) => `${formatCount('en', n)} saved ${n === 1 ? 'find' : 'finds'}.`,
    emptyLine: 'Your saved finds live here.',
    totalPrefix: 'Total about',
    beforeShipping: 'before shipping',
    withoutPrice: (n) => `(${n} without price)`,
    howItWorks: 'HOW IT WORKS',
    clearAll: 'CLEAR ALL',
    tapAgain: 'TAP AGAIN TO CLEAR',
    unavailable: (n) => `${n} saved ${n === 1 ? 'item is' : 'items are'} no longer available.`,
    remove: 'REMOVE',
    loadingFavs: 'LOADING YOUR FAVOURITES…',
    noFavs: 'NO FAVOURITES YET',
  },
  intro: {
    kicker: 'HOW IT WORKS',
    title: 'MY FAVOURITES',
    lead: 'Save the finds you like and come back to them anytime.',
    step1: 'Tap the {heart} on any item in {drops} or {all}.',
    step2: 'It lands here instantly. No account, no sign-up.',
    step3: 'Hit {buy} when you’re ready, or tap the heart again to remove it.',
    note: 'Your favourites are saved in this browser on this device. Clearing your browser data removes them.',
    gotIt: 'GOT IT',
    browse: 'BROWSE DROPS',
  },
  filters: {
    title: 'FILTERS',
    clearAll: 'CLEAR ALL',
    show: (n) => `SHOW ${formatCount('en', n)} ${n === 1 ? 'ITEM' : 'ITEMS'}`,
    close: 'Close filters',
    remove: (label, value) => `Remove ${label.toLowerCase()} filter ${value}`,
    findBrand: 'Find a brand…',
    findSeller: 'Find a seller…',
    noMatch: (q) => `No matches for “${q}”.`,
  },
  item: {
    seller: 'SELLER',
    buyOn: 'BUY ON KAKOBUY',
    note: 'Price is the seller’s listing converted by Kakobuy. Shipping is paid separately once your haul reaches the warehouse.',
    eurNote: 'Prices in € are an estimate at today’s exchange rate.',
    howToBuy: 'How to buy',
    more: 'MORE LIKE THIS',
    shareText: (title, price) => `${title}${price ? ` · ${price}` : ''} on Fashion Sea`,
  },
  manifesto: {
    intro: 'Eight steps from account to doorstep. Follow them in order — start with the account link so your coupons lock in.',
    cta: 'Create your account',
    ctaSub: '+ unlock $400+ in free coupons',
    steps: [
      { title: 'CREATE AN ACCOUNT', body: 'Sign up on Kakobuy using the link below. Important — use this link so your coupons apply.' },
      { title: 'FIND YOUR ITEM', body: 'Search directly on the website for the piece you want.' },
      { title: 'ADD TO CART', body: 'Choose the size, color, or variation if needed, then click “Add to Cart” or “Buy Now.”' },
      { title: 'PAY FOR THE ITEM · 1ST PAYMENT', body: 'This is the item cost only (not shipping yet). Kakobuy then buys it from the seller for you.' },
      { title: 'WAIT FOR WAREHOUSE ARRIVAL', body: 'Once the seller ships it, it heads to Kakobuy’s warehouse in China. You’ll get photos on arrival — inspect quality and ask for measurements.' },
      { title: 'SHIP TO YOUR HOME · 2ND PAYMENT', body: 'When you’re happy, click “Ship Now.” Choose a shipping method (EMS, DHL, YunExpress), packaging options (remove boxes, combine parcels), and pay the international shipping fee.' },
      { title: 'TRACK YOUR PARCEL', body: 'You’ll get a tracking number — follow it on Kakobuy or 17track.net. Delivery takes about 1–3 weeks depending on the method.' },
      { title: 'RECEIVE YOUR PACKAGE', body: 'Once it arrives, check your items. If something’s wrong, contact support or leave feedback.' },
    ],
  },
  socials: { intro: 'Find me everywhere.', comingSoon: 'COMING SOON', footer: 'FashionSea — © 2026 ALL SIGNALS RESERVED' },
  countdown: {
    days: 'DAYS',
    hrs: 'HRS',
    min: 'MIN',
    sec: 'SEC',
    live: 'LIVE NOW',
    black: 'BURBERRY PUFFER IN BLACK',
    white: 'BURBERRY PUFFER IN WHITE',
    purple: 'BURBERRY PUFFER IN PURPLE',
    caption: 'BURBERRY PUFFER',
  },
  promo: {
    headline: '-20% Off Shipping',
    tapToCopy: 'tap to copy',
    copied: 'copied!',
    bodyBefore: 'Unlock ',
    highlight: '$300+ in exclusive coupons',
    bodyAfter: ' — limited time only. Don’t miss the drop.',
    claim: 'Claim Coupons',
    noThanks: 'No thanks',
    dialogAria: 'Shipping discount offer',
    closeOffer: 'Close offer',
    copyAria: (code) => `Copy coupon code ${code}`,
  },
  notFound: {
    title: 'THIS FIND IS GONE',
    body: 'The item was removed or its link changed. Thousands of other finds are still up.',
    browseAll: 'BROWSE ALL ITEMS',
    latest: 'LATEST DROPS',
  },
  prefs: {
    language: 'LANGUAGE',
    currency: 'CURRENCY',
    aria: 'Language and currency',
    rate: (r, live) => `1 $ ≈ ${r} €${live ? ' · today’s ECB rate' : ''}`,
  },
  categories: {},
}

const fr: Messages = {
  section: {
    drops: 'NOUVEAUTÉS',
    archive: 'CATALOGUE',
    sellers: 'VENDEURS',
    manifesto: 'COMMENT ACHETER',
    socials: 'RÉSEAUX',
    countdown: 'LIENS DOUDOUNE BURBERRY',
    favourites: 'MES FAVORIS',
  },
  tab: {
    drops: 'Nouveautés',
    archive: 'Catalogue',
    sellers: 'Vendeurs',
    manifesto: 'Comment acheter',
    socials: 'Réseaux',
    countdown: 'Liens doudoune Burberry',
    favourites: 'Mes favoris',
  },
  menu: {
    newBadge: (n) => `${n} ${n > 1 ? 'NOUVEAUX' : 'NOUVEAU'}`,
    ariaNew: (label, n) => `${label}, ${n} ${n > 1 ? 'nouveautés' : 'nouveauté'} cette semaine`,
    ariaSaved: (label, n) => `${label}, ${n} ${n > 1 ? 'enregistrés' : 'enregistré'}`,
    burberryAria: 'Ouvrir les liens de la doudoune Burberry',
    navigate: 'NAVIGUER',
    confirm: 'VALIDER',
    mainMenu: 'Menu principal',
    slideshowAria: 'Ouvrir le catalogue',
  },
  common: {
    menu: 'MENU',
    back: 'RETOUR',
    all: 'TOUS',
    category: 'CATÉGORIE',
    brand: 'MARQUE',
    seller: 'VENDEUR',
    loading: 'CHARGEMENT',
    loadingSr: 'du catalogue',
    close: 'Fermer',
    share: 'PARTAGER',
    copied: 'COPIÉ',
    copyLink: 'COPIER LE LIEN',
    buy: 'ACHETER',
    items: (n) => `${formatCount('fr', n)} ${n > 1 ? 'ARTICLES' : 'ARTICLE'}`,
    newCount: (n) => `${formatCount('fr', n)} ${n > 1 ? 'NOUVEAUX' : 'NOUVEAU'}`,
    searchPlaceholder: 'Rechercher un article…',
    searchAria: 'Rechercher un article',
    clearSearch: 'Effacer la recherche',
    noItemsFound: 'AUCUN ARTICLE TROUVÉ',
    emptyDrawer: 'RIEN ICI POUR L’INSTANT',
  },
  drops: { intro: 'Tout ce qui est arrivé ces sept derniers jours. Mis à jour chaque jour !' },
  archive: {
    intro: (n) => `Tout le catalogue : ${formatCount('fr', n)} trouvailles, et de nouvelles chaque jour.`,
  },
  sellers: { intro: 'Tous les vendeurs au même endroit, chacun vérifié avant d’apparaître ici.' },
  grid: {
    shuffle: 'MÉLANGER',
    shuffleAria: 'Mélanger les articles',
    reported: 'MERCI, C’EST SIGNALÉ !',
    loadMore: 'VOIR PLUS',
    viewAria: (t) => `Voir ${t}`,
    reportAria: (t) => `Signaler ${t}`,
    reportTitle: 'Signaler cet article',
    buyAria: (t) => `Acheter ${t}`,
    reportItem: 'SIGNALER L’ARTICLE',
    deadLink: 'LIEN MORT',
    outOfStock: 'RUPTURE DE STOCK',
    submit: 'ENVOYER',
    sending: 'ENVOI…',
    reportDialog: 'Signaler un article',
  },
  fav: {
    save: 'AJOUTER',
    saved: 'AJOUTÉ',
    addAria: (t) => `Ajouter ${t} à mes favoris`,
    removeAria: (t) => `Retirer ${t} de mes favoris`,
    saveTip: 'Ajouter à mes favoris',
    savedTip: 'Dans mes favoris',
    linkAria: (n) => `Mes favoris (${n})`,
  },
  favPage: {
    savedCount: (n) =>
      `${formatCount('fr', n)} ${n > 1 ? 'trouvailles enregistrées' : 'trouvaille enregistrée'}.`,
    emptyLine: 'Tes trouvailles enregistrées apparaissent ici.',
    totalPrefix: 'Total d’environ',
    beforeShipping: 'hors livraison',
    withoutPrice: (n) => `(${n} sans prix)`,
    howItWorks: 'COMMENT ÇA MARCHE',
    clearAll: 'TOUT EFFACER',
    tapAgain: 'APPUIE ENCORE POUR EFFACER',
    unavailable: (n) =>
      n > 1
        ? `${n} articles enregistrés ne sont plus disponibles.`
        : `${n} article enregistré n’est plus disponible.`,
    remove: 'RETIRER',
    loadingFavs: 'CHARGEMENT DE TES FAVORIS…',
    noFavs: 'PAS ENCORE DE FAVORIS',
  },
  intro: {
    kicker: 'COMMENT ÇA MARCHE',
    title: 'MES FAVORIS',
    lead: 'Garde les trouvailles qui te plaisent et retrouve-les quand tu veux.',
    step1: 'Appuie sur le {heart} d’un article dans {drops} ou {all}.',
    step2: 'Il arrive ici aussitôt. Pas de compte, pas d’inscription.',
    step3: 'Appuie sur {buy} quand tu es prêt, ou touche à nouveau le cœur pour le retirer.',
    note: 'Tes favoris sont enregistrés dans ce navigateur, sur cet appareil. Effacer les données du navigateur les supprime.',
    gotIt: 'COMPRIS',
    browse: 'VOIR LES NOUVEAUTÉS',
  },
  filters: {
    title: 'FILTRES',
    clearAll: 'TOUT EFFACER',
    show: (n) => `VOIR ${formatCount('fr', n)} ${n > 1 ? 'ARTICLES' : 'ARTICLE'}`,
    close: 'Fermer les filtres',
    remove: (label, value) => `Retirer le filtre ${label.toLowerCase()} ${value}`,
    findBrand: 'Chercher une marque…',
    findSeller: 'Chercher un vendeur…',
    noMatch: (q) => `Aucun résultat pour « ${q} ».`,
  },
  item: {
    seller: 'VENDEUR',
    buyOn: 'ACHETER SUR KAKOBUY',
    note: 'Prix de l’annonce du vendeur, converti par Kakobuy. La livraison se paie à part, une fois ton colis arrivé à l’entrepôt.',
    eurNote: 'Les prix en € sont une estimation au taux de change du jour.',
    howToBuy: 'Comment acheter',
    more: 'DANS LE MÊME STYLE',
    shareText: (title, price) => `${title}${price ? ` · ${price}` : ''} sur Fashion Sea`,
  },
  manifesto: {
    intro: 'Huit étapes, de l’inscription jusqu’à ta porte. Suis-les dans l’ordre, en commençant par le lien d’inscription pour que tes coupons s’activent.',
    cta: 'Crée ton compte',
    ctaSub: '+ débloque plus de 400 $ de coupons offerts',
    steps: [
      { title: 'CRÉE UN COMPTE', body: 'Inscris-toi sur Kakobuy avec le lien ci-dessous. Important : utilise bien ce lien pour que tes coupons s’appliquent.' },
      { title: 'TROUVE TON ARTICLE', body: 'Cherche directement sur le site la pièce que tu veux.' },
      { title: 'AJOUTE AU PANIER', body: 'Choisis la taille, la couleur ou la variante si besoin, puis clique sur « Add to Cart » ou « Buy Now ».' },
      { title: 'PAIE L’ARTICLE · 1ER PAIEMENT', body: 'Tu paies seulement le prix de l’article (pas encore la livraison). Kakobuy l’achète ensuite au vendeur pour toi.' },
      { title: 'ATTENDS L’ARRIVÉE À L’ENTREPÔT', body: 'Une fois expédié par le vendeur, il part à l’entrepôt de Kakobuy en Chine. Tu reçois des photos à l’arrivée : vérifie la qualité et demande les mesures.' },
      { title: 'FAIS-TOI LIVRER · 2E PAIEMENT', body: 'Quand tout te va, clique sur « Ship Now ». Choisis un mode de livraison (EMS, DHL, YunExpress), les options d’emballage (retirer les boîtes, regrouper les colis) et paie les frais de port internationaux.' },
      { title: 'SUIS TON COLIS', body: 'Tu reçois un numéro de suivi : suis-le sur Kakobuy ou sur 17track.net. Compte environ 1 à 3 semaines selon le mode de livraison.' },
      { title: 'RÉCEPTIONNE TON COLIS', body: 'À l’arrivée, vérifie tes articles. En cas de problème, contacte le support ou laisse un avis.' },
    ],
  },
  socials: { intro: 'Retrouve-moi partout.', comingSoon: 'BIENTÔT', footer: 'FashionSea — © 2026 TOUS SIGNAUX RÉSERVÉS' },
  countdown: {
    days: 'JOURS',
    hrs: 'HEURES',
    min: 'MIN',
    sec: 'SEC',
    live: 'C’EST EN LIGNE',
    black: 'DOUDOUNE BURBERRY NOIRE',
    white: 'DOUDOUNE BURBERRY BLANCHE',
    purple: 'DOUDOUNE BURBERRY VIOLETTE',
    caption: 'DOUDOUNE BURBERRY',
  },
  promo: {
    headline: '-20 % sur la livraison',
    tapToCopy: 'touche pour copier',
    copied: 'copié !',
    bodyBefore: 'Débloque ',
    highlight: 'plus de 300 $ de coupons exclusifs',
    bodyAfter: ', pour une durée limitée. Ne rate pas le drop.',
    claim: 'Récupérer les coupons',
    noThanks: 'Non merci',
    dialogAria: 'Offre de réduction sur la livraison',
    closeOffer: 'Fermer l’offre',
    copyAria: (code) => `Copier le code ${code}`,
  },
  notFound: {
    title: 'CETTE TROUVAILLE A DISPARU',
    body: 'L’article a été retiré ou son lien a changé. Des milliers d’autres trouvailles t’attendent.',
    browseAll: 'VOIR TOUT LE CATALOGUE',
    latest: 'NOUVEAUTÉS',
  },
  prefs: {
    language: 'LANGUE',
    currency: 'DEVISE',
    aria: 'Langue et devise',
    rate: (r, live) => `1 $ ≈ ${r} €${live ? ' · taux BCE du jour' : ''}`,
  },
  categories: {
    PANTS: 'PANTALONS',
    SWEATPANTS: 'JOGGINGS',
    SHORTS: 'SHORTS',
    HOODIES: 'HOODIES',
    'ZIP-UPS': 'ZIPPÉS',
    JACKETS: 'VESTES',
    COATS: 'MANTEAUX',
    SWEATS: 'SWEATS',
    SWEATERS: 'PULLS',
    'T-SHIRTS': 'T-SHIRTS',
    LONGSLEEVES: 'MANCHES LONGUES',
    TANKTOPS: 'DÉBARDEURS',
    SHIRTS: 'CHEMISES',
    JERSEYS: 'MAILLOTS',
    SETS: 'ENSEMBLES',
    SHOES: 'CHAUSSURES',
    BOOTS: 'BOTTES',
    SLIDES: 'CLAQUETTES',
    MERCH: 'MERCH',
    ACCESSORIES: 'ACCESSOIRES',
    CAPS: 'CASQUETTES',
    HATS: 'BONNETS',
    SCARVES: 'ÉCHARPES',
    GLOVES: 'GANTS',
    BELTS: 'CEINTURES',
    BAGS: 'SACS',
    BACKPACKS: 'SACS À DOS',
    JEWELLERY: 'BIJOUX',
    TECH: 'TECH',
    FIGURINES: 'FIGURINES',
    BOXERS: 'BOXERS',
  },
}

const ruForms = (one: string, few: string, many: string): Forms => ({ one, few, many, other: few })

const ru: Messages = {
  section: {
    drops: 'НОВИНКИ',
    archive: 'КАТАЛОГ',
    sellers: 'ПРОДАВЦЫ',
    manifesto: 'КАК КУПИТЬ',
    socials: 'СОЦСЕТИ',
    countdown: 'ПУХОВИК BURBERRY',
    favourites: 'ИЗБРАННОЕ',
  },
  tab: {
    drops: 'Новинки',
    archive: 'Каталог',
    sellers: 'Продавцы',
    manifesto: 'Как купить',
    socials: 'Соцсети',
    countdown: 'Пуховик Burberry',
    favourites: 'Избранное',
  },
  menu: {
    newBadge: (n) => `${n} ${plural('ru', n, ruForms('НОВЫЙ', 'НОВЫХ', 'НОВЫХ'))}`,
    ariaNew: (label, n) => `${label}: новинок за неделю — ${n}`,
    ariaSaved: (label, n) => `${label}: сохранено — ${n}`,
    burberryAria: 'Открыть ссылки на пуховик Burberry',
    navigate: 'НАВИГАЦИЯ',
    confirm: 'ВЫБРАТЬ',
    mainMenu: 'Главное меню',
    slideshowAria: 'Открыть каталог',
  },
  common: {
    menu: 'МЕНЮ',
    back: 'НАЗАД',
    all: 'ВСЕ',
    category: 'КАТЕГОРИЯ',
    brand: 'БРЕНД',
    seller: 'ПРОДАВЕЦ',
    loading: 'ЗАГРУЗКА',
    loadingSr: 'каталога',
    close: 'Закрыть',
    share: 'ПОДЕЛИТЬСЯ',
    copied: 'СКОПИРОВАНО',
    copyLink: 'КОПИРОВАТЬ ССЫЛКУ',
    buy: 'КУПИТЬ',
    items: (n) => `${formatCount('ru', n)} ${plural('ru', n, ruForms('ТОВАР', 'ТОВАРА', 'ТОВАРОВ'))}`,
    newCount: (n) => `${formatCount('ru', n)} ${plural('ru', n, ruForms('НОВЫЙ', 'НОВЫХ', 'НОВЫХ'))}`,
    searchPlaceholder: 'Поиск товаров…',
    searchAria: 'Поиск товаров',
    clearSearch: 'Очистить поиск',
    noItemsFound: 'НИЧЕГО НЕ НАЙДЕНО',
    emptyDrawer: 'ЗДЕСЬ ПОКА ПУСТО',
  },
  drops: { intro: 'Всё, что появилось за последние семь дней. Обновляется каждый день!' },
  archive: {
    intro: (n) =>
      `Весь каталог: ${formatCount('ru', n)} ${plural('ru', n, ruForms('находка', 'находки', 'находок'))}, и каждый день добавляются новые.`,
  },
  sellers: { intro: 'Все продавцы в одном месте — каждый проверен, прежде чем попасть в ленту.' },
  grid: {
    shuffle: 'ПЕРЕМЕШАТЬ',
    shuffleAria: 'Перемешать товары',
    reported: 'СПАСИБО, ОТПРАВЛЕНО!',
    loadMore: 'ПОКАЗАТЬ ЕЩЁ',
    viewAria: (t) => `Открыть: ${t}`,
    reportAria: (t) => `Сообщить о проблеме: ${t}`,
    reportTitle: 'Сообщить о проблеме',
    buyAria: (t) => `Купить: ${t}`,
    reportItem: 'СООБЩИТЬ О ПРОБЛЕМЕ',
    deadLink: 'НЕРАБОЧАЯ ССЫЛКА',
    outOfStock: 'НЕТ В НАЛИЧИИ',
    submit: 'ОТПРАВИТЬ',
    sending: 'ОТПРАВКА…',
    reportDialog: 'Сообщить о товаре',
  },
  fav: {
    save: 'В ИЗБРАННОЕ',
    saved: 'В ИЗБРАННОМ',
    addAria: (t) => `Добавить в избранное: ${t}`,
    removeAria: (t) => `Убрать из избранного: ${t}`,
    saveTip: 'Добавить в избранное',
    savedTip: 'В избранном',
    linkAria: (n) => `Избранное (${n})`,
  },
  favPage: {
    savedCount: (n) =>
      `${formatCount('ru', n)} ${plural('ru', n, ruForms('сохранённая находка', 'сохранённые находки', 'сохранённых находок'))}.`,
    emptyLine: 'Здесь хранятся твои сохранённые находки.',
    totalPrefix: 'Итого примерно',
    beforeShipping: 'без учёта доставки',
    withoutPrice: (n) => `(без цены: ${n})`,
    howItWorks: 'КАК ЭТО РАБОТАЕТ',
    clearAll: 'ОЧИСТИТЬ ВСЁ',
    tapAgain: 'НАЖМИ ЕЩЁ РАЗ, ЧТОБЫ ОЧИСТИТЬ',
    unavailable: (n) => `Сохранённые товары, которых больше нет: ${n}.`,
    remove: 'УБРАТЬ',
    loadingFavs: 'ЗАГРУЖАЕМ ИЗБРАННОЕ…',
    noFavs: 'В ИЗБРАННОМ ПОКА ПУСТО',
  },
  intro: {
    kicker: 'КАК ЭТО РАБОТАЕТ',
    title: 'ИЗБРАННОЕ',
    lead: 'Сохраняй понравившиеся находки и возвращайся к ним в любой момент.',
    step1: 'Нажми {heart} на любом товаре в разделах {drops} или {all}.',
    step2: 'Он сразу появится здесь. Без аккаунта и регистрации.',
    step3: 'Жми {buy}, когда будешь готов, или нажми на сердечко ещё раз, чтобы убрать товар.',
    note: 'Избранное хранится в этом браузере на этом устройстве. Если очистить данные браузера, оно удалится.',
    gotIt: 'ПОНЯТНО',
    browse: 'СМОТРЕТЬ НОВИНКИ',
  },
  filters: {
    title: 'ФИЛЬТРЫ',
    clearAll: 'СБРОСИТЬ',
    show: (n) => `ПОКАЗАТЬ ${formatCount('ru', n)} ${plural('ru', n, ruForms('ТОВАР', 'ТОВАРА', 'ТОВАРОВ'))}`,
    close: 'Закрыть фильтры',
    remove: (label, value) => `Убрать фильтр «${label.toLowerCase()}»: ${value}`,
    findBrand: 'Найти бренд…',
    findSeller: 'Найти продавца…',
    noMatch: (q) => `Ничего не найдено по запросу «${q}».`,
  },
  item: {
    seller: 'ПРОДАВЕЦ',
    buyOn: 'КУПИТЬ НА KAKOBUY',
    note: 'Цена продавца, пересчитанная Kakobuy. Доставка оплачивается отдельно, когда посылка придёт на склад.',
    eurNote: 'Цены в € — примерный пересчёт по сегодняшнему курсу.',
    howToBuy: 'Как купить',
    more: 'ПОХОЖИЕ ВЕЩИ',
    shareText: (title, price) => `${title}${price ? ` · ${price}` : ''} на Fashion Sea`,
  },
  manifesto: {
    intro: 'Восемь шагов от регистрации до посылки у двери. Делай всё по порядку и начни со ссылки на регистрацию, чтобы купоны закрепились за тобой.',
    cta: 'Создай аккаунт',
    ctaSub: '+ получи купоны на $400+',
    steps: [
      { title: 'СОЗДАЙ АККАУНТ', body: 'Зарегистрируйся на Kakobuy по ссылке ниже. Важно: используй именно эту ссылку, чтобы купоны применились.' },
      { title: 'НАЙДИ ТОВАР', body: 'Найди нужную вещь прямо через поиск на сайте.' },
      { title: 'ДОБАВЬ В КОРЗИНУ', body: 'При необходимости выбери размер, цвет или вариант, затем нажми «Add to Cart» или «Buy Now».' },
      { title: 'ОПЛАТИ ТОВАР · 1-Й ПЛАТЁЖ', body: 'Это только стоимость товара (доставку пока не платишь). Затем Kakobuy выкупает его у продавца за тебя.' },
      { title: 'ЖДИ ПРИБЫТИЯ НА СКЛАД', body: 'Когда продавец отправит заказ, он поедет на склад Kakobuy в Китае. По прибытии ты получишь фото — проверь качество и попроси замеры.' },
      { title: 'ОТПРАВЬ ДОМОЙ · 2-Й ПЛАТЁЖ', body: 'Если всё устраивает, нажми «Ship Now». Выбери способ доставки (EMS, DHL, YunExpress), варианты упаковки (убрать коробки, объединить посылки) и оплати международную доставку.' },
      { title: 'ОТСЛЕЖИВАЙ ПОСЫЛКУ', body: 'Ты получишь трек-номер — отслеживай его на Kakobuy или 17track.net. Доставка занимает примерно 1–3 недели в зависимости от способа.' },
      { title: 'ПОЛУЧИ ПОСЫЛКУ', body: 'Когда посылка придёт, проверь вещи. Если что-то не так, напиши в поддержку или оставь отзыв.' },
    ],
  },
  socials: { intro: 'Ищи меня везде.', comingSoon: 'СКОРО', footer: 'FashionSea — © 2026 ВСЕ СИГНАЛЫ ЗАЩИЩЕНЫ' },
  countdown: {
    days: 'ДНЕЙ',
    hrs: 'ЧАСОВ',
    min: 'МИН',
    sec: 'СЕК',
    live: 'УЖЕ В ПРОДАЖЕ',
    black: 'ПУХОВИК BURBERRY ЧЁРНЫЙ',
    white: 'ПУХОВИК BURBERRY БЕЛЫЙ',
    purple: 'ПУХОВИК BURBERRY ФИОЛЕТОВЫЙ',
    caption: 'ПУХОВИК BURBERRY',
  },
  promo: {
    headline: '−20% на доставку',
    tapToCopy: 'нажми, чтобы скопировать',
    copied: 'скопировано!',
    bodyBefore: 'Получи ',
    highlight: 'эксклюзивные купоны на $300+',
    bodyAfter: ' — только ограниченное время. Не пропусти дроп.',
    claim: 'Забрать купоны',
    noThanks: 'Нет, спасибо',
    dialogAria: 'Скидка на доставку',
    closeOffer: 'Закрыть предложение',
    copyAria: (code) => `Скопировать промокод ${code}`,
  },
  notFound: {
    title: 'ЭТОЙ НАХОДКИ БОЛЬШЕ НЕТ',
    body: 'Товар удалён или его ссылка изменилась. Тысячи других находок всё ещё на месте.',
    browseAll: 'СМОТРЕТЬ КАТАЛОГ',
    latest: 'НОВИНКИ',
  },
  prefs: {
    language: 'ЯЗЫК',
    currency: 'ВАЛЮТА',
    aria: 'Язык и валюта',
    rate: (r, live) => `1 $ ≈ ${r} €${live ? ' · курс ЕЦБ на сегодня' : ''}`,
  },
  categories: {
    PANTS: 'БРЮКИ',
    SWEATPANTS: 'ДЖОГГЕРЫ',
    SHORTS: 'ШОРТЫ',
    HOODIES: 'ХУДИ',
    'ZIP-UPS': 'ЗИП-ХУДИ',
    JACKETS: 'КУРТКИ',
    COATS: 'ПАЛЬТО',
    SWEATS: 'СВИТШОТЫ',
    SWEATERS: 'СВИТЕРЫ',
    'T-SHIRTS': 'ФУТБОЛКИ',
    LONGSLEEVES: 'ЛОНГСЛИВЫ',
    TANKTOPS: 'МАЙКИ',
    SHIRTS: 'РУБАШКИ',
    JERSEYS: 'ДЖЕРСИ',
    SETS: 'КОМПЛЕКТЫ',
    SHOES: 'ОБУВЬ',
    BOOTS: 'БОТИНКИ',
    SLIDES: 'СЛАЙДЫ',
    MERCH: 'МЕРЧ',
    ACCESSORIES: 'АКСЕССУАРЫ',
    CAPS: 'КЕПКИ',
    HATS: 'ШАПКИ',
    SCARVES: 'ШАРФЫ',
    GLOVES: 'ПЕРЧАТКИ',
    BELTS: 'РЕМНИ',
    BAGS: 'СУМКИ',
    BACKPACKS: 'РЮКЗАКИ',
    JEWELLERY: 'УКРАШЕНИЯ',
    TECH: 'TECH',
    FIGURINES: 'ФИГУРКИ',
    BOXERS: 'БОКСЕРЫ',
  },
}

const plForms = (one: string, few: string, many: string): Forms => ({ one, few, many, other: few })

const pl: Messages = {
  section: {
    drops: 'NOWOŚCI',
    archive: 'KATALOG',
    sellers: 'SPRZEDAWCY',
    manifesto: 'JAK KUPIĆ',
    socials: 'SOCIALE',
    countdown: 'PUCHÓWKA BURBERRY',
    favourites: 'ULUBIONE',
  },
  tab: {
    drops: 'Nowości',
    archive: 'Katalog',
    sellers: 'Sprzedawcy',
    manifesto: 'Jak kupić',
    socials: 'Sociale',
    countdown: 'Puchówka Burberry',
    favourites: 'Ulubione',
  },
  menu: {
    newBadge: (n) => `${n} ${plural('pl', n, plForms('NOWY', 'NOWE', 'NOWYCH'))}`,
    ariaNew: (label, n) => `${label}: nowości w tym tygodniu — ${n}`,
    ariaSaved: (label, n) => `${label}: zapisane — ${n}`,
    burberryAria: 'Otwórz linki do puchówki Burberry',
    navigate: 'NAWIGACJA',
    confirm: 'WYBIERZ',
    mainMenu: 'Menu główne',
    slideshowAria: 'Otwórz katalog',
  },
  common: {
    menu: 'MENU',
    back: 'WSTECZ',
    all: 'WSZYSTKO',
    category: 'KATEGORIA',
    brand: 'MARKA',
    seller: 'SPRZEDAWCA',
    loading: 'ŁADOWANIE',
    loadingSr: 'katalogu',
    close: 'Zamknij',
    share: 'UDOSTĘPNIJ',
    copied: 'SKOPIOWANO',
    copyLink: 'KOPIUJ LINK',
    buy: 'KUP',
    items: (n) => `${formatCount('pl', n)} ${plural('pl', n, plForms('PRODUKT', 'PRODUKTY', 'PRODUKTÓW'))}`,
    newCount: (n) => `${formatCount('pl', n)} ${plural('pl', n, plForms('NOWY', 'NOWE', 'NOWYCH'))}`,
    searchPlaceholder: 'Szukaj produktów…',
    searchAria: 'Szukaj produktów',
    clearSearch: 'Wyczyść wyszukiwanie',
    noItemsFound: 'NIC NIE ZNALEZIONO',
    emptyDrawer: 'NA RAZIE NIC TU NIE MA',
  },
  drops: { intro: 'Wszystko, co pojawiło się w ostatnich siedmiu dniach. Codzienne aktualizacje!' },
  archive: {
    intro: (n) =>
      `Cały katalog: ${formatCount('pl', n)} ${plural('pl', n, plForms('znalezisko', 'znaleziska', 'znalezisk'))} i codziennie dochodzą nowe.`,
  },
  sellers: { intro: 'Wszyscy sprzedawcy w jednym miejscu, każdy sprawdzony, zanim trafi do feedu.' },
  grid: {
    shuffle: 'WYMIESZAJ',
    shuffleAria: 'Wymieszaj produkty',
    reported: 'DZIĘKI, ZGŁOSZONO!',
    loadMore: 'POKAŻ WIĘCEJ',
    viewAria: (t) => `Zobacz: ${t}`,
    reportAria: (t) => `Zgłoś: ${t}`,
    reportTitle: 'Zgłoś ten produkt',
    buyAria: (t) => `Kup: ${t}`,
    reportItem: 'ZGŁOŚ PRODUKT',
    deadLink: 'MARTWY LINK',
    outOfStock: 'BRAK W MAGAZYNIE',
    submit: 'WYŚLIJ',
    sending: 'WYSYŁANIE…',
    reportDialog: 'Zgłoś produkt',
  },
  fav: {
    save: 'ZAPISZ',
    saved: 'ZAPISANO',
    addAria: (t) => `Dodaj do ulubionych: ${t}`,
    removeAria: (t) => `Usuń z ulubionych: ${t}`,
    saveTip: 'Dodaj do ulubionych',
    savedTip: 'W ulubionych',
    linkAria: (n) => `Ulubione (${n})`,
  },
  favPage: {
    savedCount: (n) =>
      `${formatCount('pl', n)} ${plural('pl', n, plForms('zapisane znalezisko', 'zapisane znaleziska', 'zapisanych znalezisk'))}.`,
    emptyLine: 'Tutaj trafiają twoje zapisane znaleziska.',
    totalPrefix: 'Razem około',
    beforeShipping: 'bez wysyłki',
    withoutPrice: (n) => `(bez ceny: ${n})`,
    howItWorks: 'JAK TO DZIAŁA',
    clearAll: 'WYCZYŚĆ WSZYSTKO',
    tapAgain: 'DOTKNIJ PONOWNIE, ABY WYCZYŚCIĆ',
    unavailable: (n) => `Zapisane produkty, których już nie ma: ${n}.`,
    remove: 'USUŃ',
    loadingFavs: 'ŁADOWANIE ULUBIONYCH…',
    noFavs: 'NIE MASZ JESZCZE ULUBIONYCH',
  },
  intro: {
    kicker: 'JAK TO DZIAŁA',
    title: 'ULUBIONE',
    lead: 'Zapisuj znaleziska, które ci się podobają, i wracaj do nich, kiedy chcesz.',
    step1: 'Kliknij {heart} przy dowolnym produkcie w {drops} lub {all}.',
    step2: 'Od razu pojawi się tutaj. Bez konta i bez rejestracji.',
    step3: 'Kliknij {buy}, gdy będziesz gotowy, albo kliknij serce jeszcze raz, żeby usunąć produkt.',
    note: 'Ulubione są zapisane w tej przeglądarce na tym urządzeniu. Wyczyszczenie danych przeglądarki je usunie.',
    gotIt: 'ROZUMIEM',
    browse: 'ZOBACZ NOWOŚCI',
  },
  filters: {
    title: 'FILTRY',
    clearAll: 'WYCZYŚĆ',
    show: (n) => `POKAŻ ${formatCount('pl', n)} ${plural('pl', n, plForms('PRODUKT', 'PRODUKTY', 'PRODUKTÓW'))}`,
    close: 'Zamknij filtry',
    remove: (label, value) => `Usuń filtr ${label.toLowerCase()}: ${value}`,
    findBrand: 'Szukaj marki…',
    findSeller: 'Szukaj sprzedawcy…',
    noMatch: (q) => `Brak wyników dla „${q}”.`,
  },
  item: {
    seller: 'SPRZEDAWCA',
    buyOn: 'KUP NA KAKOBUY',
    note: 'Cena z oferty sprzedawcy przeliczona przez Kakobuy. Za wysyłkę płacisz osobno, gdy paczka dotrze do magazynu.',
    eurNote: 'Ceny w € to szacunek według dzisiejszego kursu.',
    howToBuy: 'Jak kupić',
    more: 'PODOBNE PRODUKTY',
    shareText: (title, price) => `${title}${price ? ` · ${price}` : ''} na Fashion Sea`,
  },
  manifesto: {
    intro: 'Osiem kroków od założenia konta do paczki pod drzwiami. Rób je po kolei i zacznij od linku do rejestracji, żeby kupony się aktywowały.',
    cta: 'Załóż konto',
    ctaSub: '+ odbierz kupony o wartości $400+',
    steps: [
      { title: 'ZAŁÓŻ KONTO', body: 'Zarejestruj się na Kakobuy przez link poniżej. Ważne: użyj właśnie tego linku, żeby kupony zadziałały.' },
      { title: 'ZNAJDŹ PRODUKT', body: 'Wyszukaj na stronie rzecz, którą chcesz kupić.' },
      { title: 'DODAJ DO KOSZYKA', body: 'W razie potrzeby wybierz rozmiar, kolor lub wariant, a potem kliknij „Add to Cart” albo „Buy Now”.' },
      { title: 'ZAPŁAĆ ZA PRODUKT · 1. PŁATNOŚĆ', body: 'To tylko cena produktu (jeszcze bez wysyłki). Kakobuy kupuje go potem za ciebie od sprzedawcy.' },
      { title: 'POCZEKAJ NA DOSTAWĘ DO MAGAZYNU', body: 'Gdy sprzedawca wyśle produkt, trafi on do magazynu Kakobuy w Chinach. Po dotarciu dostaniesz zdjęcia — sprawdź jakość i poproś o wymiary.' },
      { title: 'WYŚLIJ DO DOMU · 2. PŁATNOŚĆ', body: 'Jeśli wszystko ci pasuje, kliknij „Ship Now”. Wybierz metodę wysyłki (EMS, DHL, YunExpress), opcje pakowania (usunięcie pudełek, łączenie paczek) i zapłać za wysyłkę międzynarodową.' },
      { title: 'ŚLEDŹ PACZKĘ', body: 'Dostaniesz numer przesyłki — śledź ją na Kakobuy albo na 17track.net. Dostawa trwa około 1–3 tygodni, zależnie od metody.' },
      { title: 'ODBIERZ PACZKĘ', body: 'Gdy paczka dotrze, sprawdź produkty. Jeśli coś jest nie tak, skontaktuj się z obsługą albo zostaw opinię.' },
    ],
  },
  socials: { intro: 'Znajdziesz mnie wszędzie.', comingSoon: 'WKRÓTCE', footer: 'FashionSea — © 2026 WSZELKIE SYGNAŁY ZASTRZEŻONE' },
  countdown: {
    days: 'DNI',
    hrs: 'GODZ',
    min: 'MIN',
    sec: 'SEK',
    live: 'JUŻ DOSTĘPNE',
    black: 'PUCHÓWKA BURBERRY CZARNA',
    white: 'PUCHÓWKA BURBERRY BIAŁA',
    purple: 'PUCHÓWKA BURBERRY FIOLETOWA',
    caption: 'PUCHÓWKA BURBERRY',
  },
  promo: {
    headline: '-20% na wysyłkę',
    tapToCopy: 'dotknij, aby skopiować',
    copied: 'skopiowano!',
    bodyBefore: 'Odbierz ',
    highlight: 'ekskluzywne kupony o wartości $300+',
    bodyAfter: ' — tylko przez ograniczony czas. Nie przegap dropu.',
    claim: 'Odbierz kupony',
    noThanks: 'Nie, dzięki',
    dialogAria: 'Zniżka na wysyłkę',
    closeOffer: 'Zamknij ofertę',
    copyAria: (code) => `Skopiuj kod ${code}`,
  },
  notFound: {
    title: 'TEGO ZNALEZISKA JUŻ NIE MA',
    body: 'Produkt został usunięty albo zmienił się jego link. Tysiące innych znalezisk wciąż czekają.',
    browseAll: 'ZOBACZ CAŁY KATALOG',
    latest: 'NOWOŚCI',
  },
  prefs: {
    language: 'JĘZYK',
    currency: 'WALUTA',
    aria: 'Język i waluta',
    rate: (r, live) => `1 $ ≈ ${r} €${live ? ' · dzisiejszy kurs EBC' : ''}`,
  },
  categories: {
    PANTS: 'SPODNIE',
    SWEATPANTS: 'DRESY',
    SHORTS: 'SZORTY',
    HOODIES: 'HOODIE',
    'ZIP-UPS': 'ROZPINANE',
    JACKETS: 'KURTKI',
    COATS: 'PŁASZCZE',
    SWEATS: 'BLUZY',
    SWEATERS: 'SWETRY',
    'T-SHIRTS': 'T-SHIRTY',
    LONGSLEEVES: 'LONGSLEEVE',
    TANKTOPS: 'TANK TOPY',
    SHIRTS: 'KOSZULE',
    JERSEYS: 'JERSEYE',
    SETS: 'KOMPLETY',
    SHOES: 'BUTY',
    BOOTS: 'BOTKI',
    SLIDES: 'KLAPKI',
    MERCH: 'MERCH',
    ACCESSORIES: 'AKCESORIA',
    CAPS: 'CZAPKI Z DASZKIEM',
    HATS: 'CZAPKI',
    SCARVES: 'SZALIKI',
    GLOVES: 'RĘKAWICZKI',
    BELTS: 'PASKI',
    BAGS: 'TORBY',
    BACKPACKS: 'PLECAKI',
    JEWELLERY: 'BIŻUTERIA',
    TECH: 'TECH',
    FIGURINES: 'FIGURKI',
    BOXERS: 'BOKSERKI',
  },
}

export const MESSAGES: Record<Lang, Messages> = { en, fr, ru, pl }

/** Display label for a sheet category ("PANTS" → "PANTALONS"); unknown ones pass through. */
export function categoryLabel(m: Messages, category: string): string {
  if (category === 'ALL') return m.common.all
  return m.categories[category] ?? category
}

/** Pick the best supported language from the browser's preferences. */
export function detectLang(languages: readonly string[]): Lang {
  for (const l of languages) {
    const code = l.slice(0, 2).toLowerCase()
    if ((LANGS as readonly string[]).includes(code)) return code as Lang
  }
  return 'en'
}
