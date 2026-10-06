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
      <p class="intro">U každé otázky nejdřív určíš stát podle vlajky a hned potom jeho polohu na slepé mapě. Vyber blok a obtížnost.</p>
      <div class="setup-grid">
        <div class="setup-panel">
          <h2>Studijní blok</h2>
          <div class="group-options">
            ${Object.entries(GROUPS).map(([id, group]) => `<button class="group-option" data-group="${id}" aria-pressed="${id === selectedGroup}"><b class="group-letter">${id}</b><span><strong>${group.label} · ${group.states.length} států</strong>${group.description}</span></button>`).join('')}
          </div>
        </div>
        <div class="setup-panel">
          <h2>Obtížnost</h2>
          <button class="difficulty-option" data-difficulty="easy" aria-pressed="${selectedDifficulty === 'easy'}"><i class="difficulty-mark"></i><span><strong>Snadná</strong>Chybné volby zůstanou červené a nelze je opakovat.</span></button>
          <button class="difficulty-option" data-difficulty="hard" aria-pressed="${selectedDifficulty === 'hard'}"><i class="difficulty-mark"></i><span><strong>Těžká</strong>Chybná volba se krátce ukáže a pak zmizí. Musíš si ji pamatovat.</span></button>
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
    questions: shuffle(states).map(state => ({ ...state, nameMistakes: 0, mapMistakes: 0 })),
    index: 0,
    phase: 'name',
    nameFirst: 0,
    mapFirst: 0,
    nameErrors: 0,
    mapErrors: 0,
    blockedNames: new Set(),
    blockedMap: new Set(),
    locked: false,
    mapView: initialMapView(selectedGroup),
    mapDrag: null,
    ignoreNextMapClick: false
  };
  renderQuiz();
}

function currentQuestion() { return session.questions[session.index]; }

function progressPercent() {
  const half = session.phase === 'map' ? .5 : 0;
  return ((session.index + half) / session.questions.length) * 100;
}

function initialMapView(group) {
  if (group === 'A') return { x: 150, y: 95, width: 700, height: 364 };
  return { x: 0, y: 0, width: 1000, height: 520 };
}

function clampMapView(view) {
  const width = Math.max(120, Math.min(1000, view.width));
  const height = width * .52;
  return {
    width,
    height,
    x: Math.max(0, Math.min(1000 - width, view.x)),
    y: Math.max(0, Math.min(520 - height, view.y))
  };
}

function zoomMapAt(x, y, factor) {
  const previous = session.mapView;
  const width = Math.max(120, Math.min(1000, previous.width * factor));
  const height = width * .52;
  const rx = (x - previous.x) / previous.width;
  const ry = (y - previous.y) / previous.height;
  session.mapView = clampMapView({ width, x: x - rx * width, y: y - ry * height });
  applyMapView();
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
  return `<svg class="world-map ${interactive ? 'map-select' : ''}" viewBox="${view.x} ${view.y} ${view.width} ${view.height}" role="img" aria-label="Slepá mapa světa. ${interactive ? 'Klikni na stát.' : 'V tomto kroku vybírej název státu ze seznamu.'}">
    ${mapFeatures.map(feature => `<path class="country ${active.has(feature.code) ? 'is-in-group' : ''}" data-code="${feature.code}" d="${feature.path}" tabindex="${interactive ? '0' : '-1'}"></path>`).join('')}
  </svg>`;
}

function renderQuiz() {
  const question = currentQuestion();
  const isName = session.phase === 'name';
  const group = GROUPS[session.group];
  const states = [...group.states].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  app.innerHTML = `
    <section class="quiz">
      <header class="quiz-header">
        <p class="progress-copy"><strong>${group.label}</strong> · ${session.index + 1} / ${session.questions.length}</p>
        <span class="phase">Krok ${isName ? '1' : '2'} ze 2 · ${isName ? 'Název státu' : 'Poloha na mapě'}</span>
        <button class="exit-button" id="exit-session">Změnit blok</button>
      </header>
      <div class="progress-track" aria-label="Průběh tréninku"><span style="width:${progressPercent()}%"></span></div>
      <div class="quiz-layout">
        <section class="map-panel" aria-label="Mapa světa">
          <p class="map-label">${isName ? 'Slepá mapa' : 'Klikni na správný stát'}</p>
          <div class="map-controls" aria-label="Ovládání mapy">
            <button class="map-control" type="button" data-map-action="zoom-in" aria-label="Přiblížit mapu">+</button>
            <button class="map-control" type="button" data-map-action="zoom-out" aria-label="Oddálit mapu">−</button>
            <button class="map-control" type="button" data-map-action="reset" aria-label="Vrátit výchozí zobrazení">↺</button>
          </div>
          ${renderMap()}
        </section>
        <aside class="answer-panel">
          <div class="flag-wrap"><img src="${FLAG_IMAGES[question.flag]}" alt="Vlajka k určení" /></div>
          <h1 class="task-title">${isName ? 'Který stát má tuto vlajku?' : 'Kde leží tento stát?'}</h1>
          <p class="task-help">${isName ? 'Vyber název ze seznamu. Hned potom ho budeš hledat na mapě.' : `Na mapě vyber stát, který patří k této vlajce.${question.nameMistakes ? ` V prvním kroku to byl ${esc(question.name)}.` : ''}`}</p>
          ${isName ? `<div class="answer-list">${states.map(state => `<button class="answer-choice" data-name-choice="${state.code}">${esc(state.name)}</button>`).join('')}</div>` : `<div class="map-instruction">Mapu můžeš přetáhnout myší nebo prstem a přiblížit kolečkem. Najeď na stát — zvýrazní se. Pak na něj klikni.</div>`}
          <p class="feedback" id="feedback"></p>
        </aside>
      </div>
    </section>`;
  app.querySelector('#exit-session').addEventListener('click', () => { session = null; renderSetup(); });
  app.querySelectorAll('[data-map-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.mapAction;
    if (action === 'reset') { session.mapView = initialMapView(session.group); applyMapView(); return; }
    const view = session.mapView;
    zoomMapAt(view.x + view.width / 2, view.y + view.height / 2, action === 'zoom-in' ? .68 : 1 / .68);
  }));
  const svg = app.querySelector('.world-map');
  svg.addEventListener('wheel', event => {
    event.preventDefault();
    const rect = svg.getBoundingClientRect();
    const view = session.mapView;
    const x = view.x + ((event.clientX - rect.left) / rect.width) * view.width;
    const y = view.y + ((event.clientY - rect.top) / rect.height) * view.height;
    zoomMapAt(x, y, event.deltaY < 0 ? .78 : 1 / .78);
  }, { passive: false });
  svg.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    session.mapDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startView: { ...session.mapView },
      moved: false
    };
    svg.setPointerCapture?.(event.pointerId);
    svg.classList.add('is-dragging');
  });
  svg.addEventListener('pointermove', event => {
    const drag = session.mapDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = svg.getBoundingClientRect();
    const offsetX = event.clientX - drag.startX;
    const offsetY = event.clientY - drag.startY;
    if (Math.abs(offsetX) > 4 || Math.abs(offsetY) > 4) drag.moved = true;
    if (!drag.moved) return;
    session.mapView = clampMapView({
      ...drag.startView,
      x: drag.startView.x - (offsetX / rect.width) * drag.startView.width,
      y: drag.startView.y - (offsetY / rect.height) * drag.startView.height
    });
    applyMapView();
  });
  const stopMapDrag = event => {
    const drag = session.mapDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      session.ignoreNextMapClick = true;
      window.setTimeout(() => { session.ignoreNextMapClick = false; }, 0);
    }
    session.mapDrag = null;
    svg.classList.remove('is-dragging');
    if (svg.hasPointerCapture?.(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  };
  svg.addEventListener('pointerup', stopMapDrag);
  svg.addEventListener('pointercancel', stopMapDrag);
  if (isName) {
    app.querySelectorAll('[data-name-choice]').forEach(button => button.addEventListener('click', () => answerName(button.dataset.nameChoice, button)));
  } else {
    app.querySelectorAll('.country').forEach(path => {
      path.addEventListener('click', () => {
        if (session.ignoreNextMapClick) return;
        answerMap(path.dataset.code, path);
      });
      path.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); answerMap(path.dataset.code, path); } });
    });
  }
}

function feedback(text, type) {
  const element = app.querySelector('#feedback');
  element.textContent = text;
  element.className = `feedback ${type}`;
}

function answerName(code, button) {
  if (session.locked || session.blockedNames.has(code)) return;
  const question = currentQuestion();
  if (code === question.code) {
    session.locked = true;
    if (question.nameMistakes === 0) session.nameFirst += 1;
    button.classList.add('is-correct');
    feedback('Správně. Teď ho najdi na mapě.', 'good');
    setTimeout(() => { session.phase = 'map'; session.blockedMap = new Set(); session.locked = false; renderQuiz(); }, 680);
    return;
  }
  question.nameMistakes += 1;
  session.nameErrors += 1;
  button.classList.add('is-wrong');
  feedback('Zkus to znovu.', 'bad');
  if (session.difficulty === 'easy') {
    session.blockedNames.add(code);
    button.disabled = true;
  } else {
    session.locked = true;
    setTimeout(() => { button.classList.remove('is-wrong'); feedback('', ''); session.locked = false; }, 520);
  }
}

function answerMap(code, path) {
  if (session.locked || session.blockedMap.has(code)) return;
  const question = currentQuestion();
  if (code === question.code) {
    session.locked = true;
    if (question.mapMistakes === 0) session.mapFirst += 1;
    path.classList.add('is-correct');
    feedback('Správně.', 'good');
    setTimeout(nextQuestion, 690);
    return;
  }
  question.mapMistakes += 1;
  session.mapErrors += 1;
  path.classList.add('is-wrong');
  feedback('To není ono. Zkus jiný stát.', 'bad');
  if (session.difficulty === 'easy') {
    session.blockedMap.add(code);
    path.classList.add('is-blocked');
  } else {
    session.locked = true;
    setTimeout(() => { path.classList.remove('is-wrong'); feedback('', ''); session.locked = false; }, 520);
  }
}

function nextQuestion() {
  session.index += 1;
  if (session.index >= session.questions.length) { renderSummary(); return; }
  session.phase = 'name';
  session.blockedNames = new Set();
  session.blockedMap = new Set();
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
      <p>Prošel/a jsi všech ${total} států ve skupině ${session.group}. Nejdůležitější je podíl odpovědí správně na první pokus — právě ten ukazuje skutečné vybavení, ne postupné vylučování možností.</p>
      <div class="score-grid">
        <div class="score"><span>Vlajka → stát</span><strong>${session.nameFirst} / ${total}</strong><span>${session.nameErrors} chybných kliknutí</span></div>
        <div class="score"><span>Vlajka → poloha</span><strong>${session.mapFirst} / ${total}</strong><span>${session.mapErrors} chybných kliknutí</span></div>
        <div class="score"><span>Celkem na první pokus</span><strong>${pct} %</strong><span>${overallFirst} / ${overallTotal} kroků</span></div>
      </div>
      <p class="summary-note">Na další pokus zvol těžkou obtížnost. Pokud se ti konkrétní státy pletou opakovaně, právě tam se vyplatí přidat mapovou pomůcku nebo sousedy.</p>
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
      .filter(feature => feature.geometry && feature.properties['ISO3166-1-Alpha-3'])
      .map(feature => {
        const coords = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];
        return { code: feature.properties['ISO3166-1-Alpha-3'], path: mapPath(coords) };
      });
    renderSetup();
  } catch (error) {
    app.innerHTML = '<p class="intro">Mapu se nepodařilo načíst. Otevři aplikaci přes webový server, ne přímo ze souboru.</p>';
  }
}

loadMap();
