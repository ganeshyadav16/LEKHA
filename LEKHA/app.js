// ========== NAVIGATION ==========
const sectionTitles = {
  dashboard: ['Dashboard', 'Overview of your store performance'],
  store: ['Store Setup', 'Manage your shop profile and storefront'],
  inventory: ['Inventory', 'Track and manage your product inventory'],
  orders: ['Orders', 'Track and manage all incoming orders'],
  delivery: ['Delivery', 'Manage deliveries, partners and routes'],
  billing: ['Billing & Payments', 'Manage invoices, payments, and credit'],
  analytics: ['Analytics', 'Deep dive into your business performance'],
  ai: ['AI Insights', 'AI-powered insights to grow your business'],
  customers: ['Customer View', 'Preview of customer-facing experience'],
  suppliers: ['Suppliers', 'Manage your supply chain'],
  marketing: ['Marketing', 'Run campaigns and engagement programs'],
  team: ['Team & Access', 'Manage team members and permissions'],
  platform: ['Platform', 'Connectivity, sync, and device management'],
  network: ['Local Network', 'Connect with nearby vendors'],
  admin: ['Settings', 'Configure your platform preferences'],
  voicebill: ['Voice Billing', 'Add items using voice or manual commands'],
  billpreview: ['Bill Preview', 'View and share the latest bill'],
  voicepanel: ['Voice Panel', 'Monitor voice system and review commands'],
  smartinsights: ['Smart Insights', 'AI-powered analysis from transaction data'],
  datamining: ['Data Mining', 'Apriori algorithm market basket analysis'],
  eod: ['Day Summary', 'End-of-day sales report and closing summary']
};

const SETTINGS_KEYS = {
  theme: 'lc_theme',
  voiceEnabled: 'lc_voice_enabled'
};

function applyTheme(theme, silent = false) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem(SETTINGS_KEYS.theme, nextTheme);
  syncThemeControls();
  if (!silent) showToast(`${nextTheme === 'light' ? 'Light' : 'Dark'} theme enabled`);
}

function toggleTheme(toggleEl) {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  if (toggleEl) toggleEl.classList.toggle('active', nextTheme === 'dark');
}

function syncThemeControls() {
  const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.classList.toggle('active', isDark);
  const modeLabel = document.getElementById('themeModeLabel');
  if (modeLabel) modeLabel.textContent = isDark ? 'Dark' : 'Light';
}

function isVoiceEnabled() {
  return localStorage.getItem(SETTINGS_KEYS.voiceEnabled) !== '0';
}

function syncVoiceControls() {
  const enabled = isVoiceEnabled();
  const voiceToggle = document.getElementById('voiceToggle');
  if (voiceToggle) voiceToggle.classList.toggle('active', enabled);
  const voiceState = document.getElementById('voiceToggleState');
  if (voiceState) {
    voiceState.textContent = enabled ? 'On' : 'Off';
    voiceState.className = `badge ${enabled ? 'badge-success' : 'badge-danger'}`;
  }
  const voiceFab = document.getElementById('voiceFab');
  if (voiceFab) {
    voiceFab.style.opacity = enabled ? '1' : '0.55';
    voiceFab.style.filter = enabled ? 'none' : 'grayscale(0.3)';
  }
}

function toggleVoiceAssistant(toggleEl, silent = false) {
  const enabled = !isVoiceEnabled();
  localStorage.setItem(SETTINGS_KEYS.voiceEnabled, enabled ? '1' : '0');
  if (!enabled && typeof VoiceService !== 'undefined') {
    VoiceService.stopListening();
  }
  syncVoiceControls();
  if (!silent) {
    showToast(
      enabled ? 'Voice assistant enabled' : 'Voice assistant disabled',
      enabled ? 'success' : 'error'
    );
  }
  if (toggleEl) toggleEl.classList.toggle('active', enabled);
}

function initSyncIndicators() {
  const updateSyncState = () => {
    const online = navigator.onLine;
    document.querySelectorAll('.sync-indicator').forEach((indicator) => {
      indicator.classList.remove('sync-online', 'sync-offline');
      indicator.classList.add(online ? 'sync-online' : 'sync-offline');
      const dotSize = indicator.closest('.mobile-header') ? '5px' : '6px';
      indicator.innerHTML = `<i class="fas fa-circle" style="font-size:${dotSize}"></i> ${online ? 'Online' : 'Offline'}`;
    });

    const syncChip = document.getElementById('settingsSyncStatus');
    if (syncChip) {
      syncChip.className = `badge ${online ? 'badge-success' : 'badge-danger'}`;
      syncChip.textContent = online ? 'Online' : 'Offline';
    }
  };

  updateSyncState();
  window.addEventListener('online', updateSyncState);
  window.addEventListener('offline', updateSyncState);
}

function switchSection(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('sec-' + id);
  if (sec) sec.classList.add('active');
  if (el) el.classList.add('active');
  const t = sectionTitles[id];
  if (t) {
    document.getElementById('topbarTitle').textContent = t[0];
    document.querySelector('.topbar-breadcrumb').textContent = t[1];
  }
  // Close FAB
  const fab = document.getElementById('fab');
  if (fab) fab.classList.remove('open');
  // Init charts if analytics
  if (id === 'analytics') setTimeout(initAnalyticsCharts, 100);
  // Init smart insights if navigating there
  if (id === 'smartinsights' && typeof refreshInsights === 'function') setTimeout(refreshInsights, 100);
  if (id === 'datamining' && typeof runMiningEngine === 'function') setTimeout(runMiningEngine, 100);
  if (id === 'eod' && typeof renderEOD === 'function') setTimeout(renderEOD, 100);
  // AUTO-LOAD: fetch live inventory from DB whenever inventory section is opened
  if (id === 'inventory' && typeof window.refreshInventory === 'function') {
    setTimeout(window.refreshInventory, 120);
  }
}


// ========== SIDEBAR TOGGLE ==========
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
  const icon = document.querySelector('#sidebarToggle i');
  icon.className = sb.classList.contains('collapsed') ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
}

// ========== TOAST ==========
function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ─────────────────────────────────────────────────────────────
// INVENTORY REFRESH — fetch from backend and re-render #invTbody
// ─────────────────────────────────────────────────────────────
window.refreshInventory = async function () {
  const tbody = document.getElementById('invTbody');
  if (!tbody) return;

  // Show a subtle loading shimmer on the section header
  const table = document.getElementById('inventoryTable');
  const empty = document.getElementById('invEmptyState');

  try {
    const result = await window.apiCall('/inventory', 'GET');
    if (!result.ok || !Array.isArray(result.data)) return;

    if (result.data.length === 0) {
      // DB is empty — keep hardcoded sample rows visible
      if (typeof window.applyInventoryFilters === 'function') window.applyInventoryFilters();
      return;
    }

    // Clear and rebuild rows from DB
    tbody.innerHTML = '';
    result.data.forEach(p => {
      const stock  = parseFloat(p.stock  || 0);
      const price  = parseFloat(p.price  || 0);
      const name   = p.name || 'Unknown';
      // Backend doesn't store category yet — derive a default
      const cat    = p.category || deriveCategory(name);

      const status = stock <= 0  ? 'critical'
                   : stock <= 5  ? 'critical'
                   : stock <= 15 ? 'low'
                   : 'instock';
      const badgeClass = status === 'instock' ? 'badge-success'
                       : status === 'low'     ? 'badge-warning'
                       : 'badge-danger';
      const badgeText  = status === 'instock' ? 'In Stock'
                       : status === 'low'     ? 'Low Stock'
                       : 'Critical';
      const pct    = Math.max(4, Math.min(100, Math.round((stock / 200) * 100)));
      const barClr = status === 'instock' ? 'var(--accent-green)'
                   : status === 'low'     ? 'var(--accent-orange)'
                   : 'var(--accent-red)';

      const tr = document.createElement('tr');
      tr.dataset.category = cat;
      tr.dataset.status   = status;
      tr.dataset.stock    = stock;
      tr.dataset.price    = price;
      tr.dataset.name     = name;

      tr.innerHTML = `
        <td><div class="flex items-center gap-12">
          <span style="font-size:20px">${productEmoji(name)}</span>
          <div><div class="font-bold">${escHtml(name)}</div>
               <div class="text-xs text-muted">${escHtml(cat)}</div></div>
        </div></td>
        <td class="text-muted">—</td>
        <td><span class="badge badge-info">${escHtml(cat)}</span></td>
        <td class="font-bold">₹${price.toFixed(0)}</td>
        <td>
          <div>${Math.round(stock)} units</div>
          <div class="progress-bar mt-4" style="width:80px">
            <div class="progress-fill" style="width:${pct}%;background:${barClr}"></div>
          </div>
        </td>
        <td class="text-muted">${p.lastUpdated ? p.lastUpdated.slice(0,10) : '—'}</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td><button class="btn btn-ghost btn-sm"><i class="fas fa-ellipsis"></i></button></td>
      `;
      tbody.appendChild(tr);
    });

    if (table) table.style.display = '';
    if (empty) empty.style.display = 'none';

    // Re-run filters/sort
    if (typeof window.applyInventoryFilters === 'function') window.applyInventoryFilters();

  } catch (_) {
    // Backend unreachable — keep existing HTML rows
    if (typeof window.applyInventoryFilters === 'function') window.applyInventoryFilters();
  }
};

// Derive a display category from product name keywords
function deriveCategory(name) {
  const n = name.toLowerCase();
  if (/milk|butter|curd|paneer|cheese|dairy|amul/.test(n)) return 'Dairy';
  if (/rice|dal|wheat|flour|atta|grain|pulses|beans/.test(n)) return 'Grains';
  if (/oil|ghee|cooking|canola|sunflower|mustard/.test(n)) return 'Cooking';
  if (/soap|shampoo|detergent|surf|clean|colin|cleanser/.test(n)) return 'Cleaning';
  if (/biscuit|chips|chocolate|snack|candy|silk/.test(n)) return 'Snacks';
  if (/juice|water|coke|pepsi|drink|soda|beverage/.test(n)) return 'Beverages';
  return 'General';
}

// Pick an emoji based on name
function productEmoji(name) {
  const n = name.toLowerCase();
  if (/rice/.test(n)) return '🍚';
  if (/milk/.test(n)) return '🥛';
  if (/butter/.test(n)) return '🧈';
  if (/oil/.test(n)) return '🫒';
  if (/sugar/.test(n)) return '🍬';
  if (/flour|atta/.test(n)) return '🌾';
  if (/soap|shampoo|detergent/.test(n)) return '🧴';
  if (/chocolate|silk/.test(n)) return '🍫';
  if (/tea/.test(n)) return '🍵';
  if (/coffee/.test(n)) return '☕';
  if (/bread/.test(n)) return '🍞';
  if (/juice|drink/.test(n)) return '🧃';
  if (/dal|beans/.test(n)) return '🫘';
  return '📦';
}

// Safe HTML escape
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


// ─────────────────────────────────────────────────────────────
// OPTIMISTIC ROW INSERT — immediately adds a row to the DOM
// ─────────────────────────────────────────────────────────────
function insertInventoryRow({ name, price, stock, category }) {
  const tbody = document.getElementById('invTbody');
  if (!tbody) return;

  const status   = stock <= 5 ? 'critical' : stock <= 10 ? 'low' : 'instock';
  const badgeCls = status === 'instock' ? 'badge-success' : status === 'low' ? 'badge-warning' : 'badge-danger';
  const badgeTxt = status === 'instock' ? 'In Stock' : status === 'low' ? 'Low' : 'Critical';
  const pct      = Math.max(5, Math.min(100, Math.round((stock / 200) * 100)));
  const barClr   = status === 'instock' ? 'var(--accent-green)' : status === 'low' ? 'var(--accent-orange)' : 'var(--accent-red)';

  const tr = document.createElement('tr');
  tr.dataset.category = category || 'General';
  tr.dataset.status   = status;
  tr.dataset.stock    = stock;
  tr.dataset.price    = price;
  tr.dataset.name     = name;
  tr.style.animation  = 'fadeIn 0.3s ease';

  tr.innerHTML = `
    <td><div class="flex items-center gap-12">
      <span style="font-size:20px">📦</span>
      <div><div class="font-bold">${name}</div><div class="text-xs text-muted">${category || '—'}</div></div>
    </div></td>
    <td class="text-muted">NEW</td>
    <td><span class="badge badge-info">${category || 'General'}</span></td>
    <td class="font-bold">₹${parseFloat(price).toFixed(0)}</td>
    <td>
      <div>${Math.round(stock)} units</div>
      <div class="progress-bar mt-4" style="width:80px">
        <div class="progress-fill" style="width:${pct}%;background:${barClr}"></div>
      </div>
    </td>
    <td class="text-muted">—</td>
    <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>
    <td><button class="btn btn-ghost btn-sm"><i class="fas fa-ellipsis"></i></button></td>
  `;
  tbody.appendChild(tr);

  // Hide empty state, show table
  const empty = document.getElementById('invEmptyState');
  const table = document.getElementById('inventoryTable');
  if (empty) empty.style.display = 'none';
  if (table) table.style.display = '';

  // Re-run filters so new row respects current active filters/sort
  if (typeof applyInventoryFilters === 'function') applyInventoryFilters();
}

// ─────────────────────────────────────────────────────────────
// ADD PRODUCT MODAL HANDLER
// ─────────────────────────────────────────────────────────────
function addProductFromModal() {
  const nameEl     = document.getElementById('addProductName');
  const priceEl    = document.getElementById('addProductPrice');
  const stockEl    = document.getElementById('addProductStock');
  const categoryEl = document.getElementById('addProductCategory');
  const skuEl      = document.getElementById('addProductSKU');
  const expiryEl   = document.getElementById('addProductExpiry');
  const descEl     = document.getElementById('addProductDescription');

  const name     = nameEl     ? nameEl.value.trim()            : '';
  const price    = priceEl    ? parseFloat(priceEl.value  || 0): 0;
  const stock    = stockEl    ? parseFloat(stockEl.value  || 0): 0;
  const category = categoryEl ? categoryEl.value               : '';
  const sku      = skuEl      ? skuEl.value                    : '';
  const expiry   = expiryEl   ? expiryEl.value || null         : null;
  const desc     = descEl     ? descEl.value                   : '';

  if (!name) { showToast('Product name is required', 'error'); return; }

  (async () => {
    // ─── Try authenticated backend call ────────────────
    try {
      if (typeof window.apiCall === 'function') {
        const result = await window.apiCall('/inventory/add', 'POST', { name, price, stock });
        if (result.ok) {
          showToast(`✓ ${name} added to inventory`);
          document.getElementById('addProductModal')?.classList.remove('show');
          // Clear the form fields
          ['addProductName','addProductPrice','addProductStock','addProductSKU','addProductExpiry','addProductDescription'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
          });
          if (categoryEl) categoryEl.value = '';
          // Optimistic insert with backend data if available
          const prod = result.data || { name, price, stock, category };
          insertInventoryRow({ name: prod.name || name, price: prod.price || price, stock: prod.stock || stock, category });
          // Then do a full refresh from backend in background
          setTimeout(() => window.refreshInventory(), 300);
          return;
        }
        showToast(result.message || 'Backend error', 'error');
        return;
      }
    } catch (_) { /* fall through to DataEngine */ }

    // ─── Local DataEngine fallback (offline) ───────────
    try {
      if (typeof DataEngine !== 'undefined' && typeof DataEngine.addNewItem === 'function') {
        DataEngine.addNewItem({ name, price, stock, category, sku, expiry, description: desc });
      }
    } catch (_) {}

    // Always show the row optimistically even in offline mode
    showToast(`✓ ${name} added (local mode)`);
    document.getElementById('addProductModal')?.classList.remove('show');
    insertInventoryRow({ name, price, stock, category });
  })();
}


// ========== ANALYTICS FILTER TABS ==========
function setAnalyticsFilter(el) {
  el.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ========== CHARTS ==========
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#55556a', font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#55556a', font: { family: 'Inter', size: 11 } } }
  }
};

function initDashboardChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx || ctx._chartInit) return;
  ctx._chartInit = true;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [32000, 38000, 35000, 42000, 48000, 52000, 48520],
        borderColor: '#4f7df8',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          g.addColorStop(0, 'rgba(79,125,248,0.2)');
          g.addColorStop(1, 'rgba(79,125,248,0)');
          return g;
        },
        fill: true, tension: 0.4, borderWidth: 2.5,
        pointRadius: 4, pointBackgroundColor: '#4f7df8', pointBorderColor: '#0a0a0f', pointBorderWidth: 2
      }]
    },
    options: { ...chartDefaults, plugins: { legend: { display: false } } }
  });
}

let salesChartInstance = null, categoryChartInstance = null;
function initAnalyticsCharts() {
  // Sales chart
  const sc = document.getElementById('salesChart');
  if (sc && !sc._chartInit) {
    sc._chartInit = true;
    salesChartInstance = new Chart(sc, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Revenue',
          data: [280000,320000,310000,380000,420000,480000,390000,450000,410000,480000,520000,0],
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
            g.addColorStop(0, 'rgba(79,125,248,0.6)');
            g.addColorStop(1, 'rgba(155,109,255,0.2)');
            return g;
          },
          borderRadius: 8, borderSkipped: false
        }]
      },
      options: chartDefaults
    });
  }
  // Category chart
  const cc = document.getElementById('categoryChart');
  if (cc && !cc._chartInit) {
    cc._chartInit = true;
    categoryChartInstance = new Chart(cc, {
      type: 'doughnut',
      data: {
        labels: ['Grains','Dairy','FMCG','Snacks','Beverages','Cleaning'],
        datasets: [{
          data: [35, 22, 18, 12, 8, 5],
          backgroundColor: ['#4f7df8','#9b6dff','#36d6e7','#34d399','#f59e0b','#ec4899'],
          borderWidth: 0, spacing: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { color: '#8a8a9a', font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 10 } }
        }
      }
    });
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem(SETTINGS_KEYS.theme) || 'dark', true);
  syncVoiceControls();
  initSyncIndicators();
  initDashboardChart();
  // Show welcome toast
  setTimeout(() => showToast('Welcome back, Rajesh! You have 12 new orders.'), 800);
});

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('show'); });
});

// Keyboard shortcut: Cmd/Ctrl + K for search
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.querySelector('.topbar-search input').focus();
  }
});

let globalVoiceHudHideTimer = null;

function ensureGlobalVoiceHud() {
  let hud = document.getElementById('globalVoiceHud');
  if (hud) return hud;

  hud = document.createElement('div');
  hud.id = 'globalVoiceHud';
  hud.className = 'global-voice-hud hidden';
  hud.innerHTML = `
    <div class="global-voice-status" id="globalVoiceHudStatus">Voice idle</div>
    <div class="global-voice-text" id="globalVoiceHudText">Tap mic and speak...</div>
  `;
  document.body.appendChild(hud);
  return hud;
}

function showGlobalVoiceHud() {
  const hud = ensureGlobalVoiceHud();
  hud.classList.remove('hidden');
}

function hideGlobalVoiceHudSoon(delay = 1800) {
  if (globalVoiceHudHideTimer) clearTimeout(globalVoiceHudHideTimer);
  globalVoiceHudHideTimer = setTimeout(() => {
    const hud = document.getElementById('globalVoiceHud');
    if (hud) hud.classList.add('hidden');
  }, delay);
}

function updateGlobalVoiceHudStatus(state) {
  const statusEl = document.getElementById('globalVoiceHudStatus');
  if (!statusEl) return;

  const map = {
    listening: 'Listening...',
    processing: 'Processing...',
    executing: 'Executing...',
    speaking: 'Speaking...',
    waiting: 'Ready for next command',
    idle: 'Voice idle',
    unsupported: 'Voice unavailable',
    'error-permission': 'Mic permission denied'
  };
  statusEl.textContent = map[state] || 'Voice active';
}

function updateGlobalVoiceHudText(text, isInterim = false) {
  const textEl = document.getElementById('globalVoiceHudText');
  if (!textEl) return;
  if (!text) {
    textEl.textContent = 'Tap mic and speak...';
    textEl.classList.remove('interim');
    return;
  }
  textEl.textContent = text;
  textEl.classList.toggle('interim', !!isInterim);
}

// ========== FLOATING VOICE FAB ==========
function handleVoiceFabClick() {
  if (!isVoiceEnabled()) {
    showToast('Voice assistant is turned off. Enable it in Settings.', 'error');
    return;
  }

  const fab = document.getElementById('voiceFab');
  showGlobalVoiceHud();

  // Global mic only toggles listening; it should never navigate screens.
  if (typeof VoiceService !== 'undefined') {
    VoiceService.toggleListening();
    if (fab) fab.classList.toggle('active');
  }
}

// Update voice FAB state from voice engine
if (typeof VoiceService !== 'undefined') {
  ensureGlobalVoiceHud();

  VoiceService.on('state', (state) => {
    const fab = document.getElementById('voiceFab');
    updateGlobalVoiceHudStatus(state);

    if (state === 'idle' || state === 'waiting') {
      hideGlobalVoiceHudSoon(state === 'idle' ? 1200 : 2200);
    } else {
      showGlobalVoiceHud();
      if (globalVoiceHudHideTimer) {
        clearTimeout(globalVoiceHudHideTimer);
        globalVoiceHudHideTimer = null;
      }
    }

    if (!fab) return;
    if (state === 'listening' || state === 'activated' || state === 'waiting') {
      fab.classList.add('active');
      fab.innerHTML = '<i class="fas fa-waveform"></i>';
    } else if (state === 'processing' || state === 'executing') {
      fab.classList.add('active');
      fab.innerHTML = '<i class="fas fa-bolt"></i>';
    } else if (state === 'speaking') {
      fab.classList.add('active');
      fab.innerHTML = '<i class="fas fa-volume-high"></i>';
    } else {
      fab.classList.remove('active');
      fab.innerHTML = '<i class="fas fa-microphone"></i>';
    }
  });

  VoiceService.on('transcript', (text, isInterim) => {
    showGlobalVoiceHud();
    updateGlobalVoiceHudText(text, isInterim);
    if (!text) hideGlobalVoiceHudSoon(1800);
  });

  VoiceService.on('command', (cmd) => {
    if (!cmd) return;
    if (cmd.feedbackMessage) {
      showGlobalVoiceHud();
      updateGlobalVoiceHudText(cmd.feedbackMessage, false);
      hideGlobalVoiceHudSoon(1800);
    }
  });
}

// ========== VOICE CONFIRMATION MODAL ==========
let pendingConfirmAction = null;
let pendingConfirmCallback = null;

function showVoiceConfirm(title, message, onAccept) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('voiceConfirmModal').classList.add('show');
  pendingConfirmCallback = onAccept;
}

function acceptVoiceConfirm() {
  document.getElementById('voiceConfirmModal').classList.remove('show');
  if (pendingConfirmCallback) {
    pendingConfirmCallback();
    pendingConfirmCallback = null;
  }
}

function cancelVoiceConfirm() {
  document.getElementById('voiceConfirmModal').classList.remove('show');
  pendingConfirmCallback = null;
  if (typeof VoiceService !== 'undefined') {
    VoiceService.speak('Cancelled.');
  }
}

// ========== MOBILE NAVIGATION ==========
function mobileNav(id, el) {
  switchSection(id, document.querySelector('.nav-item[data-section="'+id+'"]'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const mt = document.getElementById('mobileTitle');
  const t = sectionTitles[id];
  if (mt && t) mt.textContent = t[0];
  closeMoreDrawer();
}

function toggleMoreDrawer() {
  const d = document.getElementById('moreDrawer');
  const o = document.getElementById('moreOverlay');
  if (!d || !o) return;
  d.classList.toggle('show');
  o.classList.toggle('show');
  // highlight more tab
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  const moreTab = document.querySelector('.mobile-nav-item[data-section="more"]');
  if (moreTab) moreTab.classList.add('active');
}

function closeMoreDrawer() {
  const d = document.getElementById('moreDrawer');
  const o = document.getElementById('moreOverlay');
  if (d) d.classList.remove('show');
  if (o) o.classList.remove('show');
}

function mobileGoTo(id) {
  closeMoreDrawer();
  switchSection(id, document.querySelector('.nav-item[data-section="'+id+'"]'));
  // reset bottom nav active (none of the main 4 match)
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  const mt = document.getElementById('mobileTitle');
  const t = sectionTitles[id];
  if (mt && t) mt.textContent = t[0];
}

// ─────────────────────────────────────────────────────────────
// AUTO-LOAD INVENTORY ON PAGE OPEN
// Fetches all DB products so they appear immediately in the
// Inventory section without needing to navigate away and back.
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Wait for filters.js to expose window.applyInventoryFilters,
  // and for index.html to define window.apiCall (auth guard).
  setTimeout(function autoLoadInventory() {
    if (typeof window.refreshInventory === 'function' &&
        typeof window.apiCall          === 'function') {
      window.refreshInventory();
    } else {
      // Retry up to 10 times with 200ms gap
      autoLoadInventory._retries = (autoLoadInventory._retries || 0) + 1;
      if (autoLoadInventory._retries < 10) setTimeout(autoLoadInventory, 200);
    }
  }, 600);
});
