/* ============================================================
   buttons.js — LocalCart Master Button Handler
   Wires up every interactive element across all sections
   ============================================================ */

(function () {
  'use strict';

  // ── Utility: toast shortcut ──────────────────────────────
  function toast(msg, type = 'success') {
    if (typeof showToast === 'function') showToast(msg, type);
  }

  // ── Utility: confirm dialog ──────────────────────────────
  function confirmAction(title, message, onYes) {
    if (typeof showVoiceConfirm === 'function') {
      showVoiceConfirm(title, message, onYes);
    } else if (confirm(`${title}\n${message}`)) {
      onYes();
    }
  }

  // ── Utility: simulate loading on a button ────────────────
  function withLoader(btn, asyncFn, loadText = 'Processing…') {
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadText}`;
    Promise.resolve().then(asyncFn).finally(() => {
      btn.disabled = false;
      btn.innerHTML = orig;
    });
  }

  // ── Utility: copy text to clipboard ──────────────────────
  function copyToClipboard(text, label = 'Copied') {
    navigator.clipboard.writeText(text).then(() => toast(`${label} copied to clipboard`)).catch(() => toast('Copy failed', 'error'));
  }

  // ── Utility: open WhatsApp ────────────────────────────────
  function openWhatsApp(msg) {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ── Utility: star rating widget ──────────────────────────
  function initStarRating(container) {
    const stars = container.querySelectorAll('span[style*="font-size:24px"]');
    stars.forEach((star, idx) => {
      star.style.cursor = 'pointer';
      star.addEventListener('mouseenter', () => stars.forEach((s, i) => s.style.opacity = i <= idx ? '1' : '0.3'));
      star.addEventListener('mouseleave', () => {
        const rated = container._rating || 0;
        stars.forEach((s, i) => s.style.opacity = i < rated ? '1' : '0.3');
      });
      star.addEventListener('click', () => {
        container._rating = idx + 1;
        stars.forEach((s, i) => s.style.opacity = i <= idx ? '1' : '0.3');
        toast(`Rated ${idx + 1} star${idx > 0 ? 's' : ''}! Thank you ⭐`);
      });
    });
  }

  /* =========================================================
     SECTION: DASHBOARD
  ========================================================= */
  function initDashboard() {
    // Export Report button
    delegateClick('[id="sec-dashboard"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Export')) {
        withLoader(btn, () => {
          return new Promise(r => setTimeout(() => {
            toast('Report downloaded successfully');
            r();
          }, 1200));
        }, 'Exporting…');
      }
    });

    // Tab switching (Revenue weekly/monthly/yearly)
    delegateClick('[id="sec-dashboard"] .tabs .tab', function (btn) {
      btn.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      toast(`Switched to ${btn.textContent} view`);
    });
  }

  /* =========================================================
     SECTION: STORE SETUP
  ========================================================= */
  function initStore() {
    // Preview Store
    delegateClick('[id="sec-store"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Preview')) toast('Customer store preview opened in new tab');
    });
    // Save Changes
    delegateClick('[id="sec-store"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Save')) {
        withLoader(btn, () => new Promise(r => setTimeout(() => { toast('Store profile saved'); r(); }, 900)), 'Saving…');
      }
    });
    // Upload areas — file picker simulation
    document.querySelectorAll('[id="sec-store"] [style*="border:2px dashed"]').forEach(area => {
      area.addEventListener('click', () => {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.onchange = () => { if (inp.files[0]) toast(`Image "${inp.files[0].name}" ready to upload`); };
        inp.click();
      });
    });
  }

  /* =========================================================
     SECTION: INVENTORY
  ========================================================= */
  function initInventory() {
    // Tab switching
    delegateClick('[id="sec-inventory"] .tabs .tab', function (btn) {
      btn.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
    });

    // Ellipsis action buttons on table rows - show a context menu
    delegateClick('[id="sec-inventory"] .btn-ghost', function (btn) {
      showContextMenu(btn, [
        { label: 'Edit Product', icon: 'fa-pen', action: () => toast('Edit product — coming soon') },
        { label: 'Adjust Stock', icon: 'fa-plus-minus', action: () => toast('Stock adjusted') },
        { label: 'View History', icon: 'fa-clock-rotate-left', action: () => toast('Viewing history') },
        { label: 'Delete Product', icon: 'fa-trash', color: '#f87171', action: () => confirmAction('Delete Product?', 'This cannot be undone.', () => toast('Product deleted', 'error')) }
      ]);
    });

    // Scan button
    delegateClick('[id="sec-inventory"] .btn-secondary', function (btn) {
      if (btn.textContent.includes('Scan')) toast('Barcode scanner — open camera to scan');
    });

    // Filter / Sort buttons
    delegateClick('[id="sec-inventory"] [class*="btn-sm"]', function (btn) {
      if (btn.textContent.includes('Filter')) toast('Filter panel — coming soon');
      if (btn.textContent.includes('Sort')) toast('Sort options — coming soon');
    });
  }

  /* =========================================================
     SECTION: ORDERS
  ========================================================= */
  function initOrders() {
    // New Order button
    delegateClick('[id="sec-orders"] .btn-primary', function (btn) {
      if (btn.textContent.includes('New Order')) toast('New order form — switching to Voice Billing', 'success');
      if (typeof switchSection === 'function') switchSection('voicebill', document.querySelector('[data-section=voicebill]'));
    });

    // Tab switching
    delegateClick('[id="sec-orders"] .tabs .tab', function (btn) {
      btn.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
    });

    // View buttons on order rows
    delegateClick('[id="sec-orders"] .btn-secondary.btn-sm', function (btn) {
      if (btn.textContent.trim() === 'View') {
        const row = btn.closest('tr');
        const id  = row?.querySelector('td.font-bold')?.textContent || '#?';
        toast(`Opening order ${id} details`);
      }
    });
  }

  /* =========================================================
     SECTION: DELIVERY
  ========================================================= */
  function initDelivery() {
    // Add Partner
    delegateClick('[id="sec-delivery"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Partner')) toast('Add delivery partner — form coming soon');
    });
  }

  /* =========================================================
     SECTION: BILLING
  ========================================================= */
  function initBilling() {
    // Create Invoice
    delegateClick('[id="sec-billing"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Invoice')) {
        if (typeof switchSection === 'function') switchSection('voicebill', document.querySelector('[data-section=voicebill]'));
        toast('Switched to Voice Billing to create invoice');
      }
    });

    // Copy UPI ID
    delegateClick('[id="sec-billing"] .btn-secondary', function (btn) {
      if (btn.textContent.includes('Copy UPI')) copyToClipboard('rajesh@upi', 'UPI ID');
    });

    // WhatsApp remind buttons
    delegateClick('[id="sec-billing"] .btn-ghost', function (btn) {
      if (btn.textContent.includes('Remind')) {
        const row   = btn.closest('[style*="padding:12px"]');
        const name  = row?.querySelector('.text-sm.font-bold')?.textContent || 'customer';
        const amount = row?.querySelector('.font-bold[style*="red"], .font-bold[style*="orange"]')?.textContent || '';
        openWhatsApp(`Hi ${name}, this is a reminder for your outstanding payment of ${amount}. Please settle at your earliest. Thank you! — Rajesh General Store`);
      }
    });

    // Send Reminders (bulk)
    delegateClick('[id="sec-billing"] [class*="btn-secondary"]', function (btn) {
      if (btn.textContent.includes('Send Reminders')) {
        withLoader(btn, () => new Promise(r => setTimeout(() => { toast('WhatsApp reminders sent to 3 customers'); r(); }, 1000)), 'Sending…');
      }
    });
  }

  /* =========================================================
     SECTION: ANALYTICS
  ========================================================= */
  function initAnalytics() {
    // Filter tabs (Daily/Weekly/Monthly)
    delegateClick('[id="sec-analytics"] .tabs .tab', function (btn) {
      btn.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      toast(`Analytics: ${btn.textContent} view`);
    });
  }

  /* =========================================================
     SECTION: AI INSIGHTS
  ========================================================= */
  function initAI() {
    // Reorder buttons
    delegateClick('[id="sec-ai"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Reorder')) {
        const row = btn.closest('[style*="padding:12px"]');
        const name = row?.querySelector('.text-sm.font-bold')?.textContent?.replace(/^🧈|🍫|🧹/, '').trim() || 'item';
        withLoader(btn, () => new Promise(r => setTimeout(() => { toast(`Reorder placed for ${name} ✓`); r(); }, 900)), 'Ordering…');
      }
    });
  }

  /* =========================================================
     SECTION: CUSTOMERS
  ========================================================= */
  function initCustomers() {
    // Customer Tabs
    delegateClick('[id="sec-customers"] .tabs .tab', function (btn) {
      btn.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
    });

    // Checkout button in shopping cart
    delegateClick('[id="sec-customers"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Checkout')) {
        withLoader(btn, () => new Promise(r => setTimeout(() => { toast('Customer checkout complete — ₹640 received'); r(); }, 1000)), 'Placing Order…');
      }
    });

    // Star rating init (lazy — wait for sections2 to render)
    setTimeout(() => {
      const ratingArea = document.querySelector('[id="sec-customers"] .flex.gap-8');
      if (ratingArea) initStarRating(ratingArea);
    }, 500);
  }

  /* =========================================================
     SECTION: SUPPLIERS
  ========================================================= */
  function initSuppliers() {
    // Add Supplier (header)
    delegateClick('[id="sec-suppliers"] .section-header .btn-primary', function (btn) {
      toast('Add Supplier — form coming soon');
    });

    // Order buttons on supplier cards
    delegateClick('[id="sec-suppliers"] .glass-card .btn-primary', function (btn) {
      if (btn.textContent.trim() === 'Order') {
        const card = btn.closest('.glass-card');
        const name = card?.querySelector('.font-bold')?.textContent || 'supplier';
        withLoader(btn, () => new Promise(r => setTimeout(() => { toast(`Order placed with ${name} ✓`); r(); }, 800)), 'Placing…');
      }
    });

    // Compare buttons
    delegateClick('[id="sec-suppliers"] .btn-secondary', function (btn) {
      if (btn.textContent.trim() === 'Compare') {
        const card = btn.closest('.glass-card');
        const name = card?.querySelector('.font-bold')?.textContent || 'supplier';
        toast(`Comparing ${name} with other suppliers`);
      }
    });

    // Add Reorder Rule
    delegateClick('[id="sec-suppliers"] .btn-secondary', function (btn) {
      if (btn.textContent.includes('Add Rule')) toast('Add auto-reorder rule — coming soon');
    });
  }

  /* =========================================================
     SECTION: MARKETING
  ========================================================= */
  function initMarketing() {
    // New Campaign
    delegateClick('[id="sec-marketing"] .section-header .btn-primary', function (btn) {
      toast('New campaign wizard — coming soon');
    });

    // Send WhatsApp Broadcast
    delegateClick('[id="sec-marketing"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Send Broadcast')) {
        withLoader(btn, () => new Promise(r => setTimeout(() => {
          toast('WhatsApp broadcast sent to 847 customers! 📢');
          r();
        }, 1500)), 'Sending…');
      }
    });

    // Create Coupon
    delegateClick('[id="sec-marketing"] .btn-secondary', function (btn) {
      if (btn.textContent.includes('Create Coupon')) toast('Coupon builder — coming soon');
    });
  }

  /* =========================================================
     SECTION: TEAM & ACCESS
  ========================================================= */
  function initTeam() {
    // Add Member
    delegateClick('[id="sec-team"] .btn-primary', function (btn) {
      if (btn.textContent.includes('Add Member')) toast('Add team member — form coming soon');
    });

    // Team member cards — click to view profile
    delegateClick('[id="sec-team"] .glass-card', function (card) {
      const name = card.querySelector('.font-bold')?.textContent;
      if (name && !card.querySelector('button')) toast(`Viewing profile: ${name}`);
    });
  }

  /* =========================================================
     SECTION: PLATFORM
  ========================================================= */
  function initPlatform() {
    // Sync cards — re-sync on click
    delegateClick('[id="sec-platform"] .glass-card', function (card) {
      const label = card.querySelector('.font-bold')?.textContent || '';
      if (label.includes('Last Synced')) {
        toast('Syncing now…');
        const timeEl = card.querySelector('.text-sm.font-bold');
        if (timeEl) setTimeout(() => { timeEl.textContent = 'Just now'; toast('Sync complete ✓'); }, 1200);
      }
    });
  }

  /* =========================================================
     SECTION: LOCAL NETWORK
  ========================================================= */
  function initNetwork() {
    // Join Network
    delegateClick('[id="sec-network"] .section-header .btn-primary', function (btn) {
      withLoader(btn, () => new Promise(r => setTimeout(() => { toast('Joined local vendor network! 🤝'); r(); }, 1000)), 'Connecting…');
    });

    // Connect buttons for vendors
    delegateClick('[id="sec-network"] .btn-secondary', function (btn) {
      if (btn.textContent.trim() === 'Connect') {
        const row  = btn.closest('[style*="padding:14px"]');
        const name = row?.querySelector('.text-sm.font-bold')?.textContent || 'vendor';
        withLoader(btn, () => new Promise(r => setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-check"></i> Connected';
          btn.disabled  = true;
          toast(`Connected with ${name} ✓`);
          r();
        }, 900)), 'Connecting…');
      }
    });
  }

  /* =========================================================
     SECTION: SETTINGS / ADMIN
  ========================================================= */
  function initAdmin() {
    // Export buttons
    delegateClick('[id="sec-admin"] .btn-secondary', function (btn) {
      if (btn.textContent.includes('Export')) {
        const row   = btn.closest('[style*="padding:16px"]');
        const label = row?.querySelector('.text-sm.font-bold')?.textContent || 'Data';
        withLoader(btn, () => new Promise(r => setTimeout(() => { toast(`${label} exported successfully`); r(); }, 1000)), 'Exporting…');
      }
    });

    // Danger: Delete Store
    delegateClick('[id="sec-admin"] .btn-danger', function (btn) {
      confirmAction(
        '⚠️ Delete Store?',
        'This will permanently delete all your data. This cannot be undone.',
        () => toast('Store deletion cancelled — please contact support.', 'error')
      );
    });
  }

  /* =========================================================
     SECTION: FAB (Floating Action Button)
  ========================================================= */
  function initFAB() {
    // FAB menu items that navigate to sections handled by existing onclick
    // Ensure FAB closes on outside click
    document.addEventListener('click', function (e) {
      const fab = document.getElementById('fab');
      if (fab && !fab.contains(e.target)) fab.classList.remove('open');
    });
  }

  /* =========================================================
     GLOBAL: Search bar
  ========================================================= */
  function initSearch() {
    const searchInput = document.querySelector('.topbar-search input');
    if (!searchInput) return;
    const allSections = Object.keys(typeof sectionTitles !== 'undefined' ? sectionTitles : {});

    searchInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const q = this.value.trim().toLowerCase();
      if (!q) return;

      // Try to match a section name
      const matched = allSections.find(id => {
        const t = typeof sectionTitles !== 'undefined' ? sectionTitles[id] : null;
        return t && (t[0].toLowerCase().includes(q) || t[1].toLowerCase().includes(q) || id.includes(q));
      });

      if (matched && typeof switchSection === 'function') {
        switchSection(matched, document.querySelector(`[data-section="${matched}"]`));
        this.value = '';
        toast(`Navigated to ${typeof sectionTitles !== 'undefined' ? sectionTitles[matched][0] : matched}`);
      } else {
        toast(`No section found for "${q}"`, 'error');
      }
    });
  }

  /* =========================================================
     CONTEXT MENU HELPER
  ========================================================= */
  let _ctxMenu = null;
  function showContextMenu(anchor, items) {
    if (_ctxMenu) _ctxMenu.remove();

    const menu = document.createElement('div');
    menu.style.cssText = `
      position:fixed;z-index:99999;
      background:var(--bg-card,#12121e);
      border:1px solid rgba(255,255,255,0.1);
      border-radius:10px;
      box-shadow:0 16px 48px rgba(0,0,0,0.5);
      padding:6px;min-width:180px;
      animation:fadeIn 0.12s ease;
    `;

    items.forEach(item => {
      const el = document.createElement('div');
      el.style.cssText = `
        display:flex;align-items:center;gap:10px;
        padding:9px 12px;border-radius:7px;
        font-size:13px;cursor:pointer;
        color:${item.color || 'var(--text-primary,#e8e8f0)'};
        transition:background 0.12s;
      `;
      el.innerHTML = `<i class="fas ${item.icon}" style="width:14px;text-align:center;opacity:0.7"></i>${item.label}`;
      el.addEventListener('mouseenter', () => el.style.background = 'rgba(255,255,255,0.07)');
      el.addEventListener('mouseleave', () => el.style.background = '');
      el.addEventListener('click', () => { menu.remove(); _ctxMenu = null; item.action(); });
      menu.appendChild(el);
    });

    document.body.appendChild(menu);
    _ctxMenu = menu;

    // Position near anchor
    const rect = anchor.getBoundingClientRect();
    let top  = rect.bottom + 4;
    let left = rect.left;
    if (left + 200 > window.innerWidth) left = rect.right - 200;
    if (top + 200  > window.innerHeight) top  = rect.top - 200;
    menu.style.top  = `${top}px`;
    menu.style.left = `${left}px`;

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function close() {
        menu.remove(); _ctxMenu = null;
        document.removeEventListener('click', close);
      });
    }, 10);
  }

  /* =========================================================
     DELEGATE CLICK HELPER
     Handles dynamically injected sections (sections2.js)
  ========================================================= */
  function delegateClick(selector, handler) {
    document.addEventListener('click', function (e) {
      const target = e.target.closest(selector);
      if (target) handler(target, e);
    });
  }

  /* =========================================================
     MOBILE SEARCH BUTTON
  ========================================================= */
  function initMobileSearch() {
    const mobileSearchBtn = document.querySelector('.mobile-header-btn .fa-search')?.closest('button');
    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener('click', () => {
        const inp = document.querySelector('.topbar-search input');
        if (inp) { inp.focus(); inp.scrollIntoView({ behavior: 'smooth' }); }
        else toast('Use the search bar at the top');
      });
    }
  }

  /* =========================================================
     MOBILE BELL BUTTON
  ========================================================= */
  function initMobileBell() {
    const mobileBell = document.querySelector('.mobile-header-btn .fa-bell')?.closest('button');
    if (mobileBell) {
      mobileBell.addEventListener('click', () => {
        if (typeof toggleNotifPanel === 'function') toggleNotifPanel();
        else toast('You have 3 new notifications');
      });
    }
  }

  /* =========================================================
     ANALYTICS FILTER TABS (globally delegated)
  ========================================================= */
  function initAnalyticsTabs() {
    document.addEventListener('click', function (e) {
      const tab = e.target.closest('.tabs .tab');
      if (!tab) return;
      tab.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  }

  /* =========================================================
     INIT — wait for sections2 to render then wire everything
  ========================================================= */
  function initAll() {
    initDashboard();
    initStore();
    initInventory();
    initOrders();
    initDelivery();
    initBilling();
    initAnalytics();
    initAI();
    initCustomers();
    initSuppliers();
    initMarketing();
    initTeam();
    initPlatform();
    initNetwork();
    initAdmin();
    initFAB();
    initSearch();
    initMobileSearch();
    initMobileBell();
    initAnalyticsTabs();
  }

  // Run after DOM + sections2 have rendered
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initAll, 200));
  } else {
    setTimeout(initAll, 200);
  }

})();
