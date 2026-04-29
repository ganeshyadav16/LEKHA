// ========== VOICE SECTIONS  5 New Screens ==========
// Voice Billing, Bill Preview, Voice Panel, Smart Insights, Data Mining

(function() {
  const container = document.getElementById('sections2Container');
  if (!container) return;

  container.insertAdjacentHTML('beforeend', `

<!-- ========== 16. VOICE BILLING ========== -->
<div class="section" id="sec-voicebill">
<div class="section-header"><div><div class="section-title"><i class="fas fa-microphone"></i> Voice Billing</div><div class="section-subtitle">Add items by voice or type</div></div>
<div class="lang-toggle">
  <button class="lang-btn active" onclick="setVoiceLang('en-IN',this)">English</button>
  <button class="lang-btn" onclick="setVoiceLang('te-IN',this)">Telugu</button>
  <button class="lang-btn" onclick="setVoiceLang('hi-IN',this)">Hindi</button>
</div>
<select class="voice-lang-select" id="voiceLangSelectHeader" onchange="setVoiceLang(this.value, null, true)">
  <option value="en-IN" selected>English</option>
  <option value="te-IN">Telugu</option>
  <option value="hi-IN">Hindi</option>
</select>
</div>

<div class="grid-2 mb-24">
  <!-- Voice Input Column -->
  <div class="glass-card" style="display:flex;flex-direction:column;align-items:center">
    <div class="mic-orb-wrap">
      <div class="mic-orb" id="micOrb" title="Tap to start or stop listening">
        <i class="fas fa-microphone"></i>
      </div>
      <div class="mic-status"><div class="mic-status-dot" id="micDot"></div><span id="micStatusText">Tap to start / stop</span></div>
      <div class="text-xs text-muted" id="voiceProviderChip">Mode: Browser Speech API</div>
    </div>

    <div class="waveform-container" id="waveform">
      <div class="waveform-bar"></div><div class="waveform-bar"></div><div class="waveform-bar"></div>
      <div class="waveform-bar"></div><div class="waveform-bar"></div><div class="waveform-bar"></div>
      <div class="waveform-bar"></div><div class="waveform-bar"></div><div class="waveform-bar"></div>
      <div class="waveform-bar"></div><div class="waveform-bar"></div><div class="waveform-bar"></div>
    </div>

    <div class="transcript-display" id="transcriptBox">
      <span class="transcript-placeholder">Speak naturally... text will appear live here</span>
    </div>

    <div class="voice-debug-strip" id="voiceDebugStrip">
      <span class="voice-debug-pill" id="dbgChunkRtt">Chunk RTT: --</span>
      <span class="voice-debug-pill" id="dbgChunkAvg">Avg RTT: --</span>
      <span class="voice-debug-pill" id="dbgCommandExec">Cmd: --</span>
    </div>

    <div class="manual-input-wrap mt-16">
      <div class="input-icon-wrap">
        <i class="fas fa-microphone-lines"></i>
        <input class="input-field" id="manualInput" placeholder="Type command... e.g. add 2 kg rice at 80">
      </div>
      <button class="btn btn-primary" onclick="submitManualCommand()"><i class="fas fa-paper-plane"></i></button>
    </div>

    <div class="voice-quick-actions mt-16">
      <button class="voice-quick-btn" onclick="VoiceService.manualCommand('total')"><i class="fas fa-calculator"></i> Total</button>
      <button class="voice-quick-btn" onclick="VoiceService.manualCommand('undo')"><i class="fas fa-rotate-left"></i> Undo</button>
      <button class="voice-quick-btn" onclick="showDiscountModal()"><i class="fas fa-percent"></i> Discount</button>
      <button class="voice-quick-btn danger" onclick="VoiceService.manualCommand('clear')"><i class="fas fa-trash"></i> Clear</button>
    </div>
  </div>

  <!-- Live Bill Column -->
  <div>
    <div class="live-bill" id="liveBillPanel">
      <div class="live-bill-header">
        <span class="font-bold"><i class="fas fa-receipt" style="color:var(--accent-blue)"></i> Running Bill</span>
        <span class="text-xs text-muted" id="billItemCount">0 items</span>
      </div>
      <div class="live-bill-items" id="liveBillItems">
        <div class="bill-empty"><i class="fas fa-cart-shopping"></i>Bill is empty. Start adding items.</div>
      </div>
      <div class="live-bill-footer">
        <div class="flex items-center justify-between text-sm mb-8" id="billSubtotalRow" style="display:none">
          <span class="text-muted">Subtotal</span><span id="billSubtotal">0</span>
        </div>
        <div class="flex items-center justify-between text-sm mb-8" id="billDiscountRow" style="display:none">
          <span class="text-muted">Discount</span><span id="billDiscountDisplay" style="color:var(--accent-green)">-0</span>
        </div>
        <div class="live-bill-total">
          <span>Total</span>
          <span class="live-bill-total-value" id="billTotalValue">0</span>
        </div>
      </div>
    </div>
    <div class="flex gap-8 mt-16">
      <button class="btn btn-primary w-full" onclick="generateBill()"><i class="fas fa-receipt"></i> Generate Bill</button>
      <button class="btn btn-secondary" onclick="shareBillWhatsApp()"><i class="fab fa-whatsapp"></i></button>
    </div>
  </div>
</div>
</div>

<!-- ========== 17. BILL PREVIEW ========== -->
<div class="section" id="sec-billpreview">
<div class="section-header"><div><div class="section-title"><i class="fas fa-receipt"></i> Bill Preview</div><div class="section-subtitle">View and share the latest bill</div></div>
<div class="flex gap-8">
  <button class="btn btn-secondary" onclick="switchSection('voicebill',document.querySelector('[data-section=voicebill]'))"><i class="fas fa-plus"></i> New Bill</button>
  <button class="btn btn-primary" onclick="shareBillWhatsApp()"><i class="fab fa-whatsapp"></i> Share</button>
</div>
</div>
<div class="grid-2">
  <div id="billReceiptContainer">
    <div class="bill-receipt" id="billReceipt">
      <div class="bill-receipt-header">
        <div class="bill-receipt-shop">Rajesh General Store</div>
        <div class="bill-receipt-info">45, MG Road, Sector 12, Bengaluru</div>
        <div class="bill-receipt-info">Ph: +91 98765 43210</div>
        <div class="bill-receipt-info" id="receiptDate"></div>
        <div class="bill-receipt-info" id="receiptId"></div>
      </div>
      <table class="bill-receipt-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody id="receiptItems"></tbody>
      </table>
      <div class="bill-receipt-totals">
        <div class="bill-receipt-row"><span>Subtotal</span><span id="receiptSubtotal"></span></div>
        <div class="bill-receipt-row" id="receiptDiscountRow" style="display:none"><span>Discount</span><span id="receiptDiscount" style="color:green"></span></div>
        <div class="bill-receipt-row bill-receipt-grand"><span>TOTAL</span><span id="receiptTotal"></span></div>
      </div>
      <div class="bill-receipt-footer">
        <div>Thank you for shopping with us!</div>
        <div style="margin-top:4px">Powered by BhashaBill</div>
      </div>
    </div>
  </div>
  <div class="glass-card">
    <div class="font-bold mb-16">Bill Actions</div>
    <div class="flex flex-col gap-12">
      <button class="btn btn-secondary w-full" onclick="window.print()"><i class="fas fa-print"></i> Print Bill</button>
      <button class="btn btn-secondary w-full" onclick="shareBillWhatsApp()"><i class="fab fa-whatsapp" style="color:var(--accent-green)"></i> Share on WhatsApp</button>
      <button class="btn btn-secondary w-full"><i class="fas fa-download"></i> Download PDF</button>
      <button class="btn btn-primary w-full" onclick="switchSection('voicebill',document.querySelector('[data-section=voicebill]'))"><i class="fas fa-plus"></i> Start New Bill</button>
    </div>
    <div class="mt-24">
      <div class="font-bold mb-12 text-sm">Recent Bills</div>
      <div id="recentBillsList" class="flex flex-col gap-8"></div>
    </div>
  </div>
</div>
</div>

<!-- ========== 18. VOICE PANEL ========== -->
<div class="section" id="sec-voicepanel">
<div class="section-header"><div><div class="section-title"><i class="fas fa-volume-high"></i> Voice Command Center</div><div class="section-subtitle">Monitor voice system, review commands, and configure settings</div></div></div>

<div class="grid-3 mb-24">
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(79,125,248,0.12);color:var(--accent-blue)"><i class="fas fa-microphone"></i></div></div><div class="stat-card-value" id="vpTotalCommands">0</div><div class="stat-card-label">Commands Today</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(52,211,153,0.12);color:var(--accent-green)"><i class="fas fa-check"></i></div></div><div class="stat-card-value" id="vpSuccessRate">0%</div><div class="stat-card-label">Success Rate</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(155,109,255,0.12);color:var(--accent-purple)"><i class="fas fa-language"></i></div></div><div class="stat-card-value" id="vpCurrentLang">English</div><div class="stat-card-label">Active Language</div></div>
</div>

<div class="grid-2 mb-24">
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-history" style="color:var(--accent-blue)"></i> Command History</div>
    <div class="command-log" id="commandLog">
      <div class="bill-empty"><i class="fas fa-comments"></i>No commands yet. Start by tapping the mic.</div>
    </div>
  </div>
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-sliders" style="color:var(--accent-purple)"></i> Voice Settings</div>
    <div class="flex flex-col gap-16">
      <div class="flex items-center justify-between"><div><div class="text-sm font-bold">Default Language</div><div class="text-xs text-muted">Primary voice recognition language</div></div>
        <div style="display:flex;align-items:center;gap:8px"><div class="lang-toggle"><button class="lang-btn active" onclick="setVoiceLang('en-IN',this)">EN</button><button class="lang-btn" onclick="setVoiceLang('te-IN',this)">TE</button><button class="lang-btn" onclick="setVoiceLang('hi-IN',this)">HI</button></div><select class="voice-lang-select" id="voiceLangSelectSettings" onchange="setVoiceLang(this.value, null, true)"><option value="en-IN" selected>English</option><option value="te-IN">Telugu</option><option value="hi-IN">Hindi</option></select></div>
      </div>
      <div class="flex items-center justify-between"><div><div class="text-sm font-bold">Speech Engine</div><div class="text-xs text-muted">Browser-native SpeechRecognition (Chrome/Edge)</div></div>
        <span class="badge badge-success">Active</span>
      </div>
      <div class="flex items-center justify-between"><div><div class="text-sm font-bold">Wake Word</div><div class="text-xs text-muted">Optional "Hey BhashaBill" activation</div></div><div class="toggle" id="wakeWordToggle" onclick="toggleWakeWord(this)"></div></div>
    </div>
  </div>
</div>

<div class="glass-card">
  <div class="font-bold mb-16"><i class="fas fa-list-check"></i> Supported Commands</div>
  <div class="grid-3">
    <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="text-sm font-bold" style="color:var(--accent-blue)">Add Items</div><div class="text-xs text-muted mt-4">"2 biscuits at 20"<br>"add 1 kg sugar at 45"</div></div>
    <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="text-sm font-bold" style="color:var(--accent-red)">Remove</div><div class="text-xs text-muted mt-4">"remove rice"<br>"remove sugar"</div></div>
    <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="text-sm font-bold" style="color:var(--accent-green)">Total</div><div class="text-xs text-muted mt-4">"what is total"<br>"how much total"</div></div>
    <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="text-sm font-bold" style="color:var(--accent-purple)">Discount</div><div class="text-xs text-muted mt-4">"10% discount"<br>"50 rupees off"</div></div>
    <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="text-sm font-bold" style="color:var(--accent-orange)">Bill + Share</div><div class="text-xs text-muted mt-4">"generate bill"<br>"share bill"</div></div>
    <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="text-sm font-bold" style="color:var(--accent-cyan)">Navigation</div><div class="text-xs text-muted mt-4">"open inventory"<br>"go home"</div></div>
  </div>
</div>
</div>

<!-- ========== 19. SMART INSIGHTS ========== -->
<div class="section" id="sec-smartinsights">
<div class="section-header"><div><div class="section-title"><i class="fas fa-lightbulb"></i> Smart Insights</div><div class="section-subtitle">AI-powered analysis from your real transaction data</div></div>
<button class="btn btn-secondary" onclick="refreshInsights()"><i class="fas fa-rotate"></i> Refresh</button>
</div>

<div class="grid-4 mb-24">
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(79,125,248,0.12);color:var(--accent-blue)"><i class="fas fa-indian-rupee-sign"></i></div></div><div class="stat-card-value" id="siRevenue">0</div><div class="stat-card-label">Today's Revenue</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(155,109,255,0.12);color:var(--accent-purple)"><i class="fas fa-bag-shopping"></i></div></div><div class="stat-card-value" id="siTransactions">0</div><div class="stat-card-label">Transactions</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(52,211,153,0.12);color:var(--accent-green)"><i class="fas fa-trophy"></i></div></div><div class="stat-card-value" id="siTopItem"></div><div class="stat-card-label">Top Item Today</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(245,158,11,0.12);color:var(--accent-orange)"><i class="fas fa-clock"></i></div></div><div class="stat-card-value" id="siPeakHour"></div><div class="stat-card-label">Peak Hour</div></div>
</div>

<div class="grid-2 mb-24">
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-chart-bar" style="color:var(--accent-blue)"></i> Weekly Revenue Trend</div>
    <div class="chart-container"><canvas id="weeklyRevenueChart" height="220"></canvas></div>
  </div>
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-clock" style="color:var(--accent-orange)"></i> Peak Hours Distribution</div>
    <div class="chart-container"><canvas id="peakHoursChart" height="220"></canvas></div>
  </div>
</div>

<div class="grid-2 mb-24">
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-fire" style="color:var(--accent-red)"></i> Top Selling Items (30 days)</div>
    <div id="topSellingList" class="flex flex-col gap-8"></div>
  </div>
  <div class="glass-card">
    <div class="flex items-center justify-between mb-16"><span class="font-bold"><i class="fas fa-triangle-exclamation" style="color:var(--accent-orange)"></i> Restock Urgency</span></div>
    <div id="restockList" class="flex flex-col gap-8"></div>
  </div>
</div>

<div class="grid-2">
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-cart-shopping" style="color:var(--accent-purple)"></i> Bundle Recommendations</div>
    <div class="text-xs text-muted mb-12">Items frequently bought together</div>
    <div id="bundleList" class="flex flex-col gap-8"></div>
  </div>
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-face-frown" style="color:var(--accent-red)"></i> Frequently Unavailable</div>
    <div class="text-xs text-muted mb-12">Items customers ask for but you don't stock</div>
    <div id="unavailableList" class="flex flex-col gap-8"></div>
  </div>
</div>
</div>

<!-- ========== 20. DATA MINING ========== -->
<div class="section" id="sec-datamining">
<div class="section-header"><div><div class="section-title"><i class="fas fa-gem"></i> Data Mining Engine</div><div class="section-subtitle">Apriori algorithm market basket analysis from ${DataEngine.getTransactions().length} transactions</div></div>
<div class="flex gap-8">
  <button class="btn btn-secondary" onclick="resetMiningData()"><i class="fas fa-rotate"></i> Regenerate Data</button>
  <button class="btn btn-primary" onclick="runMiningEngine()"><i class="fas fa-play"></i> Run Analysis</button>
</div>
</div>

<div class="grid-3 mb-24">
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(79,125,248,0.12);color:var(--accent-blue)"><i class="fas fa-database"></i></div></div><div class="stat-card-value" id="dmTransactions">${DataEngine.getTransactions().length}</div><div class="stat-card-label">Transactions Analyzed</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(155,109,255,0.12);color:var(--accent-purple)"><i class="fas fa-layer-group"></i></div></div><div class="stat-card-value" id="dmFreqSets">0</div><div class="stat-card-label">Frequent Itemsets</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(52,211,153,0.12);color:var(--accent-green)"><i class="fas fa-arrow-right-arrow-left"></i></div></div><div class="stat-card-value" id="dmRules">0</div><div class="stat-card-label">Association Rules</div></div>
</div>

<div class="grid-2 mb-24">
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-layer-group" style="color:var(--accent-blue)"></i> Frequent Itemsets</div>
    <div class="text-xs text-muted mb-12">Items frequently purchased together (min support: 10%)</div>
    <div id="freqSetsList" class="flex flex-col gap-8"></div>
  </div>
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-arrow-right-arrow-left" style="color:var(--accent-green)"></i> Association Rules</div>
    <div class="text-xs text-muted mb-12">If customer buys X   they also buy Y</div>
    <div id="assocRulesList" class="flex flex-col gap-4"></div>
  </div>
</div>

<div class="glass-card">
  <div class="font-bold mb-16"><i class="fas fa-lightbulb" style="color:var(--accent-orange)"></i> Hidden Patterns & Recommendations</div>
  <div class="grid-3" id="patternCards"></div>
</div>
</div>

`);

  // ========== INIT VOICE UI LOGIC ==========
  window.currentLastBill = null;

  function syncProviderChip() {
    const chip = document.getElementById('voiceProviderChip');
    if (!chip) return;
    chip.textContent = 'Mode: Browser Speech API';
  }

  function syncVoiceConfigUI() {
    if (typeof VoiceService === 'undefined') return;
    const state = VoiceService.getState();

    const wakeToggle = document.getElementById('wakeWordToggle');
    if (wakeToggle) wakeToggle.classList.toggle('active', !!state.wakeWordEnabled);

    syncProviderChip();
  }

  function bindMicInteractions() {
    const orb = document.getElementById('micOrb');
    if (!orb || typeof VoiceService === 'undefined') return;

    orb.addEventListener('click', () => {
      VoiceService.toggleListening();
    });
  }

  function formatDebugMs(ms) {
    const n = Number(ms || 0);
    if (!Number.isFinite(n) || n <= 0) return '--';
    return `${Math.round(n)}ms`;
  }

  function updateVoiceDebugStrip(stats) {
    const chunkEl = document.getElementById('dbgChunkRtt');
    const avgEl = document.getElementById('dbgChunkAvg');
    const cmdEl = document.getElementById('dbgCommandExec');
    if (!chunkEl || !avgEl || !cmdEl) return;

    const chunkMs = Number(stats && stats.lastChunkMs ? stats.lastChunkMs : 0);
    const avgMs = Number(stats && stats.avgChunkMs ? stats.avgChunkMs : 0);
    const chunkCount = Number(stats && stats.chunkCount ? stats.chunkCount : 0);
    const cmdMs = Number(stats && stats.lastCommandMs ? stats.lastCommandMs : 0);
    const cmdAction = stats && stats.lastCommandAction && stats.lastCommandAction !== 'none'
      ? stats.lastCommandAction
      : null;

    chunkEl.textContent = `Chunk RTT: ${formatDebugMs(chunkMs)}${chunkCount ? ` (${chunkCount})` : ''}`;
    avgEl.textContent = `Avg RTT: ${formatDebugMs(avgMs)}`;
    cmdEl.textContent = cmdAction
      ? `Cmd: ${cmdAction} ${formatDebugMs(cmdMs)}`
      : 'Cmd: --';

    chunkEl.classList.toggle('hot', chunkMs > 1400);
    avgEl.classList.toggle('hot', avgMs > 1200);
    cmdEl.classList.toggle('hot', cmdMs > 450);
  }

  window.toggleWakeWord = function(toggleEl) {
    if (!toggleEl || typeof VoiceService === 'undefined') return;
    const next = !toggleEl.classList.contains('active');
    toggleEl.classList.toggle('active', next);
    VoiceService.setWakeWordEnabled(next);
    showToast(next ? 'Wake word enabled' : 'Wake word disabled');
  };

  bindMicInteractions();
  syncVoiceConfigUI();
  if (typeof VoiceService !== 'undefined') {
    VoiceService.setLanguage('en-IN');
  }

  // Voice state handler
  VoiceService.on('state', (state) => {
    const orb = document.getElementById('micOrb');
    const dot = document.getElementById('micDot');
    const status = document.getElementById('micStatusText');
    if (!orb) return;

    syncProviderChip();

    orb.className = 'mic-orb';
    dot.className = 'mic-status-dot';
    const bars = document.querySelectorAll('.waveform-bar');

    switch (state) {
      case 'listening':
        orb.classList.add('listening');
        orb.innerHTML = '<i class="fas fa-microphone"></i>';
        dot.classList.add('active');
        status.textContent = 'Listening live (browser speech)... speak now';
        bars.forEach(b => b.classList.add('active'));
        break;
      case 'speaking':
        orb.classList.add('speaking');
        orb.innerHTML = '<i class="fas fa-volume-high"></i>';
        dot.classList.add('speaking');
        status.textContent = 'Speaking...';
        bars.forEach(b => b.classList.remove('active'));
        break;
      case 'processing':
        orb.classList.add('processing');
        orb.innerHTML = '<i class="fas fa-spinner"></i>';
        status.textContent = 'Processing latest words...';
        bars.forEach(b => b.classList.remove('active'));
        break;
      case 'executing':
        orb.classList.add('executing');
        orb.innerHTML = '<i class="fas fa-bolt"></i>';
        dot.classList.add('executing');
        status.textContent = 'Executing command...';
        bars.forEach(b => b.classList.remove('active'));
        break;
      case 'activated':
        orb.classList.add('listening');
        dot.classList.add('active');
        status.textContent = 'Activated!';
        break;
      case 'waiting':
        orb.classList.add('listening');
        status.textContent = 'Ready. Speak your next command';
        break;
      case 'error-permission':
        orb.classList.add('error');
        status.textContent = 'Mic permission denied';
        break;
      case 'error-backend':
        orb.classList.add('error');
        status.textContent = 'Speech engine unavailable';
        bars.forEach(b => b.classList.remove('active'));
        break;
      case 'unsupported':
        orb.classList.add('error');
        status.textContent = 'Voice not supported in this browser';
        bars.forEach(b => b.classList.remove('active'));
        break;
      default:
        orb.innerHTML = '<i class="fas fa-microphone"></i>';
        status.textContent = 'Tap to start / stop';
        bars.forEach(b => b.classList.remove('active'));
    }
  });

  // Transcript handler
  VoiceService.on('transcript', (text, isInterim) => {
    const box = document.getElementById('transcriptBox');
    if (!box) return;
    if (!text) {
      box.classList.remove('active');
      box.innerHTML = '<span class="transcript-placeholder">Speak naturally... text will appear live here</span>';
      return;
    }
    box.classList.toggle('active', true);
    box.innerHTML = isInterim
      ? `<span class="transcript-interim">${text}</span>`
      : `<span>${text}</span>`;
  });

  VoiceService.on('debug', (stats) => {
    updateVoiceDebugStrip(stats || {});
  });

  if (typeof VoiceService.getDebugStats === 'function') {
    updateVoiceDebugStrip(VoiceService.getDebugStats());
  }

  // Command handler  update bill UI
  let voiceUiRefreshTimer = null;

  function callGlobalIfExists(fnName) {
    if (typeof window[fnName] !== 'function') return;
    try {
      window[fnName]();
    } catch (_err) {
      // Keep live voice flow resilient even if optional refresh hooks fail.
    }
  }

  function scheduleVoiceDrivenSurfaceRefresh(cmd) {
    if (!cmd || !cmd.action) return;

    const dataMutatingActions = new Set([
      'add',
      'correct_add',
      'remove',
      'undo',
      'discount',
      'stock',
      'clear',
      'bill'
    ]);
    if (!dataMutatingActions.has(cmd.action)) return;

    if (voiceUiRefreshTimer) clearTimeout(voiceUiRefreshTimer);
    voiceUiRefreshTimer = setTimeout(() => {
      const activeSectionId = document.querySelector('.section.active')?.id || '';

      if (activeSectionId === 'sec-inventory') {
        ['renderInventory', 'refreshInventory', 'renderInventoryTable', 'renderInventoryList']
          .forEach((fnName) => callGlobalIfExists(fnName));
      }
      if (activeSectionId === 'sec-smartinsights') {
        callGlobalIfExists('refreshInsights');
      }
      if (activeSectionId === 'sec-datamining') {
        callGlobalIfExists('runMiningEngine');
      }
      if (activeSectionId === 'sec-eod') {
        callGlobalIfExists('renderEOD');
      }
    }, 90);
  }

  VoiceService.on('command', (cmd, result) => {
    updateBillUI();
    updateCommandLog(cmd);
    scheduleVoiceDrivenSurfaceRefresh(cmd);

    if (cmd && cmd.feedbackMessage && typeof showToast === 'function') {
      showToast(cmd.feedbackMessage, cmd.feedbackType === 'error' ? 'error' : 'success');
    } else if (cmd && cmd.action === 'unknown' && typeof showToast === 'function') {
      showToast('Command not recognized', 'error');
    }

    if (cmd.action === 'bill' && cmd.billResult && cmd.billResult.success) {
      const txn = cmd.billResult.txn;
      if (!window.currentLastBill || window.currentLastBill.id !== txn.id) {
        window.currentLastBill = txn;
        renderReceipt(txn);
        setTimeout(() => switchSection('billpreview', document.querySelector('[data-section=billpreview]')), 250);
      }
    }
  });

  // ========== BILL UI UPDATE ==========
  // Always uses DataEngine (client-side) as source of truth for voice billing.
  // Voice commands add items to DataEngine directly; no backend round-trip needed here.
  window.updateBillUI = function() {
    const itemsEl = document.getElementById('liveBillItems');
    const countEl = document.getElementById('billItemCount');
    const totalEl = document.getElementById('billTotalValue');
    const subRow = document.getElementById('billSubtotalRow');
    const subEl = document.getElementById('billSubtotal');
    const discRow = document.getElementById('billDiscountRow');
    const discEl = document.getElementById('billDiscountDisplay');
    if (!itemsEl) return;

    try {
      const bill = DataEngine.getBill();
      if (bill.items.length === 0) {
        itemsEl.innerHTML = '<div class="bill-empty"><i class="fas fa-cart-shopping"></i>Bill is empty. Start adding items.</div>';
        if (countEl) countEl.textContent = '0 items';
        if (totalEl) totalEl.textContent = '₹0';
        if (subRow) subRow.style.display = 'none';
        if (discRow) discRow.style.display = 'none';
        return;
      }

      itemsEl.innerHTML = bill.items.map((item) => `
        <div class="live-bill-item">
          <div>
            <div class="live-bill-item-name">${item.name}</div>
            <div class="live-bill-item-detail">${item.qty} ${item.unit || ''} &nbsp;·&nbsp; ₹${item.price || ''}</div>
          </div>
          <div style="text-align:right">
            <div class="live-bill-item-price">₹${item.subtotal || item.price * item.qty}</div>
            <button class="btn btn-ghost btn-sm" onclick="removeBillItem('${item.name}')" style="font-size:11px;color:var(--accent-red);padding:2px 8px"><i class="fas fa-times"></i></button>
          </div>
        </div>
      `).join('');

      if (countEl) countEl.textContent = `${bill.items.length} item${bill.items.length !== 1 ? 's' : ''}`;
      const subtotal = DataEngine.getBillSubtotal();
      const total = DataEngine.getBillTotal();
      if (totalEl) totalEl.textContent = `₹${total}`;

      if (bill.discount > 0) {
        if (subRow) subRow.style.display = 'flex';
        if (subEl) subEl.textContent = `₹${subtotal}`;
        if (discRow) discRow.style.display = 'flex';
        if (discEl) discEl.textContent = `-₹${subtotal - total}`;
      } else {
        if (subRow) subRow.style.display = 'none';
        if (discRow) discRow.style.display = 'none';
      }
    } catch (e) {
      itemsEl.innerHTML = '<div class="bill-empty"><i class="fas fa-cart-shopping"></i>Bill is empty. Start adding items.</div>';
      if (countEl) countEl.textContent = '0 items';
      if (totalEl) totalEl.textContent = '₹0';
      if (subRow) subRow.style.display = 'none';
      if (discRow) discRow.style.display = 'none';
    }
  };

  window.removeBillItem = function(name) {
    try {
      DataEngine.removeFromBill(name);
      updateBillUI();
      if (typeof showToast === 'function') showToast(`Removed ${name}`);
    } catch (_) {}
  };

  window.submitManualCommand = function() {
    const input = document.getElementById('manualInput');
    if (input && input.value.trim()) {
      VoiceService.manualCommand(input.value.trim());
      input.value = '';
      // refresh server bill shortly after the manual command to reflect server-side changes
      setTimeout(() => updateBillUI(), 300);
    }
  };
  // Enter key for manual input
  document.getElementById('manualInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitManualCommand(); });

  window.generateBill = function(options = {}) {
    // Server-authoritative checkout with fallback to client-side
    (async () => {
      try {
        const res = await fetch('/billing/checkout', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({})});
        const body = await res.json();
        if (res.ok && body && body.ok) {
          const data = body.data;
          // data contains transaction, lowStockAlerts, billJson, whatsappMessage
          window.currentLastBill = data.transaction;
          renderReceipt(data.transaction);
          if (typeof showToast === 'function') showToast('Bill generated');
          const delay = options && options.source === 'voice' ? 250 : 120;
          setTimeout(() => switchSection('billpreview', document.querySelector('[data-section=billpreview]')), delay);
          updateBillUI();
          return;
        }
      } catch (e) {
        // fallthrough to client fallback
      }

      // fallback to client-side
      try {
        const result = DataEngine.completeBill();
        updateBillUI();
        if (!result.success) {
          if (typeof showToast === 'function') showToast('Bill is empty', 'error');
          return result;
        }
        window.currentLastBill = result.txn;
        renderReceipt(result.txn);
        if (typeof showToast === 'function') showToast('Bill generated');
        const delay = options && options.source === 'voice' ? 250 : 120;
        setTimeout(() => switchSection('billpreview', document.querySelector('[data-section=billpreview]')), delay);
        return result;
      } catch (e) {
        if (typeof showToast === 'function') showToast('Unable to generate bill', 'error');
      }
    })();
  };

  window.setVoiceLang = function(lang, el) {
    const allowed = ['en-IN', 'te-IN', 'hi-IN'];
    const next = allowed.includes(lang) ? lang : 'en-IN';

    VoiceService.setLanguage(next);
    document.querySelectorAll('.lang-toggle .lang-btn').forEach((btn) => {
      const clickAttr = btn.getAttribute('onclick') || '';
      btn.classList.toggle('active', clickAttr.includes(`'${next}'`));
    });
    if (el && el.parentElement) {
      el.parentElement.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
    }

    document.querySelectorAll('.voice-lang-select').forEach((select) => {
      if (select.value !== next) select.value = next;
    });

    const vpLang = document.getElementById('vpCurrentLang');
    if (vpLang) vpLang.textContent = next === 'te-IN' ? 'Telugu' : next === 'hi-IN' ? 'Hindi' : 'English';
  };

  window.showDiscountModal = function() {
    const v = prompt('Enter discount (e.g. 10 for 10%):');
    if (v) VoiceService.manualCommand(v + '% discount');
  };

  window.shareBillWhatsApp = function() {
    const bill = window.currentLastBill;
    if (!bill) { showToast('No bill to share', 'error'); return; }
    let msg = `*Rajesh General Store*\n${new Date(bill.date).toLocaleString()}\n\n`;
    bill.items.forEach(i => { msg += ` ${i.name} (${i.qty} ${i.unit})  ${i.price * i.qty}\n`; });
    msg += `\n*Total: ${bill.total}*\n\nThank you!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ========== RECEIPT RENDER ==========
  window.renderReceipt = function(txn) {
    const ts = txn.timestamp || txn.date || txn.time || txn.createdAt;
    document.getElementById('receiptDate').textContent = ts ? new Date(ts).toLocaleString() : new Date().toLocaleString();
    document.getElementById('receiptId').textContent = txn.id || txn.transactionId || '';
    document.getElementById('receiptItems').innerHTML = (txn.items || []).map(i => `
      <tr><td>${i.name}</td><td>${i.qty} ${i.unit || ''}</td><td>${i.unitPrice || i.price || 0}</td><td>${ (i.lineTotal !== undefined) ? i.lineTotal : ((i.unitPrice || i.price || 0) * (i.qty || 0)) }</td></tr>
    `).join('');
    document.getElementById('receiptSubtotal').textContent = `${txn.subtotal || 0}`;
    const discountVal = txn.discountValue || 0;
    const discountType = txn.discountType || 'percent';
    if (discountVal > 0) {
      document.getElementById('receiptDiscountRow').style.display = 'flex';
      document.getElementById('receiptDiscount').textContent = `${discountVal} ${discountType}`;
    } else {
      document.getElementById('receiptDiscountRow').style.display = 'none';
    }
    document.getElementById('receiptTotal').textContent = `${txn.total || 0}`;

    // Recent bills (client-side fallback list)
    const recent = (typeof DataEngine !== 'undefined' ? DataEngine.getTransactions() : []).slice(-5).reverse();
    const list = document.getElementById('recentBillsList');
    if (list) {
      list.innerHTML = recent.map(t => `
        <div class="flex items-center justify-between" style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-md);cursor:pointer" onclick="renderReceipt(DataEngine.getTransactions().find(x=>x.id==='${t.id}'));window.currentLastBill=DataEngine.getTransactions().find(x=>x.id==='${t.id}')">
          <div><div class="text-sm font-bold">${t.id}</div><div class="text-xs text-muted">${new Date(t.date).toLocaleString()}</div></div>
          <span class="font-bold">${t.total}</span>
        </div>
      `).join('');
    }
  };

  // ========== COMMAND LOG ==========
  window.updateCommandLog = function(cmd) {
    const log = document.getElementById('commandLog');
    if (!log) return;
    if (log.querySelector('.bill-empty')) log.innerHTML = '';
    const time = new Date().toLocaleTimeString();
    const icon = cmd.action === 'unknown'
      ? 'Unknown'
      : {
        add: 'Add', remove: 'Remove', undo: 'Undo', total: 'Total', discount: 'Discount', bill: 'Bill', clear: 'Clear',
        summary: 'Summary', today_sales: 'Today Sales', top_items: 'Top Items', stock: 'Stock', activate: 'Activate', stop: 'Stop', navigate: 'Navigate', share_bill: 'Share', print_bill: 'Print',
        correct_add: 'Correct',
        start_billing: 'Start Billing', close_shop: 'Close Shop',
        inventory_add: 'Add Product'
      }[cmd.action] || 'Action';
    log.insertAdjacentHTML('afterbegin', `
      <div class="command-log-item">
        <div class="command-log-icon user"><i class="fas fa-user"></i></div>
        <div><div class="command-log-text">${icon} "${cmd.raw}"</div><div class="command-log-time">${time}  Action: ${cmd.action}</div></div>
      </div>
    `);
    // Update stats
    const history = VoiceService.getHistory();
    const vpTotal = document.getElementById('vpTotalCommands');
    const vpSuccess = document.getElementById('vpSuccessRate');
    if (vpTotal) vpTotal.textContent = history.length;
    if (vpSuccess) {
      const good = history.filter(h => h.command.action !== 'unknown').length;
      vpSuccess.textContent = history.length > 0 ? Math.round(good / history.length * 100) + '%' : '0%';
    }
  };

  function renderSkeletonRows(targetId, rows = 4, height = 52) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = Array.from({ length: rows }, () =>
      `<div class="skeleton" style="height:${height}px;border-radius:var(--radius-md)"></div>`
    ).join('');
  }

  function renderInsightsSkeleton() {
    ['siRevenue', 'siTransactions', 'siTopItem', 'siPeakHour'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '...';
    });
    renderSkeletonRows('topSellingList', 5, 52);
    renderSkeletonRows('restockList', 4, 52);
    renderSkeletonRows('bundleList', 4, 46);
    renderSkeletonRows('unavailableList', 3, 46);
  }

  function renderMiningSkeleton() {
    const freq = document.getElementById('dmFreqSets');
    const rules = document.getElementById('dmRules');
    if (freq) freq.textContent = '...';
    if (rules) rules.textContent = '...';
    renderSkeletonRows('freqSetsList', 6, 46);
    renderSkeletonRows('assocRulesList', 6, 46);
    renderSkeletonRows('patternCards', 3, 120);
  }

  // ========== SMART INSIGHTS ==========
  window.refreshInsights = function() {
    renderInsightsSkeleton();
    setTimeout(() => {
      const day = DataEngine.getDaySummary();
      document.getElementById('siRevenue').textContent = `${day.totalRevenue.toLocaleString()}`;
      document.getElementById('siTransactions').textContent = day.totalTransactions;
      document.getElementById('siTopItem').textContent = day.topItems[0]?.name || '';
      document.getElementById('siPeakHour').textContent = day.peakHour !== null ? `${day.peakHour}:00` : '';

      // Top selling
      const top = DataEngine.getTopSellingItems(30);
      document.getElementById('topSellingList').innerHTML = top.slice(0, 8).map((item, i) => `
        <div class="flex items-center justify-between" style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-md)">
          <div class="flex items-center gap-12"><span class="font-bold" style="color:var(--accent-blue);width:20px">#${i + 1}</span><div><div class="text-sm font-bold">${item.name}</div><div class="text-xs text-muted">${item.qty} units sold</div></div></div>
          <span class="font-bold">${item.revenue.toLocaleString()}</span>
        </div>
      `).join('');

      // Restock
      const restock = DataEngine.getRestockSuggestions();
      document.getElementById('restockList').innerHTML = restock.slice(0, 6).map(item => `
        <div class="flex items-center justify-between" style="padding:10px;background:rgba(${item.urgency === 'critical' ? '244,63,94' : '245,158,11'},0.05);border-radius:var(--radius-md);border-left:3px solid var(--accent-${item.urgency === 'critical' ? 'red' : 'orange'})">
          <div><div class="text-sm font-bold">${item.name}</div><div class="text-xs text-muted">Stock: ${item.qty}  ~${item.daysLeft} days left</div></div>
          <span class="badge ${item.urgency === 'critical' ? 'badge-danger' : 'badge-warning'}">${item.urgency}</span>
        </div>
      `).join('');

      // Bundles
      const bundles = DataEngine.getBundleRecommendations();
      document.getElementById('bundleList').innerHTML = bundles.slice(0, 6).map(b => `
        <div class="mining-rule"><span class="text-sm font-bold">${b.trigger}</span><span class="mining-arrow"> </span><span class="text-sm">${b.suggest}</span>
          <span class="mining-confidence ${+b.confidence >= 70 ? 'confidence-high' : +b.confidence >= 50 ? 'confidence-med' : 'confidence-low'}">${b.confidence}%</span>
        </div>
      `).join('') || '<div class="text-sm text-muted">Not enough data yet</div>';

      // Unavailable
      const unavail = DataEngine.getUnavailableItems();
      document.getElementById('unavailableList').innerHTML = unavail.length > 0
        ? unavail.slice(0, 6).map(u => `
          <div class="flex items-center justify-between" style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-md)">
            <span class="text-sm font-bold">${u.item}</span><span class="badge badge-danger">${u.count} requests</span>
          </div>
        `).join('')
        : '<div class="text-sm text-muted">No unavailable items recorded yet</div>';

      // Charts
      initInsightCharts();
    }, 180);
  };

  let weeklyChart = null, peakChart = null;
  window.initInsightCharts = function() {
    const weekly = DataEngine.getWeeklySummary();
    const peaks = DataEngine.getPeakHours();

    // Weekly
    const wCtx = document.getElementById('weeklyRevenueChart');
    if (wCtx) {
      if (weeklyChart) weeklyChart.destroy();
      weeklyChart = new Chart(wCtx, {
        type: 'bar',
        data: {
          labels: weekly.map(d => d.day),
          datasets: [{ data: weekly.map(d => d.totalRevenue), backgroundColor: 'rgba(79,125,248,0.5)', borderRadius: 8, borderSkipped: false }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false }, ticks: { color: '#55556a' } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#55556a' } } } }
      });
    }

    // Peak hours
    const pCtx = document.getElementById('peakHoursChart');
    if (pCtx) {
      const hourLabels = Array.from({ length: 14 }, (_, i) => `${i + 7}:00`);
      const hourData = hourLabels.map((_, i) => {
        const h = i + 7;
        const found = peaks.find(p => p.hour === h);
        return found ? found.count : 0;
      });
      if (peakChart) peakChart.destroy();
      peakChart = new Chart(pCtx, {
        type: 'bar',
        data: {
          labels: hourLabels,
          datasets: [{ data: hourData, backgroundColor: hourData.map(v => v >= Math.max(...hourData) * 0.8 ? 'rgba(244,63,94,0.6)' : 'rgba(245,158,11,0.4)'), borderRadius: 6, borderSkipped: false }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false }, ticks: { color: '#55556a', maxRotation: 45 } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#55556a' } } } }
      });
    }
  };

  // ========== DATA MINING ==========
  window.resetMiningData = function() {
    DataEngine.resetTransactions();
    runMiningEngine();
    showToast('Sample data reset to find new patterns!');
  };

  window.runMiningEngine = function() {
    renderMiningSkeleton();
    setTimeout(() => {
      const result = DataEngine.runApriori(0.05, 0.3);

      document.getElementById('dmFreqSets').textContent = result.frequentSets.length;
      document.getElementById('dmRules').textContent = result.rules.length;
      document.getElementById('dmTransactions').textContent = DataEngine.getTransactions().length;

      // Frequent sets
      document.getElementById('freqSetsList').innerHTML = result.frequentSets.slice(0, 12).map(s => `
        <div class="flex items-center justify-between" style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-md)">
          <div class="flex items-center gap-8">${s.items.map(i => `<span class="badge badge-info">${i}</span>`).join('<span style="color:var(--accent-blue)">+</span>')}</div>
          <span class="text-xs text-muted">Support: ${s.support}%</span>
        </div>
      `).join('');

      // Association rules
      document.getElementById('assocRulesList').innerHTML = result.rules.slice(0, 15).map(r => `
        <div class="mining-rule">
          <span class="badge badge-purple">${r.if}</span>
          <span class="mining-arrow"><i class="fas fa-arrow-right"></i></span>
          <span class="badge badge-info">${r.then}</span>
          <span class="mining-confidence ${+r.confidence >= 70 ? 'confidence-high' : +r.confidence >= 50 ? 'confidence-med' : 'confidence-low'}">${r.confidence}%</span>
        </div>
      `).join('');

      // Pattern cards
      const bundles = DataEngine.getBundleRecommendations();
      document.getElementById('patternCards').innerHTML = bundles.slice(0, 6).map(b => `
        <div class="insight-card">
          <div class="insight-card-header"><div class="insight-card-icon" style="background:rgba(155,109,255,0.12);color:var(--accent-purple)"><i class="fas fa-link"></i></div><span class="text-sm font-bold">Bundle Detected</span></div>
          <div class="text-sm mb-8">${b.trigger} <span style="color:var(--accent-blue)">+</span> ${b.suggest}</div>
          <div class="text-xs text-muted">${b.confidence}% confidence  Suggest as combo deal</div>
        </div>
      `).join('');

      showToast('Mining analysis complete!');
    }, 220);
  };

  // ========== 21. END-OF-DAY SUMMARY ==========
  container.insertAdjacentHTML('beforeend', `

<div class="section" id="sec-eod">
<div class="section-header"><div><div class="section-title"><i class="fas fa-sun"></i> End-of-Day Summary</div><div class="section-subtitle">Complete daily report, review, share, and close your day</div></div>
<div class="flex gap-8">
  <button class="btn btn-secondary" onclick="VoiceService.manualCommand('summary')"><i class="fas fa-microphone"></i> Voice Summary</button>
  <button class="btn btn-primary" onclick="shareEODWhatsApp()"><i class="fab fa-whatsapp"></i> Share Report</button>
</div>
</div>

<div class="grid-4 mb-24">
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(79,125,248,0.12);color:var(--accent-blue)"><i class="fas fa-indian-rupee-sign"></i></div></div><div class="stat-card-value" id="eodRevenue">0</div><div class="stat-card-label">Today's Revenue</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(155,109,255,0.12);color:var(--accent-purple)"><i class="fas fa-receipt"></i></div></div><div class="stat-card-value" id="eodBills">0</div><div class="stat-card-label">Bills Generated</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(52,211,153,0.12);color:var(--accent-green)"><i class="fas fa-coins"></i></div></div><div class="stat-card-value" id="eodAvgBill">0</div><div class="stat-card-label">Avg Bill Value</div></div>
  <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(245,158,11,0.12);color:var(--accent-orange)"><i class="fas fa-clock"></i></div></div><div class="stat-card-value" id="eodPeakHour"></div><div class="stat-card-label">Peak Hour</div></div>
</div>

<div class="grid-2 mb-24">
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-chart-area" style="color:var(--accent-blue)"></i> Hourly Sales Distribution</div>
    <div class="chart-container"><canvas id="eodHourlyChart" height="220"></canvas></div>
  </div>
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-trophy" style="color:var(--accent-orange)"></i> Top Selling Items Today</div>
    <div id="eodTopItems" class="flex flex-col gap-8"></div>
  </div>
</div>

<div class="grid-2 mb-24">
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-triangle-exclamation" style="color:var(--accent-red)"></i> Low Stock After Today</div>
    <div id="eodLowStock" class="flex flex-col gap-8"></div>
  </div>
  <div class="glass-card">
    <div class="font-bold mb-16"><i class="fas fa-chart-pie" style="color:var(--accent-purple)"></i> Category Breakdown</div>
    <div class="chart-container"><canvas id="eodCategoryChart" height="220"></canvas></div>
  </div>
</div>

<div class="glass-card" style="background:linear-gradient(135deg,rgba(79,125,248,0.05),rgba(155,109,255,0.05));border-color:rgba(79,125,248,0.15)">
  <div class="flex items-center justify-between mb-16">
    <span class="font-bold"><i class="fas fa-clipboard-check" style="color:var(--accent-green)"></i> Day Closing Checklist</span>
  </div>
  <div class="grid-3" id="eodChecklist">
    <div class="flex items-center gap-12" style="padding:14px;background:var(--bg-glass);border-radius:var(--radius-md)">
      <div class="toggle active" onclick="this.classList.toggle('active')"></div>
      <div><div class="text-sm font-bold">Review all bills</div><div class="text-xs text-muted">Check for any corrections needed</div></div>
    </div>
    <div class="flex items-center gap-12" style="padding:14px;background:var(--bg-glass);border-radius:var(--radius-md)">
      <div class="toggle" onclick="this.classList.toggle('active')"></div>
      <div><div class="text-sm font-bold">Update low stock</div><div class="text-xs text-muted">Reorder items running low</div></div>
    </div>
    <div class="flex items-center gap-12" style="padding:14px;background:var(--bg-glass);border-radius:var(--radius-md)">
      <div class="toggle" onclick="this.classList.toggle('active')"></div>
      <div><div class="text-sm font-bold">Cash reconciliation</div><div class="text-xs text-muted">Match cash drawer with system</div></div>
    </div>
  </div>
</div>
</div>

  `);

  // ========== EOD RENDER LOGIC ==========
  let eodHourlyChartInst = null, eodCatChartInst = null;
  window.renderEOD = function() {
    const day = DataEngine.getDaySummary();
    document.getElementById('eodRevenue').textContent = `${day.totalRevenue.toLocaleString()}`;
    document.getElementById('eodBills').textContent = day.totalTransactions;
    document.getElementById('eodAvgBill').textContent = day.totalTransactions > 0
      ? `${Math.round(day.totalRevenue / day.totalTransactions)}`
      : '0';
    document.getElementById('eodPeakHour').textContent = day.peakHour !== null ? `${day.peakHour}:00` : '';

    // Top items
    const topItems = day.topItems || [];
    document.getElementById('eodTopItems').innerHTML = topItems.length > 0
      ? topItems.map((item, i) => `
        <div class="flex items-center justify-between" style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-md)">
          <div class="flex items-center gap-12"><span class="font-bold" style="color:var(--accent-blue);width:24px">#${i + 1}</span><div class="text-sm font-bold">${item.name}</div></div>
          <span class="badge badge-info">${item.qty} sold</span>
        </div>
      `).join('')
      : '<div class="text-sm text-muted">No transactions today yet</div>';

    // Low stock
    const lowStock = DataEngine.getLowStock(10);
    document.getElementById('eodLowStock').innerHTML = lowStock.length > 0
      ? lowStock.slice(0, 8).map(item => `
        <div class="flex items-center justify-between" style="padding:10px;background:rgba(244,63,94,0.05);border-radius:var(--radius-md);border-left:3px solid var(--accent-${item.qty <= 3 ? 'red' : 'orange'})">
          <div><div class="text-sm font-bold">${item.name}</div><div class="text-xs text-muted">${item.qty} units remaining</div></div>
          <span class="badge ${item.qty <= 3 ? 'badge-danger' : 'badge-warning'}">${item.qty <= 3 ? 'Critical' : 'Low'}</span>
        </div>
      `).join('')
      : '<div class="text-sm text-muted" style="padding:20px;text-align:center">All items are well-stocked!</div>';

    // Hourly chart
    const hourLabels = Array.from({ length: 14 }, (_, i) => `${i + 7}:00`);
    const hourData = hourLabels.map((_, i) => {
      const h = i + 7;
      return day.hourCounts[h] || 0;
    });
    const hCtx = document.getElementById('eodHourlyChart');
    if (hCtx) {
      if (eodHourlyChartInst) eodHourlyChartInst.destroy();
      eodHourlyChartInst = new Chart(hCtx, {
        type: 'line',
        data: {
          labels: hourLabels,
          datasets: [{
            data: hourData,
            borderColor: '#4f7df8',
            backgroundColor: (ctx) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
              g.addColorStop(0, 'rgba(79,125,248,0.25)');
              g.addColorStop(1, 'rgba(79,125,248,0)');
              return g;
            },
            fill: true, tension: 0.4, borderWidth: 2.5,
            pointRadius: 4, pointBackgroundColor: '#4f7df8', pointBorderColor: '#0a0a0f', pointBorderWidth: 2
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false }, ticks: { color: '#55556a', maxRotation: 45 } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#55556a' } } } }
      });
    }

    // Category chart
    const txns = DataEngine.getTodayTransactions();
    const catCounts = {};
    txns.forEach(t => t.items.forEach(item => {
      const inv = DataEngine.getItem(item.name);
      const cat = inv ? inv.category : 'Other';
      catCounts[cat] = (catCounts[cat] || 0) + item.qty;
    }));
    const catLabels = Object.keys(catCounts);
    const catData = Object.values(catCounts);
    const catColors = ['#4f7df8','#9b6dff','#36d6e7','#34d399','#f59e0b','#ec4899','#f43f5e','#6366f1'];
    const cCtx = document.getElementById('eodCategoryChart');
    if (cCtx && catLabels.length > 0) {
      if (eodCatChartInst) eodCatChartInst.destroy();
      eodCatChartInst = new Chart(cCtx, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{ data: catData, backgroundColor: catColors.slice(0, catLabels.length), borderWidth: 0, spacing: 3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
          plugins: { legend: { position: 'right', labels: { color: '#8a8a9a', font: { family: 'Inter', size: 12 }, padding: 14, usePointStyle: true, pointStyleWidth: 10 } } }
        }
      });
    }
  };

  window.shareEODWhatsApp = function() {
    const day = DataEngine.getDaySummary();
    let msg = `*Day Summary - Rajesh General Store*\n${new Date().toLocaleDateString()}\n\n`;
    msg += `Revenue: ${day.totalRevenue.toLocaleString()}\n`;
    msg += `Bills: ${day.totalTransactions}\n`;
    msg += ` Peak Hour: ${day.peakHour !== null ? day.peakHour + ':00' : 'N/A'}\n\n`;
    if (day.topItems.length > 0) {
      msg += `*Top Items:*\n`;
      day.topItems.slice(0, 5).forEach((item, i) => { msg += `${i + 1}. ${item.name}  ${item.qty} sold\n`; });
    }
    const lowStock = DataEngine.getLowStock(10);
    if (lowStock.length > 0) {
      msg += `\n*Low Stock:*\n`;
      lowStock.slice(0, 5).forEach(item => { msg += ` ${item.name}  ${item.qty} left\n`; });
    }
    msg += `\nPowered by BhashaBill`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Auto-run on load
  setTimeout(() => { if (typeof refreshInsights === 'function') refreshInsights(); }, 500);
  setTimeout(() => { if (typeof runMiningEngine === 'function') runMiningEngine(); }, 600);

})();

