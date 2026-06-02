const state = {
  currentPeriod: '1week',
  currentFilter: 'all',
  news: [],
  feeds: [],
  errors: [],
};

const companyData = [
  {
    name: '三菱重工業', code: '7011', sector: '総合重工・防衛・航空宇宙・エネルギー',
    summary: '発電システム、航空宇宙、防衛、船舶・海洋、産業機械などを幅広く扱う総合重工メーカー。',
    themes: ['防衛', '宇宙', '原子力', 'GTCC', '水素'],
    links: [
      ['公式', 'https://www.mhi.com/jp'], ['IR', 'https://www.mhi.com/jp/finance'], ['採用', 'https://www.mhi.com/jp/recruit']
    ]
  },
  {
    name: '川崎重工業', code: '7012', sector: '重工・航空宇宙・船舶・エネルギー',
    summary: '航空宇宙、船舶海洋、車両、エネルギー、精密機械、ロボットなどを手がける総合重工メーカー。',
    themes: ['航空宇宙', '防衛', '水素', '船舶', 'ロボット'],
    links: [['公式', 'https://www.khi.co.jp/'], ['IR', 'https://www.khi.co.jp/ir/'], ['採用', 'https://www.khi.co.jp/careers/']]
  },
  {
    name: 'IHI', code: '7013', sector: '航空エンジン・宇宙・資源エネルギー',
    summary: '航空エンジン、宇宙、防衛、資源・エネルギー、社会インフラ、産業システムを展開。',
    themes: ['航空エンジン', '防衛', '宇宙', 'アンモニア', 'LNG'],
    links: [['公式', 'https://www.ihi.co.jp/'], ['IR', 'https://www.ihi.co.jp/ir/'], ['採用', 'https://www.ihi.co.jp/recruit/']]
  },
  {
    name: '三菱電機', code: '6503', sector: '電機・防衛電子・宇宙・社会インフラ',
    summary: '社会インフラ、FA、ビル、エネルギー、宇宙・防衛、電子デバイスなどを展開。',
    themes: ['防衛電子', '衛星', 'レーダー', '電力', 'FA'],
    links: [['公式', 'https://www.mitsubishielectric.co.jp/'], ['IR', 'https://www.mitsubishielectric.co.jp/ir/'], ['採用', 'https://www.mitsubishielectric.co.jp/saiyo/']]
  },
  {
    name: 'NEC', code: '6701', sector: 'IT・通信・防衛システム・社会インフラ',
    summary: 'ITサービス、ネットワーク、航空宇宙・防衛、サイバーセキュリティ、官公庁向けシステムを展開。',
    themes: ['防衛IT', 'サイバー', '通信', '宇宙', '官公庁'],
    links: [['公式', 'https://jpn.nec.com/'], ['IR', 'https://jpn.nec.com/ir/'], ['採用', 'https://jpn.nec.com/recruit/']]
  },
  {
    name: 'INPEX', code: '1605', sector: '資源開発・天然ガス・水素アンモニア',
    summary: '石油・天然ガスの探鉱、開発、生産を中心に、低炭素化や水素・アンモニア事業も推進。',
    themes: ['LNG', '天然ガス', '中東', '水素', 'アンモニア'],
    links: [['公式', 'https://www.inpex.co.jp/'], ['IR', 'https://www.inpex.co.jp/ir/'], ['採用', 'https://www.inpex.co.jp/recruit/']]
  },
  {
    name: 'JERA', code: '非上場', sector: '燃料調達・発電・LNG・脱炭素',
    summary: '燃料上流・調達から発電までを担うエネルギー会社。LNG、再エネ、水素・アンモニアを重要テーマに置く。',
    themes: ['LNG', '電力', 'アンモニア', '再エネ', '燃料調達'],
    links: [['公式', 'https://www.jera.co.jp/'], ['ニュース', 'https://www.jera.co.jp/news'], ['採用', 'https://www.jera.co.jp/recruit/']]
  },
  {
    name: '日揮ホールディングス', code: '1963', sector: 'EPC・プラント・エネルギー',
    summary: 'LNG、石油・ガス、化学、医薬、インフラなどのEPC事業を展開するエンジニアリング企業。',
    themes: ['EPC', 'LNG', '中東', '水素', 'プラント'],
    links: [['公式', 'https://www.jgc.com/jp/'], ['IR', 'https://www.jgc.com/jp/ir/'], ['採用', 'https://www.jgc.com/jp/recruit/']]
  },
  {
    name: '千代田化工建設', code: '6366', sector: 'EPC・LNG・エネルギーインフラ',
    summary: 'LNG、石油・ガス、化学、環境関連プラントなどの設計・調達・建設を行うエンジニアリング企業。',
    themes: ['EPC', 'LNG', '水素', '中東', 'プラント'],
    links: [['公式', 'https://www.chiyodacorp.com/jp/'], ['IR', 'https://www.chiyodacorp.com/jp/ir/'], ['採用', 'https://www.chiyodacorp.com/jp/recruit/']]
  },
  {
    name: 'ジャパン マリンユナイテッド', code: '非上場', sector: '造船・艦艇・海洋インフラ',
    summary: '商船、艦艇、海洋構造物などを扱う造船会社。海上交通・安全保障に関わる公開情報を追跡対象にする。',
    themes: ['造船', '艦艇', '海洋', '防衛', '輸送'],
    links: [['公式', 'https://www.jmuc.co.jp/'], ['ニュース', 'https://www.jmuc.co.jp/news/'], ['採用', 'https://www.jmuc.co.jp/recruit/']]
  },
  {
    name: 'SUBARU', code: '7270', sector: '自動車・航空宇宙',
    summary: '自動車事業に加え、航空宇宙カンパニーで防衛・航空機関連事業を展開。',
    themes: ['航空宇宙', '防衛', 'ヘリコプター', '製造'],
    links: [['公式', 'https://www.subaru.co.jp/'], ['IR', 'https://www.subaru.co.jp/ir/'], ['採用', 'https://www.subaru.co.jp/jinji/']]
  },
  {
    name: '三井物産', code: '8031', sector: '総合商社・資源・インフラ',
    summary: 'エネルギー、金属資源、機械・インフラ、化学品、生活産業などをグローバルに展開する総合商社。',
    themes: ['LNG', '資源', 'インフラ', '中東', '投資'],
    links: [['公式', 'https://www.mitsui.com/jp/ja/'], ['IR', 'https://www.mitsui.com/jp/ja/ir/'], ['採用', 'https://www.mitsui.com/jp/ja/careers/']]
  },
  {
    name: '三菱商事', code: '8058', sector: '総合商社・エネルギー・インフラ',
    summary: '天然ガス、総合素材、金属資源、産業インフラ、自動車、食品、電力などをグローバルに展開。',
    themes: ['LNG', '電力', 'インフラ', '中東', '投資'],
    links: [['公式', 'https://www.mitsubishicorp.com/jp/ja/'], ['IR', 'https://www.mitsubishicorp.com/jp/ja/ir/'], ['採用', 'https://www.mitsubishicorp.com/jp/ja/recruit/']]
  },
  {
    name: '住友商事', code: '8053', sector: '総合商社・インフラ・資源',
    summary: '金属、輸送機・建機、インフラ、メディア・デジタル、生活・不動産、資源・化学品などを展開。',
    themes: ['インフラ', '電力', '資源', '中東', '事業投資'],
    links: [['公式', 'https://www.sumitomocorp.com/ja/jp'], ['IR', 'https://www.sumitomocorp.com/ja/jp/ir'], ['採用', 'https://www.sumitomocorp.com/ja/jp/recruit']]
  },
  {
    name: '丸紅', code: '8002', sector: '総合商社・電力・インフラ・資源',
    summary: '電力、インフラ、エネルギー、金属、食料、化学品、金融・リースなどを展開する総合商社。',
    themes: ['電力', 'インフラ', 'LNG', '中東', '投資'],
    links: [['公式', 'https://www.marubeni.com/jp/'], ['IR', 'https://www.marubeni.com/jp/ir/'], ['採用', 'https://www.marubeni-recruit.com/']]
  }
];

const outlookData = [
  { icon: '🌐', title: '公開情報のみを表示', content: '企業公式サイト、IR、採用ページ、ニュースRSS、研究機関レポートなど、公開されている情報だけを扱います。' },
  { icon: '⏱️', title: '1時間ごとの自動取得', content: 'GitHub Actions が毎時RSS取得スクリプトを実行し、取得結果を data/news.json に保存します。' },
  { icon: '🧹', title: '重複排除・分類', content: '同一URLや類似タイトルをまとめ、キーワードに基づいてニュース、IR、採用、エネルギー、中東・国際などに分類します。' },
  { icon: '🔒', title: '個人情報を入れない設計', content: '公開ページには、個人的な情報、非公開情報、個人メモを含めません。' }
];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[ch]));
}

function formatDate(iso) {
  if (!iso) return '日付不明';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '日付不明';
  return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
}

function daysAgo(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return Infinity;
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
}

function periodLimit(period) {
  return { '3days': 3, '1week': 7, '1month': 31, 'all': Infinity }[period] ?? 7;
}

function categoryLabel(category) {
  return {
    news: 'ニュース', press: 'プレスリリース', ir: 'IR', jobs: '採用', stocks: '株価', energy: 'エネルギー', intl: '中東・国際', report: 'レポート'
  }[category] || 'ニュース';
}

function categoryClass(category) {
  return `cat-${category || 'news'}`;
}

function importanceLabel(value) {
  if (value === 'high') return ['🔴 重要度：高', 'imp-high'];
  if (value === 'med') return ['🟡 重要度：中', 'imp-med'];
  return ['⚪ 重要度：低', 'imp-low'];
}

function renderCompanies() {
  const grid = document.getElementById('companyGrid');
  grid.innerHTML = companyData.map(c => {
    const themes = c.themes.map(t => `<span class="theme-tag">${escapeHtml(t)}</span>`).join('');
    const links = c.links.map(([label, url]) => `<a class="company-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`).join('');
    return `
      <article class="company-card">
        <div class="company-name">${escapeHtml(c.name)} <span class="company-code">${escapeHtml(c.code)}</span></div>
        <div class="company-sector">${escapeHtml(c.sector)}</div>
        <p class="company-summary">${escapeHtml(c.summary)}</p>
        <div class="theme-tags">${themes}</div>
        <div class="company-links">${links}</div>
      </article>
    `;
  }).join('');
}

function filteredNews() {
  const limit = periodLimit(state.currentPeriod);
  return state.news
    .filter(item => state.currentFilter === 'all' || item.category === state.currentFilter)
    .filter(item => limit === Infinity || daysAgo(item.published_at) <= limit)
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
}

function renderTopics() {
  const list = document.getElementById('topicList');
  const data = filteredNews();

  if (!state.news.length) {
    list.innerHTML = `<div class="error-card">ニュースデータがまだありません。GitHub Actions の初回実行後に <code>data/news.json</code> が更新されると表示されます。</div>`;
    return;
  }

  if (!data.length) {
    list.innerHTML = '<div class="loading-card">選択した条件に合う記事はありません。</div>';
    return;
  }

  list.innerHTML = data.slice(0, 80).map((t, index) => {
    const [impText, impClass] = importanceLabel(t.importance);
    const summary = t.summary || t.source || '';
    return `
      <article class="topic-card">
        <div class="topic-meta">
          <span class="topic-category ${categoryClass(t.category)}">${escapeHtml(categoryLabel(t.category))}</span>
          <span class="topic-date">📅 ${escapeHtml(formatDate(t.published_at))}</span>
          <span class="topic-source-badge">📌 ${escapeHtml(t.source || 'RSS')}</span>
          ${index === 0 ? '<span class="topic-source-badge">NEW</span>' : ''}
          <span class="importance-badge ${impClass}">${impText}</span>
        </div>
        <h3 class="topic-title"><a href="${escapeHtml(t.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.title)}</a></h3>
        <p class="topic-detail">${escapeHtml(summary).slice(0, 240)}${summary.length > 240 ? '…' : ''}</p>
        <div class="topic-links">
          <a class="topic-link" href="${escapeHtml(t.link)}" target="_blank" rel="noopener noreferrer">🔗 記事を開く</a>
        </div>
      </article>
    `;
  }).join('');
}

function renderFeeds() {
  const feedList = document.getElementById('feedList');
  const errorsByFeed = new Map((state.errors || []).map(e => [e.name || e.url, e.error]));
  if (!state.feeds.length) {
    feedList.innerHTML = '<span class="source-tag">RSSフィード情報を読み込み中...</span>';
    return;
  }
  feedList.innerHTML = state.feeds.map(feed => {
    const err = errorsByFeed.get(feed.name) || errorsByFeed.get(feed.url);
    return `<span class="source-tag">${err ? '⚠️' : '✅'} ${escapeHtml(feed.name)} <small>${err ? escapeHtml(err).slice(0, 48) : escapeHtml(feed.type || 'rss')}</small></span>`;
  }).join('');
}

function renderOutlook() {
  const grid = document.getElementById('outlookGrid');
  grid.innerHTML = outlookData.map(o => `
    <div class="outlook-card">
      <h4>${escapeHtml(o.icon)} ${escapeHtml(o.title)}</h4>
      <p>${escapeHtml(o.content)}</p>
    </div>
  `).join('');
}

function updateHeader(metadata = {}) {
  document.getElementById('lastUpdated').textContent = `最終取得: ${metadata.generated_at ? formatDate(metadata.generated_at) : '未取得'}`;
  document.getElementById('itemCount').textContent = `記事: ${state.news.length}`;
}

async function loadNews() {
  const btn = document.getElementById('refreshBtn');
  const icon = document.getElementById('refreshIcon');
  btn.classList.add('loading');
  icon.innerHTML = '<span class="spin">🔄</span>';

  try {
    const response = await fetch(`data/news.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.news = Array.isArray(payload.items) ? payload.items : [];
    state.feeds = Array.isArray(payload.feeds) ? payload.feeds : [];
    state.errors = Array.isArray(payload.errors) ? payload.errors : [];
    updateHeader(payload);
    renderTopics();
    renderFeeds();
    showToast('✅ data/news.json を読み込みました');
  } catch (error) {
    state.news = [];
    updateHeader({});
    document.getElementById('topicList').innerHTML = `<div class="error-card">data/news.json を読み込めませんでした。GitHub Pages上で公開後、またはローカルサーバー経由で開いてください。<br>エラー: ${escapeHtml(error.message)}</div>`;
    showToast('⚠️ ニュースJSONの読み込みに失敗しました', 'warn');
  } finally {
    btn.classList.remove('loading');
    icon.textContent = '🔄';
  }
}

function setPeriod(period) {
  state.currentPeriod = period;
  document.querySelectorAll('.period-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.period === period));
  renderTopics();
}

function setFilter(filter) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
  renderTopics();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.style.background = type === 'warn' ? '#d29922' : '#238636';
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function bindEvents() {
  document.querySelectorAll('.period-btn').forEach(btn => btn.addEventListener('click', () => setPeriod(btn.dataset.period)));
  document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
  document.getElementById('refreshBtn').addEventListener('click', loadNews);
}

function init() {
  renderCompanies();
  renderOutlook();
  bindEvents();
  loadNews();
}

document.addEventListener('DOMContentLoaded', init);
