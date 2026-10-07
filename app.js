const GROUPS = {
  A: {
    label: 'Amerika + část Afriky',
    description: 'Jižní a Střední Amerika, Karibik, severní Afrika a část západní Afriky',
    states: [
      ['ARG','Argentina'],['ATG','Antigua a Barbuda'],['BHS','Bahamy'],['BRB','Barbados'],['BLZ','Belize'],['BEN','Benin'],['BOL','Bolívie'],['BRA','Brazílie'],['BFA','Burkina Faso'],['CPV','Cabo Verde'],['CHL','Chile'],['COL','Kolumbie'],['CRI','Kostarika'],['CUB','Kuba'],['CIV','Pobřeží slonoviny'],['DMA','Dominika'],['DOM','Dominikánská republika'],['ECU','Ekvádor'],['EGY','Egypt'],['SLV','Salvador'],['GMB','Gambie'],['GHA','Ghana'],['GRD','Grenada'],['GTM','Guatemala'],['GIN','Guinea'],['GNB','Guinea-Bissau'],['GUY','Guyana'],['HTI','Haiti'],['HND','Honduras'],['JAM','Jamajka'],['LBR','Libérie'],['LBY','Libye'],['MAR','Maroko'],['NIC','Nikaragua'],['PAN','Panama'],['PRY','Paraguay'],['PER','Peru'],['SEN','Senegal'],['SLE','Sierra Leone'],['SDN','Súdán'],['SUR','Surinam'],['LCA','Svatá Lucie'],['KNA','Svatý Kryštof a Nevis'],['VCT','Svatý Vincenc a Grenadiny'],['TGO','Togo'],['TTO','Trinidad a Tobago'],['TUN','Tunisko'],['URY','Uruguay'],['VEN','Venezuela'],['DZA','Alžírsko']
    ]
  },
  B: {
    label: 'Afrika, Kavkaz, Střední Asie a Oceánie',
    description: 'Zbytek Afriky, Kavkaz, Střední Asie a pět států Oceánie',
    states: [
      ['AGO','Angola'],['ARM','Arménie'],['AUS','Austrálie'],['AZE','Ázerbájdžán'],['BWA','Botswana'],['BDI','Burundi'],['TCD','Čad'],['DJI','Džibutsko'],['ERI','Eritrea'],['SWZ','Eswatini'],['ETH','Etiopie'],['FJI','Fidži'],['GAB','Gabon'],['GEO','Gruzie'],['ZAF','Jihoafrická republika'],['SSD','Jižní Súdán'],['CMR','Kamerun'],['KAZ','Kazachstán'],['KEN','Keňa'],['COM','Komory'],['COG','Konžská republika'],['COD','Demokratická republika Kongo'],['KGZ','Kyrgyzstán'],['LSO','Lesotho'],['MDG','Madagaskar'],['MWI','Malawi'],['MLI','Mali'],['MUS','Mauricius'],['MRT','Mauritánie'],['MOZ','Mosambik'],['NAM','Namibie'],['NER','Niger'],['NGA','Nigérie'],['PNG','Papua-Nová Guinea'],['GNQ','Rovníková Guinea'],['RWA','Rwanda'],['STP','Svatý Tomáš a Princův ostrov'],['SYC','Seychely'],['SOM','Somálsko'],['CAF','Středoafrická republika'],['SLB','Šalamounovy ostrovy'],['TJK','Tádžikistán'],['TZA','Tanzanie'],['TKM','Turkmenistán'],['UGA','Uganda'],['UZB','Uzbekistán'],['VUT','Vanuatu'],['ZMB','Zambie'],['ZWE','Zimbabwe']
    ]
  },
  C: {
    label: 'Asie + Oceánie',
    description: 'Asie, Palestina a devět států Oceánie',
    states: [
      ['AFG','Afghánistán'],['BHR','Bahrajn'],['BGD','Bangladéš'],['BTN','Bhútán'],['BRN','Brunej'],['CHN','Čína'],['PHL','Filipíny'],['IND','Indie'],['IDN','Indonésie'],['IRQ','Irák'],['IRN','Írán'],['ISR','Izrael'],['JPN','Japonsko'],['YEM','Jemen'],['JOR','Jordánsko'],['KOR','Jižní Korea'],['KHM','Kambodža'],['QAT','Katar'],['KIR','Kiribati'],['CYP','Kypr'],['KWT','Kuvajt'],['LAO','Laos'],['LBN','Libanon'],['MYS','Malajsie'],['MDV','Maledivy'],['MHL','Marshallovy ostrovy'],['FSM','Mikronésie'],['MNG','Mongolsko'],['MMR','Myanmar'],['NRU','Nauru'],['NPL','Nepál'],['NZL','Nový Zéland'],['OMN','Omán'],['PAK','Pákistán'],['PSE','Palestina'],['PLW','Palau'],['SAU','Saúdská Arábie'],['WSM','Samoa'],['PRK','Severní Korea'],['SGP','Singapur'],['LKA','Srí Lanka'],['SYR','Sýrie'],['THA','Thajsko'],['TLS','Timor-Leste'],['TON','Tonga'],['TUR','Turecko'],['TUV','Tuvalu'],['ARE','Spojené arabské emiráty'],['VNM','Vietnam']
    ]
  }
};

const app = document.querySelector('#app');
let mapFeatures = [];
let selectedGroup = 'C';
let selectedDifficulty = 'easy';
let session = null;
const MIN_MAP_VIEW_WIDTH = 12;
const MIN_MAP_VIEW_HEIGHT = 5;

// Natural Earth používá kód -99 pro státy bez běžného ISO kódu i pro malé
// nestátní plochy (základny, útesy, sporná území). Ty druhé by na slepé mapě
// byly zavádějící a zbytečně klikatelné, proto je vůbec nevykreslujeme.
const MAP_CODE_OVERRIDES = {
  France: 'FRA',
  Norway: 'NOR',
  Kosovo: 'XKX'
};

// ISO kód sám o sobě nestačí: některá závislá území ho mají také (např.
// Falklandy/Malvíny = FLK). V kvízu trénujeme samostatné státy, proto se tyto
// plochy vůbec nekreslí. Palestina je součástí bloku C a Tchaj-wan ponecháváme
// jako samostatnou mapovou plochu.
const NON_SOVEREIGN_MAP_CODES = new Set([
  'ABW', 'AIA', 'ALA', 'ANT', 'ARU', 'ASM', 'ATA', 'ATF', 'BES', 'BLM', 'BMU', 'BVT',
  'CCK', 'COK', 'CUW', 'CYM', 'ESH', 'FLK', 'FRO', 'GIB', 'GLP', 'GRL', 'GUF',
  'GUM', 'HKG', 'HMD', 'IMN', 'IOT', 'JEY', 'MAC', 'MAF', 'MNP', 'MSR', 'NCL',
  'NFK', 'NIU', 'PCN', 'PRI', 'REU', 'SGS', 'SHN', 'SJM', 'SPM', 'TCA', 'TKL',
  'UMI', 'VGB', 'VIR', 'WLF'
]);

const mapCode = feature => {
  const code = feature.properties['ISO3166-1-Alpha-3'];
  if (code === '-99') return MAP_CODE_OVERRIDES[feature.properties.name] || null;
  return NON_SOVEREIGN_MAP_CODES.has(code) ? null : code;
};

const asStates = entries => entries.map(([code, name]) => ({ code, name, flag: code.toLowerCase() }));
Object.values(GROUPS).forEach(group => { group.states = asStates(group.states); });

const shuffle = values => {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const esc = value => value.replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);

function renderSetup() {
  app.innerHTML = `
    <section class="setup">
      <p class="eyebrow">Trénink zeměpisné paměti</p>
      <h1>Vlajky nejsou jen obrázky.</h1>
      <p class="intro">U každé otázky nejdřív určíš stát podle vlajky a hned potom jeho polohu na slepé mapě. Vyber blok a začni.</p>
      <div class="setup-grid">
        <div class="setup-panel">
          <h2>Studijní blok</h2>
          <div class="group-options">
            ${Object.entries(GROUPS).map(([id, group]) => `<button class="group-option" data-group="${id}" aria-pressed="${id === selectedGroup}"><b class="group-letter">${id}</b><span><strong>${group.label} · ${group.states.length} států</strong>${group.description}</span></button>`).join('')}
          </div>
        </div>
        <div class="setup-panel">
          <h2>Obtížnost</h2>
          <button class="difficulty-option" data-difficulty="easy" aria-pressed="${selectedDifficulty === 'easy'}"><i class="difficulty-mark"></i><span><strong>Snadná</strong>Už vyřešené státy se zašednou a v dalších kolech je nelze vybrat.</span></button>
          <button class="difficulty-option" data-difficulty="hard" aria-pressed="${selectedDifficulty === 'hard'}"><i class="difficulty-mark"></i><span><strong>Těžká</strong>Všechny státy zůstávají aktivní. Musíš je odfiltrovat v hlavě.</span></button>
          <button class="start-button" id="start-session">Spustit trénink</button>
        </div>
      </div>
    </section>`;
  app.querySelectorAll('[data-group]').forEach(button => button.addEventListener('click', () => { selectedGroup = button.dataset.group; renderSetup(); }));
  app.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => { selectedDifficulty = button.dataset.difficulty; renderSetup(); }));
  app.querySelector('#start-session').addEventListener('click', startSession);
}

function startSession() {
  const states = GROUPS[selectedGroup].states;
  session = {
    group: selectedGroup,
    difficulty: selectedDifficulty,
    questions: shuffle(states).map(state => ({ ...state })),
    index: 0,
    phase: 'name',
    nameFirst: 0,
    mapFirst: 0,
    nameErrors: 0,
    mapErrors: 0,
    seenNames: new Set(),
    seenMap: new Set(),
    locked: false,
    mapView: initialMapView(selectedGroup),
    mapDrag: null,
    mapPointers: new Map(),
    mapPinch: null,
    ignoreNextMapClick: false
  };
  renderQuiz();
}

function currentQuestion() { return session.questions[session.index]; }

function progressPercent() {
  const half = session.phase === 'map' ? .5 : 0;
  return ((session.index + half) / session.questions.length) * 100;
}

function scorePercent(correct, answered) {
  return answered ? `${Math.round((correct / answered) * 100)} %` : '—';
}

function revealName(name) {
  app.querySelectorAll('.revealed-name').forEach(element => {
    element.textContent = `Správně: ${name}`;
    element.classList.add('is-visible');
  });
}

function revealContinue(label, action) {
  const result = app.querySelector('#step-result');
  const button = app.querySelector('#continue-step');
  result.hidden = false;
  button.textContent = label;
  button.addEventListener('click', action, { once: true });
}

function continueMarkup(extraClass = '') {
  return `<div class="step-result ${extraClass}" id="step-result" hidden>
    <button class="continue-button" id="continue-step" type="button"></button>
  </div>`;
}

function initialMapView(group) {
  if (group === 'A') return { x: 140, y: 115, width: 720, height: 300 };
  return { x: 0, y: 60, width: 1000, height: 400 };
}

function clampMapView(view) {
  const width = Math.max(MIN_MAP_VIEW_WIDTH, Math.min(1000, view.width));
  const ratio = Math.max(.25, Math.min(.52, (view.height ?? width * .52) / view.width));
  const height = Math.max(MIN_MAP_VIEW_HEIGHT, Math.min(520, width * ratio));
  return {
    width,
    height,
    x: Math.max(0, Math.min(1000 - width, view.x)),
    y: Math.max(0, Math.min(520 - height, view.y))
  };
}

function zoomMapAt(x, y, factor) {
  const previous = session.mapView;
  const width = Math.max(MIN_MAP_VIEW_WIDTH, Math.min(1000, previous.width * factor));
  const height = width * (previous.height / previous.width);
  const rx = (x - previous.x) / previous.width;
  const ry = (y - previous.y) / previous.height;
  session.mapView = clampMapView({ width, x: x - rx * width, y: y - ry * height });
  applyMapView();
}

function mapPointFromClient(svg, clientX, clientY, view = session.mapView) {
  const rect = svg.getBoundingClientRect();
  const scale = Math.min(rect.width / view.width, rect.height / view.height);
  const renderedWidth = view.width * scale;
  const renderedHeight = view.height * scale;
  return {
    x: view.x + (clientX - rect.left - (rect.width - renderedWidth) / 2) / scale,
    y: view.y + (clientY - rect.top - (rect.height - renderedHeight) / 2) / scale,
    scale
  };
}

function mapPointFromPointer(svg, event, view = session.mapView) {
  return mapPointFromClient(svg, event.clientX, event.clientY, view);
}

function applyMapView() {
  const svg = app.querySelector('.world-map');
  if (!svg) return;
  const view = session.mapView;
  svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`);
}

function mapPath(coords) {
  const point = ([lon, lat]) => `${((lon + 180) * 1000 / 360).toFixed(2)},${((90 - lat) * 520 / 180).toFixed(2)}`;
  const polygon = rings => rings.map(ring => `M${ring.map(point).join('L')}Z`).join('');
  return coords.map(polygon).join('');
}

function renderMap() {
  const interactive = session.phase === 'map';
  const active = new Set(GROUPS[session.group].states.map(state => state.code));
  const view = session.mapView;
  return `<svg class="world-map ${interactive ? 'map-select' : ''}" viewBox="${view.x} ${view.y} ${view.width} ${view.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Slepá mapa světa. ${interactive ? 'Klikni na stát.' : 'V tomto kroku vybírej název státu ze seznamu.'}">
    ${mapFeatures.map(feature => `<path class="country ${active.has(feature.code) ? 'is-in-group' : ''} ${session.difficulty === 'easy' && session.seenMap.has(feature.code) ? 'is-known' : ''}" data-code="${feature.code}" d="${feature.path}" tabindex="-1"></path>`).join('')}
  </svg>`;
}

function renderQuiz() {
  const question = currentQuestion();
  const isName = session.phase === 'name';
  const group = GROUPS[session.group];
  const states = [...group.states].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  const nameScore = scorePercent(session.nameFirst, session.index + (isName ? 0 : 1));
  const mapScore = scorePercent(session.mapFirst, session.index);
  app.innerHTML = `
    <section class="quiz">
      <header class="quiz-header">
        <button class="header-flag" id="open-flag" type="button" aria-label="Zvětšit vlajku na celou obrazovku">
          <img src="${FLAG_IMAGES[question.flag]}" alt="Vlajka k určení" />
          <span class="revealed-name ${isName ? '' : 'is-visible'}">${isName ? '' : esc(question.name)}</span>
        </button>
        <p class="progress-copy"><strong><span class="group-name">${group.label} · </span>${session.index + 1} / ${session.questions.length}</strong></p>
        <span class="phase">Krok ${isName ? '1' : '2'} ze 2 · ${isName ? 'Název státu' : 'Poloha na mapě'}</span>
        <p class="score-copy"><span>Skóre:</span> Vlajka <strong>${nameScore}</strong> · Mapa <strong>${mapScore}</strong></p>
        <button class="exit-button" id="exit-session">Změnit blok</button>
      </header>
      <div class="progress-track" aria-label="Průběh tréninku"><span style="width:${progressPercent()}%"></span></div>
      <div class="quiz-layout ${isName ? 'is-name-phase' : 'is-map-phase'}">
        <section class="map-panel" aria-label="Mapa světa">
          <p class="map-label">${isName ? 'Slepá mapa' : 'Klikni na správný stát'}</p>
          <div class="map-controls" aria-label="Ovládání mapy">
            <button class="map-control" type="button" data-map-action="zoom-in" aria-label="Přiblížit mapu">+</button>
            <button class="map-control" type="button" data-map-action="zoom-out" aria-label="Oddálit mapu">−</button>
            <button class="map-control" type="button" data-map-action="reset" aria-label="Vrátit výchozí zobrazení">↺</button>
          </div>
          ${renderMap()}
          ${isName ? '' : continueMarkup('map-step-result')}
        </section>
        <aside class="answer-panel">
          <div class="flag-wrap"><img src="${FLAG_IMAGES[question.flag]}" alt="Vlajka k určení" /></div>
          <h1 class="task-title">${isName ? 'Který stát má tuto vlajku?' : esc(question.name)}</h1>
          <p class="revealed-name desktop-revealed"></p>
          ${isName ? continueMarkup() : ''}
          ${isName ? `<div class="answer-list">${states.map(state => {
            const known = session.difficulty === 'easy' && session.seenNames.has(state.code);
            return `<button class="answer-choice ${known ? 'is-known' : ''}" data-name-choice="${state.code}" ${known ? 'disabled' : ''}>${esc(state.name)}</button>`;
          }).join('')}</div>` : ''}
        </aside>
      </div>
      <div class="flag-modal" id="flag-modal" hidden role="dialog" aria-modal="true" aria-label="Zvětšená vlajka">
        <button class="flag-modal-close" id="close-flag" type="button">Zavřít</button>
        <img src="${FLAG_IMAGES[question.flag]}" alt="Vlajka k určení" />
        <p>Klepni mimo vlajku pro zavření.</p>
      </div>
    </section>`;
  window.scrollTo(0, 0);
  app.querySelector('#exit-session').addEventListener('click', () => { session = null; renderSetup(); });
  const flagModal = app.querySelector('#flag-modal');
  const closeFlagModal = () => { flagModal.hidden = true; document.body.classList.remove('flag-modal-open'); };
  app.querySelector('#open-flag').addEventListener('click', () => { flagModal.hidden = false; document.body.classList.add('flag-modal-open'); });
  app.querySelector('#close-flag').addEventListener('click', closeFlagModal);
  flagModal.addEventListener('click', event => { if (event.target === flagModal) closeFlagModal(); });
  app.querySelectorAll('[data-map-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.mapAction;
    if (action === 'reset') { session.mapView = initialMapView(session.group); applyMapView(); return; }
    const view = session.mapView;
    zoomMapAt(view.x + view.width / 2, view.y + view.height / 2, action === 'zoom-in' ? .68 : 1 / .68);
  }));
  const svg = app.querySelector('.world-map');
  svg.addEventListener('wheel', event => {
    event.preventDefault();
    const point = mapPointFromPointer(svg, event);
    zoomMapAt(point.x, point.y, event.deltaY < 0 ? .78 : 1 / .78);
  }, { passive: false });
  const beginMapPinch = () => {
    const [first, second] = [...session.mapPointers.values()];
    if (!first || !second) return;
    const startView = { ...session.mapView };
    const centerX = (first.x + second.x) / 2;
    const centerY = (first.y + second.y) / 2;
    const anchor = mapPointFromClient(svg, centerX, centerY, startView);
    session.mapDrag = null;
    session.mapPinch = {
      startView,
      startDistance: Math.hypot(second.x - first.x, second.y - first.y),
      anchor,
      anchorRatioX: (anchor.x - startView.x) / startView.width,
      anchorRatioY: (anchor.y - startView.y) / startView.height
    };
  };
  svg.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') {
      session.mapPointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
      if (session.mapPointers.size >= 2) {
        svg.setPointerCapture?.(event.pointerId);
        beginMapPinch();
        event.preventDefault();
        return;
      }
    }
    if (event.button !== 0) return;
    session.mapDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startView: { ...session.mapView },
      moved: false
    };
  });
  svg.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && session.mapPointers.has(event.pointerId)) {
      session.mapPointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
      const pinch = session.mapPinch;
      if (pinch && session.mapPointers.size >= 2) {
        const [first, second] = [...session.mapPointers.values()];
        const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
        const width = Math.max(MIN_MAP_VIEW_WIDTH, Math.min(1000, pinch.startView.width * pinch.startDistance / distance));
        const height = width * (pinch.startView.height / pinch.startView.width);
        session.mapView = clampMapView({
          width,
          height,
          x: pinch.anchor.x - pinch.anchorRatioX * width,
          y: pinch.anchor.y - pinch.anchorRatioY * height
        });
        svg.classList.add('is-dragging');
        event.preventDefault();
        applyMapView();
        return;
      }
    }
    const drag = session.mapDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const offsetX = event.clientX - drag.startX;
    const offsetY = event.clientY - drag.startY;
    if (Math.abs(offsetX) > 7 || Math.abs(offsetY) > 7) {
      drag.moved = true;
      svg.setPointerCapture?.(event.pointerId);
      svg.classList.add('is-dragging');
    }
    if (!drag.moved) return;
    event.preventDefault();
    const { scale } = mapPointFromPointer(svg, event, drag.startView);
    session.mapView = clampMapView({
      ...drag.startView,
      x: drag.startView.x - offsetX / scale,
      y: drag.startView.y - offsetY / scale
    });
    applyMapView();
  });
  const stopMapGesture = event => {
    const wasPinching = event.pointerType === 'touch' && Boolean(session.mapPinch);
    if (event.pointerType === 'touch') session.mapPointers.delete(event.pointerId);
    const drag = session.mapDrag;
    if (drag && drag.pointerId === event.pointerId) {
      if (drag.moved) {
        session.ignoreNextMapClick = true;
        window.setTimeout(() => { session.ignoreNextMapClick = false; }, 0);
      }
      session.mapDrag = null;
    }
    if (wasPinching) {
      session.ignoreNextMapClick = true;
      window.setTimeout(() => { session.ignoreNextMapClick = false; }, 0);
      session.mapPinch = null;
      const [remaining] = [...session.mapPointers.values()];
      if (remaining) {
        session.mapDrag = {
          pointerId: remaining.id,
          startX: remaining.x,
          startY: remaining.y,
          startView: { ...session.mapView },
          moved: false
        };
      }
    }
    svg.classList.remove('is-dragging');
    if (svg.hasPointerCapture?.(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  };
  svg.addEventListener('pointerup', stopMapGesture);
  svg.addEventListener('pointercancel', stopMapGesture);
  if (isName) {
    app.querySelectorAll('[data-name-choice]').forEach(button => button.addEventListener('click', () => answerName(button.dataset.nameChoice, button)));
  } else {
    app.querySelectorAll('.country').forEach(path => {
      path.addEventListener('click', () => {
        if (session.ignoreNextMapClick) return;
        answerMap(path.dataset.code, path);
      });
    });
  }
}

function answerName(code, button) {
  if (session.locked || (session.difficulty === 'easy' && session.seenNames.has(code))) return;
  const question = currentQuestion();
  const correct = code === question.code;
  session.locked = true;
  session.seenNames.add(question.code);
  app.querySelectorAll('[data-name-choice]').forEach(choice => { choice.disabled = true; });
  revealName(question.name);
  button.classList.add(correct ? 'is-correct' : 'is-wrong');
  if (correct) {
    session.nameFirst += 1;
  } else {
    session.nameErrors += 1;
  }
  revealContinue('Pokračovat na mapu', () => { session.phase = 'map'; session.locked = false; renderQuiz(); });
}

function answerMap(code, path) {
  if (session.locked || (session.difficulty === 'easy' && session.seenMap.has(code))) return;
  const question = currentQuestion();
  const correct = code === question.code;
  session.locked = true;
  session.seenMap.add(question.code);
  if (correct) {
    session.mapFirst += 1;
    path.classList.add('is-correct');
  } else {
    session.mapErrors += 1;
    path.classList.add('is-wrong');
    const correctPath = app.querySelector(`.country[data-code="${question.code}"]`);
    correctPath?.classList.add('is-correct');
  }
  revealContinue(session.index + 1 === session.questions.length ? 'Zobrazit výsledek' : 'Další vlajka', nextQuestion);
}

function nextQuestion() {
  session.index += 1;
  if (session.index >= session.questions.length) { renderSummary(); return; }
  session.phase = 'name';
  session.locked = false;
  renderQuiz();
}

function renderSummary() {
  const total = session.questions.length;
  const overallFirst = session.nameFirst + session.mapFirst;
  const overallTotal = total * 2;
  const pct = Math.round((overallFirst / overallTotal) * 100);
  app.innerHTML = `
    <section class="summary">
      <p class="eyebrow">Trénink dokončen</p>
      <h1>${pct >= 85 ? 'Výborně.' : pct >= 65 ? 'Dobrá práce.' : 'Základ je položen.'}</h1>
      <p>Prošel/a jsi všech ${total} států ve skupině ${session.group}. Každý krok měl jeden zaznamenaný pokus, takže výsledek ukazuje skutečné vybavení.</p>
      <div class="score-grid">
        <div class="score"><span>Vlajka → stát</span><strong>${session.nameFirst} / ${total}</strong><span>${session.nameErrors} chybných odpovědí</span></div>
        <div class="score"><span>Vlajka → poloha</span><strong>${session.mapFirst} / ${total}</strong><span>${session.mapErrors} chybných odpovědí</span></div>
        <div class="score"><span>Celkem</span><strong>${pct} %</strong><span>${overallFirst} / ${overallTotal} kroků</span></div>
      </div>
      <button class="start-button" id="again">Trénovat znovu</button>
      <button class="secondary-button" id="choose-other">Vybrat jiný blok</button>
    </section>`;
  app.querySelector('#again').addEventListener('click', startSession);
  app.querySelector('#choose-other').addEventListener('click', () => { session = null; renderSetup(); });
}

async function loadMap() {
  try {
    const response = await fetch('data/countries.geojson');
    const data = await response.json();
    mapFeatures = data.features
      .filter(feature => feature.geometry && mapCode(feature))
      .map(feature => {
        const coords = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];
        return { code: mapCode(feature), path: mapPath(coords) };
      });
    renderSetup();
  } catch (error) {
    app.innerHTML = '<p class="intro">Mapu se nepodařilo načíst. Otevři aplikaci přes webový server, ne přímo ze souboru.</p>';
  }
}

loadMap();
