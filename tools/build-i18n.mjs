// Builds the translated pages from index.html (English, en-GB, the source of truth).
//   node tools/build-i18n.mjs
// For each language in LANGS it translates every text node and translatable attribute through
// i18n/<file>.json (keys are the English text), rewrites local paths for the subfolder, and writes
// <dir>/index.html. It also rewrites the generated blocks (hreflang links, the nav language menu and the
// footer language list) in every page, index.html included. It stops with an error when a string of the
// source has no translation, so a new English sentence can never ship untranslated.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.lexvertex.com/';

const LANGS = [
  { code: 'en-GB', dir: '',      name: 'English (UK)',       flag: 'gb', og: 'en_GB', dict: null },
  { code: 'es-ES', dir: 'es',    name: 'Español',            flag: 'es', og: 'es_ES', dict: 'es.json' },
  { code: 'fr-FR', dir: 'fr',    name: 'Français',           flag: 'fr', og: 'fr_FR', dict: 'fr.json' },
  { code: 'pt-BR', dir: 'pt-br', name: 'Português (Brasil)', flag: 'br', og: 'pt_BR', dict: 'pt-br.json' },
  { code: 'de-DE', dir: 'de',    name: 'Deutsch',            flag: 'de', og: 'de_DE', dict: 'de.json' },
  { code: 'zh-CN', dir: 'zh',    name: '简体中文',            flag: 'cn', og: 'zh_CN', dict: 'zh.json' },
];

// text that stays as written in every language (names)
const KEEP = new Set(['Lex Vertex', 'Goiânia, Goiás', '&copy; 2026 Lex Vertex Legal Consulting']);
const ATTRS = ['alt', 'aria-label', 'title', 'data-fix', 'data-sending', 'data-failed', 'data-sent'];
const LOCAL = /^(assets\/|flags\/|favicon\.svg|credits\.html|share\.jpg)/;

// the generated blocks are emptied first, so a second run never reads its own output as source text
const source = readFileSync(join(ROOT, 'index.html'), 'utf8')
  .replace(/<!--i18n:(alternates|switch|footer)-->[\s\S]*?<!--\/i18n:\1-->/g, (m, k) => `<!--i18n:${k}--><!--/i18n:${k}-->`);

// split html into [code, protected] chunks: comments, scripts and styles are never translated
function chunks(html) {
  return html.split(/(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/);
}

function translate(html, dict, missing) {
  const t = (s) => {
    const key = s.trim();
    if (!key || !/\p{L}/u.test(key) || KEEP.has(key) && !(dict && key in dict)) return s;
    if (!dict) return s;
    if (!(key in dict)) { missing.add(key); return s; }
    return s.replace(key, dict[key]);
  };
  const [head, body] = html.split(/(?=<body)/);
  // head: the title and the description and share texts only
  let h = head
    .replace(/<title>([^<]*)<\/title>/, (m, x) => `<title>${t(x)}</title>`)
    .replace(/(<meta (?:name="description"|property="og:(?:title|description|image:alt)"|name="twitter:(?:title|description)") content=")([^"]*)"/g, (m, a, x) => `${a}${t(x)}"`);
  // body: text nodes and translatable attributes, outside comments and scripts
  const b = chunks(body).map((part, i) => {
    if (i % 2) return part;
    return part
      .replace(/>([^<]+)</g, (m, x) => `>${t(x)}<`)
      .replace(new RegExp(`\\s(${ATTRS.join('|')})="([^"]+)"`, 'g'), (m, a, x) => ` ${a}="${t(x)}"`);
  }).join('');
  return h + b;
}

function prefixPaths(html, prefix) {
  if (!prefix) return html;
  return html.replace(/(\s(?:src|href|srcset|imagesrcset)=")([^"]*)"/g, (m, a, v) =>
    a + v.split(',').map(tok => {
      const lead = tok.match(/^\s*/)[0];
      const rest = tok.slice(lead.length);
      return LOCAL.test(rest) ? lead + prefix + rest : tok;
    }).join(',') + '"');
}

const urlOf = (l) => SITE + (l.dir ? l.dir + '/' : '');
const hrefFrom = (from, to) => {
  const up = from.dir ? '../' : '';
  return to.dir ? `${up}${to.dir}/` : (up || './');
};
const flag = (l, prefix, eager) => `<img class="flag" src="${prefix}flags/${l.flag}.svg" width="20" height="14" alt=""${eager ? '' : ' loading="lazy" decoding="async"'}>`;

// structured data for search engines and AI assistants: the firm, its four services, the site and this page,
// in the page's language (every text comes from the same translations as the page)
const SERVICES = [
  ['Corporate law', 'Governance, mergers, acquisitions and corporate compliance, from the articles of association to the closing documents.'],
  ['Intellectual property', 'Trademark and patent filings with INPI, enforcement against copies, and litigation when a right is infringed.'],
  ['Litigation support', "Strategy and representation in civil, commercial and labour disputes, from the first notice to the court's decision."],
  ['Compliance and regulatory affairs', 'Compliance programmes and risk reviews written for your sector, and kept current as Brazilian rules change.'],
  ['Foreign companies entering Brazil', 'Labour rules, tax law and frequent regulatory change catch out many firms new to Brazil. We set out the rules that apply before you hire, sign or invest.'],
];
function jsonld(lang, dict) {
  const tr = (k) => (dict && dict[k]) || k;
  const page = urlOf(lang);
  const desc = tr('Corporate, intellectual property, litigation and compliance advice under Brazilian law, for Brazilian companies and foreign firms entering the market.');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LegalService', '@id': SITE + '#firm',
        name: 'Lex Vertex Legal Consulting', alternateName: 'Lex Vertex',
        url: SITE, image: SITE + 'share.jpg', description: desc,
        email: 'moises@lexvertex.com',
        address: { '@type': 'PostalAddress', addressLocality: 'Goiânia', addressRegion: 'GO', addressCountry: 'BR' },
        areaServed: { '@type': 'Country', name: 'Brazil' },
        knowsLanguage: LANGS.map(l => l.code),
        knowsAbout: ['Brazilian law', ...SERVICES.slice(0, 4).map(([n]) => tr(n))],
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: 'moises@lexvertex.com', url: page + '#consult', availableLanguage: LANGS.map(l => l.code) },
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: tr('Practice areas'),
          itemListElement: SERVICES.map(([n, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: tr(n), description: tr(d), areaServed: { '@type': 'Country', name: 'Brazil' }, provider: { '@id': SITE + '#firm' } } })),
        },
      },
      { '@type': 'WebSite', '@id': SITE + '#website', url: SITE, name: 'Lex Vertex', inLanguage: LANGS.map(l => l.code), publisher: { '@id': SITE + '#firm' } },
      {
        '@type': 'WebPage', '@id': page + '#webpage', url: page, inLanguage: lang.code,
        name: tr('Lex Vertex: business law firm in Brazil'), description: desc,
        isPartOf: { '@id': SITE + '#website' }, about: { '@id': SITE + '#firm' },
        primaryImageOfPage: { '@type': 'ImageObject', url: SITE + 'share.jpg', width: 1440, height: 900 },
      },
    ],
  };
}

function blocks(html, lang, dict) {
  const prefix = lang.dir ? '../' : '';
  const label = dict?.Language ?? 'Language';
  const alternates = [
    `<link rel="canonical" href="${urlOf(lang)}">`,
    `<meta property="og:url" content="${urlOf(lang)}">`,
    ...LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${l.og}">`),
    ...LANGS.map(l => `<link rel="alternate" hreflang="${l.code}" href="${urlOf(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${urlOf(LANGS[0])}">`,
    `<script type="application/ld+json">${JSON.stringify(jsonld(lang, dict))}</script>`,
  ].join('\n');
  const link = (l, cls) => `<a class="${cls}" href="${hrefFrom(lang, l)}" hreflang="${l.code}" lang="${l.code}"${l === lang ? ' aria-current="true"' : ''}>${flag(l, prefix)}<span>${l.name}</span></a>`;
  const chev = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const sw = `<div class="nav__item nav__item--lang"><a class="nav__link lang-current" href="#languages" aria-label="${label}: ${lang.name}">${flag(lang, prefix, true)}<span>${lang.name}</span> ${chev}</a>
        <div class="nav__menu lang-menu">
          ${LANGS.map(l => link(l, 'lang-link')).join('\n          ')}
        </div>
      </div>`;
  const foot = `<nav id="languages" class="lang-grid" aria-label="${label}">${LANGS.map(l => link(l, 'lang-link')).join('')}</nav>`;
  return html
    .replace(/<!--i18n:alternates-->[\s\S]*?<!--\/i18n:alternates-->/, `<!--i18n:alternates-->\n${alternates}\n<!--/i18n:alternates-->`)
    .replace(/<!--i18n:switch-->[\s\S]*?<!--\/i18n:switch-->/, `<!--i18n:switch-->${sw}<!--/i18n:switch-->`)
    .replace(/<!--i18n:footer-->[\s\S]*?<!--\/i18n:footer-->/, `<!--i18n:footer-->${foot}<!--/i18n:footer-->`);
}

let failed = false;
for (const lang of LANGS) {
  const dict = lang.dict ? JSON.parse(readFileSync(join(ROOT, 'i18n', lang.dict), 'utf8')) : null;
  const missing = new Set();
  let html = translate(source, dict, missing);
  if (missing.size) {
    failed = true;
    console.error(`${lang.code}: ${missing.size} untranslated string(s) in i18n/${lang.dict}:\n  ` + [...missing].map(s => JSON.stringify(s)).join('\n  '));
    continue;
  }
  html = html
    .replace(/<html lang="[^"]*"/, `<html lang="${lang.code}"`)
    .replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${lang.og}">`);
  html = prefixPaths(html, lang.dir ? '../' : '');
  html = blocks(html, lang, dict);
  const out = join(ROOT, lang.dir, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`wrote ${lang.dir ? lang.dir + '/' : ''}index.html (${lang.code})`);
}
if (failed) process.exit(1);
