/* KORE — the site's app screenshots.
 *
 *   node tools/screenshots/build.js
 *
 * Rebuilds the app's screens (홈 · 지도 · 상세 시트 · 게임) as HTML at 390x844
 * and captures them with headless Chrome at 2x into assets/shots/. Every
 * measurement, colour and string here is taken from the sibling app checkout —
 * src/theme/index.ts, src/components/TabBar.tsx, src/screens/*.tsx and
 * src/i18n/locales/{ko,en}.json — and the icons are the app's own Ionicons.ttf,
 * so this is a rebuild of the real UI rather than a drawing of it. When a screen
 * changes in the app, change it here and re-run; nothing else on the site needs
 * touching.
 *
 * Requirements: the ../app checkout beside this one with its node_modules
 * installed (for Ionicons.ttf and the nav-app icons), and Chrome. Set CHROME_BIN
 * if Chrome is not at the default Windows path.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const p = (...parts) => path.resolve(__dirname, ...parts).replace(/\\/g, '/');
// The app repo sits beside the web one: KORE/app and KORE/web.
const APP = p('../../../app');
const OUT = p('../../assets/shots');
const CHROME =
  process.env.CHROME_BIN ||
  ['C:/Program Files/Google/Chrome/Application/chrome.exe',
   'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
   'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find((c) => fs.existsSync(c));
if (!CHROME) throw new Error('No Chrome found. Set CHROME_BIN to a Chrome/Edge binary.');
if (!fs.existsSync(`${APP}/src/theme/index.ts`)) {
  throw new Error(`The app checkout is not at ${APP} — this script reads its fonts and icons.`);
}

// ── design tokens (src/theme/index.ts) ─────────────────────────────────────
const C = {
  primary: '#FF385C', primaryDark: '#E0294B', primarySoft: '#FFE8ED',
  ink: '#222222', inkSoft: '#484848', muted: '#717171', faint: '#B0B0B0',
  border: '#EBEBEB', borderStrong: '#DDDDDD',
  bg: '#FFFFFF', bgSubtle: '#F7F7F7', bgSunken: '#F2F2F2',
  success: '#008A05', successSoft: '#E7F6E7', danger: '#C13515',
};
const CLEAN = '#1D7FD1', CLEAN_SOFT = '#E7F2FB';
const PIN = { public: '#FF385C', c1: '#5cb0ff', c2: '#1f6fe6', c3: '#0b3aa8', near: '#FFD400', priv: '#00A3A3' };
const GOLD = '#D4A017', SILVER = '#9AA3AC', BRONZE = '#B06B3A';
const INSET_TOP = 47, INSET_BOTTOM = 34;
const SHADOW_SM = '0 2px 8px rgba(0,0,0,0.08)';
const SHADOW_MD = '0 6px 16px rgba(0,0,0,0.12)';
const SHADOW_LG = '0 12px 28px rgba(0,0,0,0.18)';

// ── Ionicons ───────────────────────────────────────────────────────────────
const ION = {
  home: 'f382', homeOutline: 'f383', map: 'f442', mapOutline: 'f443',
  gameOutline: 'f335', docOutline: 'f2b4', settingsOutline: 'f56c',
  search: 'f55f', infoOutline: 'f399', trophyOutline: 'f602', sparklesOutline: 'f58d',
  add: 'f103', locate: 'f3c1', walk: 'f622', ribbon: 'f544', chevron: 'f23b',
  sparkles: 'f58c', trophy: 'f601', addCircle: 'f104', copyOutline: 'f290',
  createOutline: 'f293', checkmarkCircle: 'f21e',
};
const ic = (name, size, color, extra = '') =>
  `<i class="ion" style="font-size:${size}px;color:${color};${extra}">&#x${ION[name]};</i>`;

// ── strings (src/i18n/locales) ─────────────────────────────────────────────
const S = {
  ko: {
    tabs: ['홈', '지도', '게임', '리포트', '설정'],
    tagline: '함께 만들어가는 한국 화장실 앱',
    contribTitle: '내 기여', seeAll: '전체 보기',
    statLabels: ['내 제안', '승인됨', '검토 중'],
    addCta: '화장실 제보하기',
    nearestTitle: '가장 가까운 화장실 Top 3', nearestSub: '현재 위치에서 직선거리 기준',
    cleanTitle: '가까운 깨끗한 화장실 Top 3', cleanSub: '청결도 2★ 이상 · 현재 위치에서 가까운 순',
    showOnMap: '지도에서 3곳 모두 보기',
    searchPlaceholder: '지역, 주소 검색',
    markerGuide: '마커 안내', ranking: '랭킹', cleanOnly: '깨끗한 화장실만',
    detailTabs: ['정보', '후기 12'],
    walk: '도보 길 찾기', extNavTitle: '내비게이션 앱으로 자동차 길안내',
    navApps: ['티맵', '카카오맵', '네이버지도'],
    sectionDetails: '상세 정보',
    rows: [
      ['운영 시간', '24시간'],
      ['개방 형태', '상시 개방'],
    ],
    safety: '안전 시설', bell: '비상벨', cctv: '입구 CCTV', diaper: '기저귀 교환대',
    placeMen: '남자 화장실', placeWomen: '여자 화장실', placeAt: (p) => `위치: ${p}`,
    roadAddress: '도로명 주소', close: '닫기', suggestEdit: '정보 수정 제안',
    game: '게임', gameRanking: '게임 랭킹', weekly: '주간', allTime: '올 타임',
    weekNote: '2026-W34 기준이며, 매주 월요일에 갱신됩니다.',
    gameNames: ['테트리스', '2048', '스네이크', '벽돌깨기'],
    gameHints: ['블록을 쌓아 줄을 지우세요', '같은 숫자를 밀어서 합치세요', '쓸어서 방향을 바꾸세요', '공을 튕겨 벽돌을 깨세요'],
    myBest: (s) => `최고 ${s}`,
    rankNames: ['민트초코', '대전러버', '익명', '길잃은개미', '토마토'],
    anonymous: '익명',
    nameNotice: '순위에는 설정에서 정한 닉네임이 표시됩니다. 닉네임이 없으면 익명으로 표시됩니다.',
    sheetTitle: '유성구청 공중화장실',
    nearest: [
      ['유성구청 공중화장실', '대전 유성구 대학로 33', '80m'],
      ['유성온천역 3번 출구 화장실', '대전 유성구 계룡로 지하 106', '210m'],
      ['한밭수목원 서원 화장실', '대전 서구 둔산대로 169', '440m'],
    ],
    clean: [
      ['타임월드 8층 화장실', '대전 서구 대덕대로 211', '620m', 3],
      ['갤러리아 백화점 3층', '대전 서구 대덕대로 211', '650m', 3],
      ['대전시립미술관 1층', '대전 서구 둔산대로 155', '1.1km', 2],
    ],
  },
  en: {
    tabs: ['Home', 'Map', 'Games', 'Activity', 'Settings'],
    tagline: 'A Korean toilet app we build together',
    contribTitle: 'My contributions', seeAll: 'See all',
    statLabels: ['My markers', 'Approved', 'Under review'],
    addCta: 'Add a toilet',
    nearestTitle: 'Nearest toilets', nearestSub: 'Straight-line distance from where you are',
    cleanTitle: 'Nearest clean toilets', cleanSub: 'Rated 2★ or better, nearest first',
    showOnMap: 'Show all three on the map',
    searchPlaceholder: 'Search by region or address',
    markerGuide: 'Marker guide', ranking: 'Ranking', cleanOnly: 'Clean only',
    detailTabs: ['Info', 'Reviews 12'],
    walk: 'Walking directions', extNavTitle: 'Driving directions in another app',
    navApps: ['TMAP', 'KakaoMap', 'Naver Map'],
    sectionDetails: 'Details',
    rows: [
      ['Opening Hours', 'Open 24 hours'],
      ['Access', 'Open 24 hours'],
    ],
    safety: 'Safety', bell: 'Emergency bell', cctv: 'CCTV at entrance', diaper: 'Baby changing table',
    placeMen: 'Men’s room', placeWomen: 'Women’s room', placeAt: (p) => `Location: ${p}`,
    roadAddress: 'Road Address', close: 'Close', suggestEdit: 'Suggest an edit',
    game: 'Games', gameRanking: 'Leaderboard', weekly: 'This week', allTime: 'All time',
    weekNote: '2026-W34. The weekly board resets every Monday.',
    gameNames: ['Tetris', '2048', 'Snake', 'Brick Breaker'],
    gameHints: ['Stack the blocks and clear lines', 'Swipe to merge matching numbers', 'Swipe to change direction', 'Bounce the ball and clear the bricks'],
    myBest: (s) => `Best ${s}`,
    rankNames: ['mintchoco', 'daejeon_lover', 'Anonymous', 'lostant', 'tomato'],
    anonymous: 'Anonymous',
    nameNotice: 'The board shows the nickname you set in Settings. Without one you are listed anonymously.',
    sheetTitle: 'Yuseong-gu Office Public Restroom',
    nearest: [
      ['Yuseong-gu Office Public Restroom', '33 Daehak-ro, Yuseong-gu, Daejeon', '80m'],
      ['Yuseong Oncheon Stn. Exit 3', '106 Gyeryong-ro, Yuseong-gu, Daejeon', '210m'],
      ['Hanbat Arboretum West Garden', '169 Dunsan-daero, Seo-gu, Daejeon', '440m'],
    ],
    clean: [
      ['Timeworld 8F Restroom', '211 Daedeok-daero, Seo-gu, Daejeon', '620m', 3],
      ['Galleria Dept. Store 3F', '211 Daedeok-daero, Seo-gu, Daejeon', '650m', 3],
      ['Daejeon Museum of Art 1F', '155 Dunsan-daero, Seo-gu, Daejeon', '1.1km', 2],
    ],
  },
};

// ── the map itself ─────────────────────────────────────────────────────────
// A Google-Maps-styled vector field: land, water, a park, city blocks and a
// rotated road grid, so the pins sit on something that reads as a real place.
const MAP_COLORS = {
  land: '#F2F1EC', block: '#E9E7E1', water: '#A9C9EC', park: '#CBE5C1',
  roadCasing: '#E1DFD8', road: '#FFFFFF', hwy: '#F8CE7A', hwyCasing: '#E5AC50',
  label: '#5F6368', waterLabel: '#4A7FB5', parkLabel: '#3F7A46',
};

function mapSvg(lang) {
  const M = MAP_COLORS;
  const V = [-140, -40, 62, 168, 268, 372, 470]; // vertical road x's
  const H = [-120, -20, 84, 190, 296, 402, 508, 614, 720, 830, 940]; // horizontal road y's
  const arterialV = new Set([62, 268]);
  const arterialH = new Set([190, 508]);
  let blocks = '';
  for (let i = 0; i < V.length - 1; i++) {
    for (let j = 0; j < H.length - 1; j++) {
      const pad = 7;
      const x = V[i] + pad, y = H[j] + pad;
      const w = V[i + 1] - V[i] - pad * 2, h = H[j + 1] - H[j] - pad * 2;
      // Split most blocks into two or three parcels so the field isn't a chequerboard.
      const cut = (i * 7 + j * 3) % 3;
      if (cut === 0) {
        blocks += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;
      } else if (cut === 1) {
        const k = Math.round(h * 0.55);
        blocks += `<rect x="${x}" y="${y}" width="${w}" height="${k}" rx="2"/>`;
        blocks += `<rect x="${x}" y="${y + k + 5}" width="${w}" height="${h - k - 5}" rx="2"/>`;
      } else {
        const k = Math.round(w * 0.46);
        blocks += `<rect x="${x}" y="${y}" width="${k}" height="${h}" rx="2"/>`;
        blocks += `<rect x="${x + k + 5}" y="${y}" width="${w - k - 5}" height="${h}" rx="2"/>`;
      }
    }
  }
  const line = (x1, y1, x2, y2, w, stroke) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`;
  let casing = '', road = '';
  for (const x of V) {
    const w = arterialV.has(x) ? 13 : 7;
    casing += line(x, -160, x, 1000, w + 2.2, M.roadCasing);
    road += line(x, -160, x, 1000, w, M.road);
  }
  for (const y of H) {
    const w = arterialH.has(y) ? 13 : 7;
    casing += line(-200, y, 600, y, w + 2.2, M.roadCasing);
    road += line(-200, y, 600, y, w, M.road);
  }
  const L = lang === 'ko'
    ? { river: '갑천', park: '한밭수목원', road1: '대학로', road2: '계룡로', spot1: '유성구청', spot2: '충남대학교' }
    : { river: 'Gapcheon', park: 'Hanbat Arboretum', road1: 'Daehak-ro', road2: 'Gyeryong-ro', spot1: 'Yuseong-gu Office', spot2: 'Chungnam Nat’l Univ.' };
  const label = (x, y, text, size, color, weight = '500', rotate = 0) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}"
       text-anchor="middle" paint-order="stroke" stroke="#FFFFFF" stroke-width="3.2"
       stroke-linejoin="round"${rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : ''}>${text}</text>`;

  return `<svg class="mapsvg" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
    <rect width="390" height="844" fill="${M.land}"/>
    <g transform="rotate(-7 195 422)">
      <g fill="${M.block}">${blocks}</g>
    </g>
    <!-- the river and the park are surfaces: over the city blocks, under the roads
         that bridge them, which is how Google draws the same thing -->
    <path d="M-60 -20 C 30 130, 4 250, 54 372 C 104 494, 30 604, 58 864 L -80 864 L -80 -20 Z" fill="${M.water}"/>
    <path d="M244 588 C 288 552, 372 560, 404 596 L 408 744 C 352 782, 274 772, 240 726 Z" fill="${M.park}"/>
    <g transform="rotate(-7 195 422)">
      ${casing}${road}
      <!-- one expressway across the top third -->
      ${line(-200, 96, 600, 96, 17, M.hwyCasing)}
      ${line(-200, 96, 600, 96, 13.5, M.hwy)}
    </g>
    ${label(110, 296, L.spot1, 11.5, M.label, '600')}
    ${label(296, 168, L.spot2, 11.5, M.label, '600')}
    ${label(272, 706, L.park, 11, M.parkLabel, '600')}
    ${label(28, 500, L.river, 11, M.waterLabel, '600', 80)}
    ${label(162, 402, L.road1, 10, '#7A7A78', '500', -7)}
    ${label(112, 712, L.road2, 10, '#7A7A78', '500', -7)}
  </svg>`;
}

// The cone pin every marker uses (mapHtml.ts conePinIcon), 38x47, tip at the point.
function pin(color, x, y, z = 1) {
  return `<span class="pin" style="left:${x}px;top:${y}px;z-index:${z}">
    <svg width="38" height="47" viewBox="0 0 52 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g${Math.round(x * 7 + y)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/>
        <stop offset="0.45" stop-color="#ffffff" stop-opacity="0.06"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.10"/>
      </linearGradient></defs>
      <path d="M26 60L9 32.5A20 20 0 1 1 43 32.5Z" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <path d="M26 60L9 32.5A20 20 0 1 1 43 32.5Z" fill="url(#g${Math.round(x * 7 + y)})"/>
      <ellipse cx="16" cy="11.5" rx="6" ry="3.5" fill="#ffffff" fill-opacity="0.35" transform="rotate(-32 16 11.5)"/>
      <circle cx="26" cy="22" r="8.5" fill="#ffffff"/>
    </svg></span>`;
}

function locationDot(x, y) {
  return `<span class="locdot" style="left:${x}px;top:${y}px">
    <svg width="54" height="54" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#1A73E8" fill-opacity="0.15"/>
      <circle cx="24" cy="24" r="11" fill="#ffffff"/>
      <circle cx="24" cy="24" r="8" fill="#1A73E8"/>
    </svg></span>`;
}

// Kept clear of the search bar, the pill stack and the two FABs — the overlays are
// where they are in the app, so the pins go where the app's pins can actually be seen.
const PINS = [
  [PIN.public, 300, 246], [PIN.c1, 206, 352], [PIN.public, 104, 366],
  [PIN.c2, 318, 398], [PIN.near, 210, 444, 5], [PIN.public, 60, 476],
  [PIN.c3, 296, 512], [PIN.c2, 338, 556], [PIN.public, 146, 586],
  [PIN.public, 254, 640], [PIN.priv, 52, 648], [PIN.public, 172, 722],
];

function mapField(lang) {
  return `<div class="map">${mapSvg(lang)}
    ${locationDot(168, 486)}
    ${PINS.map(([c, x, y, z]) => pin(c, x, y, z)).join('')}
  </div>`;
}

// ── shared chrome ──────────────────────────────────────────────────────────
function statusBar(dark) {
  const fg = dark ? '#FFFFFF' : '#000000';
  return `<div class="status">
    <div class="clock" style="color:${fg}">9:41</div>
    <div class="statusicons">
      <svg width="18" height="12" viewBox="0 0 18 12"><g fill="${fg}">
        <rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.6" y="6" width="3" height="6" rx="1"/>
        <rect x="9.2" y="3.4" width="3" height="8.6" rx="1"/><rect x="13.8" y="0.6" width="3" height="11.4" rx="1"/>
      </g></svg>
      <svg width="16" height="12" viewBox="0 0 16 12"><path fill="${fg}" d="M8 11.4 5.6 8.7a3.6 3.6 0 0 1 4.8 0L8 11.4Zm0-4.9a6 6 0 0 0-4.2 1.7L2.2 6.4a8.3 8.3 0 0 1 11.6 0l-1.6 1.8A6 6 0 0 0 8 6.5Zm0-4A10.3 10.3 0 0 0 .8 4.4L-.8 2.6A12.6 12.6 0 0 1 8 0a12.6 12.6 0 0 1 8.8 2.6l-1.6 1.8A10.3 10.3 0 0 0 8 2.5Z"/></svg>
      <svg width="25" height="12" viewBox="0 0 25 12">
        <rect x="0.5" y="0.5" width="20" height="11" rx="3.2" fill="none" stroke="${fg}" stroke-opacity="0.38"/>
        <rect x="2" y="2" width="15" height="8" rx="2" fill="${fg}"/>
        <path d="M22.2 4v4a2.1 2.1 0 0 0 0-4Z" fill="${fg}" fill-opacity="0.4"/>
      </svg>
    </div>
  </div>`;
}

function tabBar(lang, active) {
  const names = S[lang].tabs;
  const icons = [
    ['home', 'homeOutline'], ['map', 'mapOutline'], ['gameOutline', 'gameOutline'],
    ['docOutline', 'docOutline'], ['settingsOutline', 'settingsOutline'],
  ];
  return `<div class="tabbar"><div class="tabrow">
    ${names.map((n, i) => {
      const on = i === active;
      const glyph = on ? icons[i][0] : icons[i][1];
      return `<div class="tab">
        <div class="iconwrap${on ? ' on' : ''}">${ic(glyph, 22, on ? C.primary : C.inkSoft)}</div>
        <div class="tablabel${on ? ' on' : ''}">${n}</div>
      </div>`;
    }).join('')}
  </div></div><div class="homebar"></div>`;
}

// ── screens ────────────────────────────────────────────────────────────────
function screenMap(lang) {
  const t = S[lang];
  return `${mapField(lang)}
  ${statusBar(false)}
  <div class="searchwrap"><div class="searchbar">
    ${ic('search', 18, C.muted, 'margin-right:8px')}
    <span class="searchph">${t.searchPlaceholder}</span>
  </div></div>
  <div class="pills">
    <div class="pill">${ic('infoOutline', 24, C.primary)}<span style="color:${C.primary}">${t.markerGuide}</span></div>
    <div class="pill">${ic('trophyOutline', 22, GOLD)}<span style="color:${C.primary}">${t.ranking}</span></div>
    <div class="pill">${ic('sparklesOutline', 21, PIN.c2)}<span style="color:${PIN.c2}">${t.cleanOnly}</span></div>
  </div>
  <div class="fab add">${ic('add', 36, '#FFFFFF')}</div>
  <div class="fab locate">${ic('locate', 34, C.primary)}</div>
  ${tabBar(lang, 1)}`;
}

function screenDetail(lang) {
  const t = S[lang];
  const navIcons = ['tmap', 'kakao', 'naver'];
  const row = (label, value) =>
    `<div class="irow"><div class="ilabel">${label}</div><div class="ivalue">${value}</div></div>`;
  return `${mapField(lang)}
  ${statusBar(false)}
  <div class="dim"></div>
  <div class="sheet">
    <div class="handle"></div>
    <div class="sheettitle">${t.sheetTitle}</div>
    <div class="dtabs">
      <div class="dtab on">${t.detailTabs[0]}</div>
      <div class="dtab">${t.detailTabs[1]}</div>
    </div>
    <div class="routebtn">${ic('walk', 19, '#FFFFFF')}<span>${t.walk}</span></div>
    <div class="extnav">
      <div class="extnavtitle">${t.extNavTitle}</div>
      <div class="extnavrow">
        ${t.navApps.map((n, i) => `<div class="extnavbtn">
          <img class="navlogo" src="file:///${APP}/assets/nav/${navIcons[i]}.png"/>
          <span>${n}</span></div>`).join('')}
      </div>
    </div>
    <div class="dsection">
      <div class="dsectiontitle">${t.sectionDetails}</div>
      ${row(t.rows[0][0], t.rows[0][1])}
      <div class="irow">
        <div class="ilabel">${t.safety}</div>
        <div class="faclist">
          <div class="facitem"><span class="facname">${t.bell}</span><span class="facplace">${t.placeAt(t.placeWomen)}</span></div>
          <div class="facitem"><span class="facname">${t.diaper}</span><span class="facplace">${t.placeAt(t.placeWomen)}</span></div>
        </div>
      </div>
      <div class="dgroup">
        <div class="irow">
          <div class="ilabelrow"><div class="ilabel">${t.roadAddress}</div>${ic('copyOutline', 18, C.muted)}</div>
          <div class="ivalue">${lang === 'ko' ? '대전 유성구 대학로 33' : '33 Daehak-ro, Yuseong-gu, Daejeon'}</div>
        </div>
      </div>
    </div>
    <div class="closebtn">${t.close}</div>
  </div>
  <div class="homebar"></div>`;
}

function screenHome(lang) {
  const t = S[lang];
  const stat = (v, label, tint, soft) =>
    `<div class="stat" style="background:${soft}"><div class="statv" style="color:${tint}">${v}</div><div class="statl">${label}</div></div>`;
  const rows = (list, tint, soft, stars) => list.map((r, i) => `
    <div class="hrow${i ? ' div' : ''}">
      <div class="rank" style="background:${soft};color:${tint}">${i + 1}</div>
      <div class="hrowtext">
        <div class="hname">${r[0]}</div>
        <div class="hmeta">${r[1]}</div>
        ${stars ? `<div class="dots">${[0, 1, 2].map(k => `<span class="dot" style="background:${k < r[3] ? tint : C.border}"></span>`).join('')}</div>` : ''}
      </div>
      <div class="distpill" style="background:${soft};color:${tint}">${r[2]}</div>
    </div>`).join('');
  const section = (icon, tint, soft, title, sub, list, stars) => `
    <div class="card">
      <div class="cardhead">
        <div class="cardicon" style="background:${soft}">${ic(icon, 19, tint)}</div>
        <div class="cardheadtext">
          <div class="cardtitle">${title}</div>
          <div class="cardsub">${sub}</div>
        </div>
      </div>
      <div class="showall" style="background:${soft}">
        ${ic('map', 16, tint)}<span style="color:${tint}">${title === S[lang].nearestTitle ? S[lang].showOnMap : S[lang].showOnMap}</span>${ic('chevron', 15, tint)}
      </div>
      <div class="hrows">${rows(list, tint, soft, stars)}</div>
    </div>`;
  return `<div class="page">
    ${statusBar(false)}
    <div class="pagescroll">
      <div class="masthead">
        <img class="mark" src="file:///${APP}/assets/logo-mark.png"/>
        <div><div class="wordmark">KORE</div><div class="tagline">${t.tagline}</div></div>
      </div>
      <div class="card">
        <div class="cardhead">
          <div class="cardicon" style="background:${C.primarySoft}">${ic('ribbon', 19, C.primary)}</div>
          <div class="cardheadtext"><div class="cardtitle">${t.contribTitle}</div></div>
          <div class="seeall">${t.seeAll}${ic('chevron', 13, C.muted)}</div>
        </div>
        <div class="statrow">
          ${stat(12, t.statLabels[0], C.ink, C.bgSubtle)}
          ${stat(9, t.statLabels[1], C.success, C.successSoft)}
          ${stat(3, t.statLabels[2], C.primary, C.primarySoft)}
        </div>
        <div class="cta">${ic('addCircle', 19, '#FFFFFF')}<span>${t.addCta}</span></div>
      </div>
      ${section('walk', C.primary, C.primarySoft, t.nearestTitle, t.nearestSub, t.nearest, false)}
      ${section('sparkles', CLEAN, CLEAN_SOFT, t.cleanTitle, t.cleanSub, t.clean, true)}
    </div>
    ${tabBar(lang, 0)}
  </div>`;
}

// GameArt (src/screens/games/GameArt.tsx), redrawn cell for cell.
const CELL = 12, GAP = 2;
const I = '#22D3EE', T = '#A78BFA', O = '#FACC15', J = '#60A5FA', L = '#FB923C';
const TETRIS = [
  [null, null, I, I, I, I], [null, null, null, null, null, null],
  [null, T, null, null, null, null], [T, T, T, null, O, O], [J, J, L, L, O, O],
];
const HEAD = '#86EFAC', BODY = '#22C55E';
const SNAKE = [
  [HEAD, BODY, BODY, null, null, { c: '#EF4444', r: CELL / 2 }],
  [null, null, BODY, null, null, null],
  [null, null, BODY, BODY, BODY, null],
  [null, null, null, null, BODY, null],
];
const MERGE_TILES = [
  { v: 2, bg: '#EEE4DA', fg: '#776E65' }, { v: 4, bg: '#EDE0C8', fg: '#776E65' },
  { v: 8, bg: '#F2B179', fg: '#F9F6F2' }, { v: 16, bg: '#F59563', fg: '#F9F6F2' },
];
const BOARD_BG = { tetris: '#161B33', merge: '#BBADA0', snake: '#0E2A21', breakout: '#101828' };

function mosaic(cells) {
  return `<div class="mosaic">${cells.map(rw => `<div class="mrow">${rw.map(c => {
    if (c == null) return `<span class="mcell"></span>`;
    const color = typeof c === 'string' ? c : c.c;
    const r = typeof c === 'string' ? 3 : c.r;
    return `<span class="mcell" style="background:${color};border-radius:${r}px"></span>`;
  }).join('')}</div>`).join('')}</div>`;
}

function gameArt(id) {
  let inner;
  if (id === 'tetris') inner = mosaic(TETRIS);
  else if (id === 'snake') inner = mosaic(SNAKE);
  else if (id === 'merge') inner = `<div class="mergegrid">${MERGE_TILES.map(t =>
    `<div class="mergetile" style="background:${t.bg};color:${t.fg}">${t.v}</div>`).join('')}</div>`;
  else inner = `<div class="breakout">
    ${['#F87171', '#FB923C', '#FACC15'].map(c =>
      `<div class="brickrow">${Array.from({ length: 5 }, () => `<span class="brick" style="background:${c}"></span>`).join('')}</div>`).join('')}
    <div class="ball"></div><div class="paddle"></div></div>`;
  return `<div class="gameart" style="background:${BOARD_BG[id]}">${inner}</div>`;
}

function screenGame(lang) {
  const t = S[lang];
  const ids = ['tetris', 'merge', 'snake', 'breakout'];
  const accents = [
    ['#22D3EE', '#E0F7FC'], ['#F59563', '#FBEADF'], ['#22C55E', '#E4F7EA'], ['#38BDF8', '#E3F3FE'],
  ];
  const bests = ['18,420', '9,216', '', '7,340'];
  const scores = ['24,180', '21,640', '18,420', '16,050', '12,930'];
  const medals = [GOLD, SILVER, BRONZE, C.muted, C.muted];
  return `<div class="page">
    ${statusBar(false)}
    <div class="pagescroll">
      <div class="pagetitle">${t.game}</div>
      <div class="gamegrid">
        ${ids.map((id, i) => `<div class="gamecard">
          ${gameArt(id)}
          <div class="gamebody">
            <div class="gamename">${t.gameNames[i]}</div>
            <div class="gamehint">${t.gameHints[i]}</div>
            ${bests[i] ? `<div class="bestpill" style="background:${accents[i][1]};color:${accents[i][0]}">
              ${ic('trophy', 11, accents[i][0])}<span>${t.myBest(bests[i])}</span></div>` : ''}
          </div>
        </div>`).join('')}
      </div>
      <div class="board">
        <div class="boardtitle">${t.gameRanking}</div>
        <div class="chiprow">${t.gameNames.map((n, i) =>
          `<span class="chip${i === 0 ? ' on' : ''}">${n}</span>`).join('')}</div>
        <div class="scoperow">
          <div class="scope on">${t.weekly}</div><div class="scope">${t.allTime}</div>
        </div>
        <div class="weeknote">${t.weekNote}</div>
        ${scores.map((s, i) => `<div class="rankrow${i === 2 ? ' mine' : ''}">
          <div class="ranknum" style="color:${medals[i]}">${i + 1}</div>
          <div class="rankname${i === 2 ? ' anon' : ''}">${t.rankNames[i]}</div>
          <div class="rankscore">${s}</div>
        </div>`).join('')}
        <div class="noticerow">${ic('infoOutline', 14, C.muted)}<span>${t.nameNotice}</span></div>
      </div>
    </div>
    ${tabBar(lang, 2)}
  </div>`;
}

// ── page shell ─────────────────────────────────────────────────────────────
const CSS = `
@font-face { font-family: Ion; src: url('file:///${APP}/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 390px; height: 844px; overflow: hidden; }
body {
  font-family: Pretendard, -apple-system, "Apple SD Gothic Neo", "Segoe UI", sans-serif;
  color: ${C.ink}; background: ${C.bgSubtle};
  -webkit-font-smoothing: antialiased;
}
.ion { font-family: Ion; font-style: normal; line-height: 1; display: inline-block; }
.phone { position: relative; width: 390px; height: 844px; overflow: hidden; background: ${C.bgSubtle}; }

/* status bar */
.status { position: absolute; top: 0; left: 0; right: 0; height: ${INSET_TOP}px; display: flex;
  align-items: center; justify-content: space-between; padding: 0 28px 0 32px; z-index: 40; }
.clock { font-size: 15.5px; font-weight: 700; letter-spacing: 0.2px; margin-top: 4px; }
.statusicons { display: flex; align-items: center; gap: 5px; margin-top: 4px; }
.homebar { position: absolute; left: 50%; bottom: 8px; width: 140px; height: 5px; border-radius: 3px;
  background: rgba(0,0,0,0.75); transform: translateX(-50%); z-index: 41; }

/* tab bar (components/TabBar.tsx) */
.tabbar { position: absolute; left: 12px; right: 12px; bottom: ${INSET_BOTTOM + 12}px; height: 62px;
  border-radius: 26px; overflow: hidden; border: 0.5px solid rgba(255,255,255,0.55);
  box-shadow: 0 8px 20px rgba(0,0,0,0.14); backdrop-filter: blur(22px) saturate(1.4);
  background: rgba(255,255,255,0.42); z-index: 30; }
.tabbar::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 1px; background: rgba(255,255,255,0.85); }
.tabrow { display: flex; height: 100%; align-items: center; }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.iconwrap { width: 46px; height: 28px; border-radius: 999px; display: flex; align-items: center; justify-content: center; }
.iconwrap.on { background: rgba(255,56,92,0.14); }
.tablabel { font-size: 10.5px; font-weight: 500; color: ${C.inkSoft}; margin-top: 1px; }
.tablabel.on { color: ${C.primary}; font-weight: 700; }

/* map */
.map { position: absolute; inset: 0; background: ${MAP_COLORS.land}; }
.mapsvg { position: absolute; inset: 0; width: 390px; height: 844px; }
.pin { position: absolute; width: 38px; height: 47px; margin-left: -19px; margin-top: -44px;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.22)); }
.locdot { position: absolute; width: 54px; height: 54px; margin-left: -27px; margin-top: -27px; z-index: 4; }

/* map overlays */
.searchwrap { position: absolute; top: ${INSET_TOP + 8}px; left: 0; right: 0; display: flex; justify-content: center; z-index: 20; }
.searchbar { width: 271px; min-height: 48px; display: flex; align-items: center; background: #fff;
  border-radius: 999px; padding: 8px 8px 8px 12px; box-shadow: ${SHADOW_MD}; }
.searchph { font-size: 15px; color: ${C.faint}; }
.pills { position: absolute; top: ${INSET_TOP + 68}px; left: 12px; display: flex; flex-direction: column;
  align-items: flex-start; gap: 8px; z-index: 20; }
.pill { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.82);
  backdrop-filter: blur(8px); border-radius: 999px; border: 0.5px solid rgba(255,255,255,0.9);
  padding: 12px 16px; box-shadow: ${SHADOW_SM}; font-size: 17.5px; font-weight: 700; }
.fab { position: absolute; right: 16px; width: 58px; height: 58px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center; box-shadow: ${SHADOW_MD}; z-index: 20; }
.fab.add { background: ${C.primary}; bottom: 194px; }
.fab.locate { background: #fff; bottom: 124px; }

/* detail sheet */
.dim { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 25; }
.sheet { position: absolute; left: 0; right: 0; bottom: 0; z-index: 26; background: #fff;
  border-radius: 20px 20px 0 0; padding: 12px 24px 24px; max-height: 78%; overflow: hidden; box-shadow: ${SHADOW_LG}; }
.handle { width: 40px; height: 4px; border-radius: 999px; background: ${C.borderStrong}; margin: 0 auto 16px; }
.sheettitle { font-size: 20px; font-weight: 700; letter-spacing: -0.2px; margin-bottom: 16px; }
.dtabs { display: flex; background: ${C.bgSubtle}; border-radius: 999px; padding: 3px; margin-bottom: 16px; }
.dtab { flex: 1; text-align: center; padding: 8px 0; border-radius: 999px; font-size: 15px; font-weight: 600; color: ${C.muted}; }
.dtab.on { background: #fff; color: ${C.ink}; box-shadow: ${SHADOW_SM}; }
.routebtn { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px;
  background: ${C.primary}; border-radius: 12px; padding: 12px 0; color: #fff; font-size: 16px;
  font-weight: 700; box-shadow: ${SHADOW_SM}; }
.extnav { margin-top: 16px; }
.extnavtitle { font-size: 13px; font-weight: 600; color: ${C.muted}; margin-bottom: 8px; }
.extnavrow { display: flex; gap: 8px; }
.extnavbtn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 4px; background: ${C.bgSubtle}; border-radius: 12px; border: 0.5px solid ${C.border};
  font-size: 13px; font-weight: 500; color: ${C.ink}; }
.navlogo { width: 30px; height: 30px; border-radius: 7px; }
.dsection { margin-top: 16px; padding-top: 12px; border-top: 0.5px solid ${C.border}; }
.dsectiontitle { font-size: 13px; font-weight: 600; color: ${C.muted}; margin-bottom: 12px; }
.irow { margin-bottom: 12px; }
.ilabel { font-size: 13px; font-weight: 600; color: ${C.muted}; margin-bottom: 2px; }
.ilabelrow { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.ilabelrow .ilabel { margin-bottom: 0; }
.ivalue { font-size: 17px; line-height: 23px; font-weight: 500; color: ${C.ink}; }
.faclist { margin-top: 4px; display: flex; flex-direction: column; gap: 6px; }
.facitem { display: flex; align-items: center; gap: 6px; }
.facname { font-size: 17px; font-weight: 500; color: ${C.ink}; }
.facplace { font-size: 14px; color: ${C.muted}; }
.dgroup { margin-top: 4px; padding-top: 12px; border-top: 0.5px solid ${C.border}; }
.editbtn { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px;
  background: ${C.primarySoft}; border-radius: 12px; padding: 12px 0; color: ${C.primaryDark};
  font-size: 15px; font-weight: 700; }
.closebtn { margin-top: 8px; background: ${C.primary}; border-radius: 12px; padding: 16px 0;
  text-align: center; color: #fff; font-size: 16px; font-weight: 700; box-shadow: ${SHADOW_SM}; }

/* scrolling pages (home / game) */
.page { position: absolute; inset: 0; background: ${C.bgSubtle}; }
.pagescroll { position: absolute; inset: 0; padding: ${INSET_TOP + 16}px 16px 0; }
.pagetitle { font-size: 24px; font-weight: 800; letter-spacing: -0.3px; margin-bottom: 16px; }

/* home */
.masthead { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.mark { width: 42px; height: 42px; object-fit: contain; }
.wordmark { font-size: 27px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.15; }
.tagline { font-size: 13px; font-weight: 500; color: ${C.muted}; margin-top: 2px; line-height: 17px; }
.card { background: #fff; border-radius: 24px; padding: 16px; margin-bottom: 12px; box-shadow: ${SHADOW_SM}; }
.cardhead { display: flex; align-items: center; margin-bottom: 12px; }
.cardicon { width: 36px; height: 36px; border-radius: 18px; display: flex; align-items: center;
  justify-content: center; margin-right: 12px; flex: none; }
.cardheadtext { flex: 1; min-width: 0; }
.cardtitle { font-size: 17px; font-weight: 700; }
.cardsub { font-size: 12px; font-weight: 500; color: ${C.muted}; margin-top: 2px; }
.seeall { display: flex; align-items: center; gap: 1px; padding-left: 8px; font-size: 12px;
  font-weight: 500; color: ${C.muted}; white-space: nowrap; }
.statrow { display: flex; gap: 8px; margin-bottom: 16px; }
.stat { flex: 1; text-align: center; padding: 12px 0; border-radius: 12px; }
.statv { font-size: 25px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.2; }
.statl { font-size: 12px; font-weight: 500; color: ${C.muted}; margin-top: 1px; }
.cta { display: flex; align-items: center; justify-content: center; gap: 8px; background: ${C.primary};
  border-radius: 16px; padding: 14px 0; color: #fff; font-size: 16px; font-weight: 600; }
.showall { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 0;
  border-radius: 16px; font-size: 15px; font-weight: 600; }
.hrows { margin-top: 4px; }
.hrow { display: flex; align-items: center; padding: 12px 0; }
.hrow.div { border-top: 1px solid ${C.border}; }
.rank { width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center;
  justify-content: center; margin-right: 12px; font-size: 13px; font-weight: 800; flex: none; }
.hrowtext { flex: 1; min-width: 0; margin-right: 8px; }
.hname { font-size: 15.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hmeta { font-size: 12px; font-weight: 500; color: ${C.muted}; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dots { display: flex; gap: 3px; margin-top: 5px; }
.dot { width: 12px; height: 4px; border-radius: 2px; }
.distpill { border-radius: 999px; padding: 4px 8px; font-size: 12px; font-weight: 800; flex: none; }

/* game */
.gamegrid { display: flex; flex-wrap: wrap; gap: 12px; }
.gamecard { width: calc(50% - 6px); background: #fff; border-radius: 24px; box-shadow: ${SHADOW_SM}; overflow: hidden; }
.gameart { height: 96px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.gamebody { padding: 10px 12px 12px; }
.gamename { font-size: 16px; font-weight: 600; }
.gamehint { font-size: 12px; font-weight: 500; color: ${C.muted}; margin-top: 2px; line-height: 16px; }
.bestpill { display: inline-flex; align-items: center; gap: 3px; border-radius: 999px;
  padding: 3px 8px; margin-top: 8px; font-size: 11px; font-weight: 700; }
.mosaic { display: flex; flex-direction: column; gap: ${GAP}px; }
.mrow { display: flex; gap: ${GAP}px; }
.mcell { width: ${CELL}px; height: ${CELL}px; display: block; }
.mergegrid { display: flex; flex-wrap: wrap; width: 74px; gap: 5px; }
.mergetile { width: 34px; height: 34px; border-radius: 5px; display: flex; align-items: center;
  justify-content: center; font-size: 15px; font-weight: 800; }
.breakout { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.brickrow { display: flex; gap: 2px; }
.brick { width: 15px; height: 7px; border-radius: 2px; display: block; }
.ball { width: 7px; height: 7px; border-radius: 4px; background: #fff; margin: 9px 0 0 26px; }
.paddle { width: 34px; height: 6px; border-radius: 3px; background: #38BDF8; margin: 7px 18px 0 0; }
.board { background: #fff; border-radius: 20px; padding: 16px; margin-top: 16px; box-shadow: ${SHADOW_SM}; }
.boardtitle { font-size: 17px; font-weight: 700; margin-bottom: 12px; }
.chiprow { display: flex; gap: 8px; padding-bottom: 12px; }
.chip { padding: 8px 12px; border-radius: 999px; background: ${C.bgSubtle}; font-size: 12px;
  font-weight: 500; color: ${C.inkSoft}; white-space: nowrap; }
.chip.on { background: ${C.primarySoft}; color: ${C.primary}; font-weight: 700; }
.scoperow { display: flex; background: ${C.bgSubtle}; border-radius: 12px; padding: 3px; margin-bottom: 8px; }
.scope { flex: 1; text-align: center; padding: 8px 0; border-radius: 8px; font-size: 13px;
  font-weight: 600; color: ${C.muted}; }
.scope.on { background: #fff; color: ${C.ink}; box-shadow: ${SHADOW_SM}; }
.weeknote { font-size: 12px; font-weight: 500; color: ${C.muted}; margin-bottom: 8px; }
.rankrow { display: flex; align-items: center; padding: 12px 0; border-top: 1px solid ${C.border}; }
.rankrow.mine { background: ${C.primarySoft}; border-radius: 8px; }
.ranknum { width: 34px; text-align: center; font-size: 17px; font-weight: 700; }
.rankname { flex: 1; margin: 0 8px; font-size: 15px; }
.rankname.anon { color: ${C.muted}; font-style: italic; }
.rankscore { font-size: 15px; font-weight: 600; }
.noticerow { display: flex; align-items: flex-start; gap: 6px; margin-top: 12px; font-size: 12px;
  font-weight: 500; color: ${C.muted}; line-height: 17px; }
`;

function page(body) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>${CSS}</style></head><body><div class="phone">${body}</div></body></html>`;
}

// ── build ──────────────────────────────────────────────────────────────────
const SCREENS = { map: screenMap, detail: screenDetail, home: screenHome, game: screenGame };
fs.mkdirSync(OUT, { recursive: true });
// The intermediate HTML is scratch: it goes to the temp dir so a build never
// leaves eight stray pages in a repo that is served as-is by GitHub Pages.
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'kore-shots-'));

for (const lang of ['ko', 'en']) {
  for (const [name, fn] of Object.entries(SCREENS)) {
    const file = path.join(TMP, `${name}-${lang}.html`);
    fs.writeFileSync(file, page(fn(lang)), 'utf8');
    const png = path.join(OUT, `${name}-${lang}.png`).replace(/\//g, '\\');
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars',
      `--screenshot=${png}`, '--window-size=390,844',
      '--force-device-scale-factor=2', '--virtual-time-budget=6000',
      `file:///${file.replace(/\\/g, '/')}`,
    ], { stdio: 'inherit' });
    console.log('wrote', png);
  }
}
