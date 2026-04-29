/* ============================================================
   filters.js — LocalCart Inventory Filter/Sort + Orders Source Filter
   ============================================================ */
(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    .filter-chip {
      display: inline-flex;
      align-items: center;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      background: rgba(255,255,255,0.06);
      border: 1.5px solid rgba(255,255,255,0.1);
      color: var(--text-muted, #888);
      user-select: none;
      transition: all 0.15s;
    }
    .filter-chip:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .filter-chip.active {
      background: rgba(79,125,248,0.18);
      border-color: rgba(79,125,248,0.5);
      color: #7fa5ff;
    }
    .sort-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      color: var(--text-muted, #888);
      transition: background 0.12s, color 0.12s;
    }
    .sort-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
    .sort-item.active { color: #7fa5ff; background: rgba(79,125,248,0.1); }
    .sort-item i { width: 14px; text-align: center; font-size: 11px; }
    #invFilterBtn.has-filter,
    #invSortBtn.has-sort {
      border-color: rgba(79,125,248,0.6);
      color: #7fa5ff;
    }
    #invFilterBtn.has-filter i,
    #invSortBtn.has-sort i { color: #7fa5ff; }
  `;
  document.head.appendChild(style);

  /* ══════════════════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════════════════ */
  const invState = {
    search:   '',
    tab:      'all',    // all | low | expiring
    category: 'all',
    status:   'all',
    sort:     'name-asc'
  };

  const ordState = {
    source: 'all',
    search: ''
  };

  /* ══════════════════════════════════════════════════════════
     INVENTORY — RENDER
  ══════════════════════════════════════════════════════════ */
  function applyInventoryFilters() {

    const tbody   = document.getElementById('invTbody');
    const empty   = document.getElementById('invEmptyState');
    const table   = document.getElementById('inventoryTable');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    // 1. Filter
    let visible = rows.filter(row => {
      const cat    = row.dataset.category || '';
      const status = row.dataset.status   || '';
      const name   = (row.dataset.name    || '').toLowerCase();
      const stock  = parseInt(row.dataset.stock  || 99999, 10);

      // Search filter
      if (invState.search && !name.includes(invState.search.toLowerCase())) return false;

      // Tab filter
      if (invState.tab === 'low'      && status !== 'low' && status !== 'critical') return false;
      if (invState.tab === 'expiring' && !/Apr 2026|May 2026/.test(row.textContent)) return false;

      // Category chip
      if (invState.category !== 'all' && cat !== invState.category) return false;

      // Status chip
      if (invState.status !== 'all' && status !== invState.status) return false;

      return true;
    });

    // 2. Sort
    visible.sort((a, b) => {
      const [field, dir] = invState.sort.split('-');
      let va, vb;
      if (field === 'name')  { va = a.dataset.name;  vb = b.dataset.name; }
      if (field === 'price') { va = parseFloat(a.dataset.price); vb = parseFloat(b.dataset.price); }
      if (field === 'stock') { va = parseFloat(a.dataset.stock); vb = parseFloat(b.dataset.stock); }

      if (typeof va === 'string') {
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return dir === 'asc' ? va - vb : vb - va;
    });

    // 3. Apply visibility + order
    rows.forEach(r => r.style.display = 'none');
    visible.forEach(r => {
      r.style.display = '';
      tbody.appendChild(r); // re-order by appending in sorted order
    });

    // 4. Empty state
    if (table)  table.style.display  = visible.length ? '' : 'none';
    if (empty)  empty.style.display  = visible.length ? 'none' : 'block';
  }

  /* ══════════════════════════════════════════════════════════
     ORDERS — RENDER
  ══════════════════════════════════════════════════════════ */
  function applyOrderFilters() {
    const tbody = document.getElementById('orderTbody');
    const empty = document.getElementById('orderEmptyState');
    const emptyMsg = document.getElementById('orderEmptyMsg');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const q = ordState.search.toLowerCase();

    const visible = rows.filter(row => {
      const src = row.dataset.source || '';
      if (ordState.source !== 'all' && src !== ordState.source) return false;
      if (q && !row.textContent.toLowerCase().includes(q)) return false;
      return true;
    });

    rows.forEach(r => r.style.display = 'none');
    visible.forEach(r => r.style.display = '');

    // Empty state
    if (empty) {
      empty.style.display = visible.length ? 'none' : 'block';
      if (emptyMsg) {
        const srcLabel = ordState.source === 'all' ? 'orders' :
                         ordState.source === 'whatsapp' ? 'WhatsApp orders' :
                         ordState.source === 'manual' ? 'manual orders' : 'online orders';
        emptyMsg.textContent = q
          ? `No ${srcLabel} matching "${ordState.search}"`
          : `No ${srcLabel} found`;
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     INVENTORY PANEL — toggle open/close
  ══════════════════════════════════════════════════════════ */
  let filterOpen = false;
  let sortOpen   = false;

  function closeInvPanels() {
    filterOpen = sortOpen = false;
    const fp = document.getElementById('invFilterPanel');
    const sp = document.getElementById('invSortPanel');
    if (fp) fp.style.display = 'none';
    if (sp) sp.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════════
     UPDATE BUTTON INDICATORS
  ══════════════════════════════════════════════════════════ */
  function updateFilterBtnState() {
    const fb = document.getElementById('invFilterBtn');
    const sb = document.getElementById('invSortBtn');
    if (fb) fb.classList.toggle('has-filter',
      invState.category !== 'all' || invState.status !== 'all');
    if (sb) sb.classList.toggle('has-sort', invState.sort !== 'name-asc');
  }

  /* ══════════════════════════════════════════════════════════
     WIRE UP — Inventory
  ══════════════════════════════════════════════════════════ */
  function initInventoryFilters() {
    // Filter button
    const filterBtn = document.getElementById('invFilterBtn');
    const filterPanel = document.getElementById('invFilterPanel');
    if (filterBtn && filterPanel) {
      filterBtn.addEventListener('click', e => {
        e.stopPropagation();
        filterOpen = !filterOpen;
        filterPanel.style.display = filterOpen ? 'block' : 'none';
        if (filterOpen) { sortOpen = false; const sp = document.getElementById('invSortPanel'); if (sp) sp.style.display = 'none'; }
      });
    }

    // Sort button
    const sortBtn = document.getElementById('invSortBtn');
    const sortPanel = document.getElementById('invSortPanel');
    if (sortBtn && sortPanel) {
      sortBtn.addEventListener('click', e => {
        e.stopPropagation();
        sortOpen = !sortOpen;
        sortPanel.style.display = sortOpen ? 'block' : 'none';
        if (sortOpen) { filterOpen = false; const fp = document.getElementById('invFilterPanel'); if (fp) fp.style.display = 'none'; }
      });
    }

    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('#invFilterBtn') && !e.target.closest('#invFilterPanel') &&
          !e.target.closest('#invSortBtn')   && !e.target.closest('#invSortPanel')) {
        closeInvPanels();
      }
    });

    // Category chips
    document.addEventListener('click', e => {
      const chip = e.target.closest('#invFilterPanel [data-cat]');
      if (!chip) return;
      document.querySelectorAll('#invFilterPanel [data-cat]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      invState.category = chip.dataset.cat;
      updateFilterBtnState();
      applyInventoryFilters();
    });

    // Status chips
    document.addEventListener('click', e => {
      const chip = e.target.closest('#invFilterPanel [data-status]');
      if (!chip) return;
      document.querySelectorAll('#invFilterPanel [data-status]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      invState.status = chip.dataset.status;
      updateFilterBtnState();
      applyInventoryFilters();
    });

    // Clear filters
    const clearBtn = document.getElementById('invFilterClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        invState.category = 'all';
        invState.status   = 'all';
        document.querySelectorAll('#invFilterPanel [data-cat]').forEach(c => c.classList.toggle('active', c.dataset.cat === 'all'));
        document.querySelectorAll('#invFilterPanel [data-status]').forEach(c => c.classList.toggle('active', c.dataset.status === 'all'));
        updateFilterBtnState();
        applyInventoryFilters();
      });
    }

    // Sort items
    document.addEventListener('click', e => {
      const item = e.target.closest('#invSortPanel [data-sort]');
      if (!item) return;
      document.querySelectorAll('#invSortPanel .sort-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      invState.sort = item.dataset.sort;
      closeInvPanels();
      updateFilterBtnState();
      applyInventoryFilters();
    });

    // Inventory tabs (All Products / Low Stock / Expiring Soon)
    document.addEventListener('click', e => {
      const tab = e.target.closest('#invTabs [data-inv-tab]');
      if (!tab) return;
      document.querySelectorAll('#invTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      invState.tab = tab.dataset.invTab;
      applyInventoryFilters();
    });

    // Search input
    const searchInput = document.getElementById('invSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        invState.search = e.target.value.trim();
        applyInventoryFilters();
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     WIRE UP — Orders
  ══════════════════════════════════════════════════════════ */
  function initOrderFilters() {
    // Source tabs
    document.addEventListener('click', e => {
      const tab = e.target.closest('#orderTabs [data-order-source]');
      if (!tab) return;
      document.querySelectorAll('#orderTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      ordState.source = tab.dataset.orderSource;
      applyOrderFilters();
    });

    // Search
    const searchInput = document.getElementById('orderSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        ordState.search = e.target.value.trim();
        applyOrderFilters();
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════════ */
  function init() {
    // Expose as globals so app.js / refreshInventory can call them
    window.applyInventoryFilters = applyInventoryFilters;
    window.applyOrderFilters     = applyOrderFilters;

    initInventoryFilters();
    initOrderFilters();
    applyInventoryFilters(); // render with default sort applied
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
  } else {
    setTimeout(init, 150);
  }

})();
