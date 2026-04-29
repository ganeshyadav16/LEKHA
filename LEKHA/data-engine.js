// ========== DATA ENGINE — LocalCart Voice Assistant ==========
// Manages: Inventory, Billing, Transactions, Apriori, Price Memory, localStorage

const DataEngine = (() => {
  // ========== DEFAULT INVENTORY ==========
  const DEFAULT_INVENTORY = [
    { id: 1, name: 'Basmati Rice', nameTE: 'బాస్మతి బియ్యం', unit: 'kg', price: 77, qty: 142, category: 'Grains', expiry: '2026-08' },
    { id: 2, name: 'Toor Dal', nameTE: 'కందిపప్పు', unit: 'kg', price: 140, qty: 80, category: 'Grains', expiry: '2026-12' },
    { id: 3, name: 'Fortune Oil', nameTE: 'ఫార్చ్యూన్ ఆయిల్', unit: 'L', price: 210, qty: 56, category: 'Cooking', expiry: '2026-12' },
    { id: 4, name: 'Amul Milk', nameTE: 'అమూల్ పాలు', unit: 'pkt', price: 28, qty: 87, category: 'Dairy', expiry: '2026-04' },
    { id: 5, name: 'Amul Butter', nameTE: 'అమూల్ వెన్న', unit: 'pkt', price: 270, qty: 3, category: 'Dairy', expiry: '2026-05' },
    { id: 6, name: 'Sugar', nameTE: 'చక్కెర', unit: 'kg', price: 45, qty: 120, category: 'Grains', expiry: '2027-01' },
    { id: 7, name: 'Surf Excel', nameTE: 'సర్ఫ్ ఎక్సెల్', unit: 'kg', price: 199, qty: 34, category: 'Cleaning', expiry: null },
    { id: 8, name: 'Bread', nameTE: 'బ్రెడ్', unit: 'pkt', price: 45, qty: 25, category: 'Bakery', expiry: '2026-04' },
    { id: 9, name: 'Dairy Milk', nameTE: 'డైరీ మిల్క్', unit: 'pcs', price: 40, qty: 5, category: 'Snacks', expiry: '2026-10' },
    { id: 10, name: 'Maggi', nameTE: 'మ్యాగీ', unit: 'pkt', price: 14, qty: 200, category: 'Snacks', expiry: '2026-09' },
    { id: 11, name: 'Atta', nameTE: 'గోధుమపిండి', unit: 'kg', price: 55, qty: 90, category: 'Grains', expiry: '2026-11' },
    { id: 12, name: 'Tea Powder', nameTE: 'టీ పొడి', unit: 'pkt', price: 180, qty: 20, category: 'Beverages', expiry: '2027-03' },
    { id: 13, name: 'Salt', nameTE: 'ఉప్పు', unit: 'kg', price: 20, qty: 150, category: 'Grains', expiry: null },
    { id: 14, name: 'Mustard Oil', nameTE: 'ఆవాల నూనె', unit: 'L', price: 190, qty: 30, category: 'Cooking', expiry: '2026-12' },
    { id: 15, name: 'Curd', nameTE: 'పెరుగు', unit: 'pkt', price: 35, qty: 45, category: 'Dairy', expiry: '2026-04' },
    { id: 16, name: 'Onion', nameTE: 'ఉల్లిపాయ', unit: 'kg', price: 35, qty: 100, category: 'Vegetables', expiry: null },
    { id: 17, name: 'Potato', nameTE: 'బంగాళాదుంప', unit: 'kg', price: 30, qty: 120, category: 'Vegetables', expiry: null },
    { id: 18, name: 'Tomato', nameTE: 'టమాటో', unit: 'kg', price: 40, qty: 80, category: 'Vegetables', expiry: null },
    { id: 19, name: 'Coconut Oil', nameTE: 'కొబ్బరి నూనె', unit: 'L', price: 220, qty: 18, category: 'Cooking', expiry: '2027-02' },
    { id: 20, name: 'Biscuit', nameTE: 'బిస్కెట్', unit: 'pkt', price: 30, qty: 60, category: 'Snacks', expiry: '2026-08' },
    { id: 21, name: 'Soap', nameTE: 'సబ్బు', unit: 'pcs', price: 45, qty: 40, category: 'Cleaning', expiry: null },
    { id: 22, name: 'Shampoo', nameTE: 'షాంపూ', unit: 'pcs', price: 5, qty: 100, category: 'Cleaning', expiry: null },
    { id: 23, name: 'Chilli Powder', nameTE: 'మిరపకాయల పొడి', unit: 'pkt', price: 60, qty: 35, category: 'Spices', expiry: '2026-12' },
    { id: 24, name: 'Turmeric', nameTE: 'పసుపు', unit: 'pkt', price: 40, qty: 50, category: 'Spices', expiry: '2027-01' },
    { id: 25, name: 'Eggs', nameTE: 'గుడ్లు', unit: 'pcs', price: 7, qty: 200, category: 'Dairy', expiry: null },
    { id: 26, name: 'Coke', nameTE: 'కోక్', unit: 'pcs', price: 40, qty: 120, category: 'Beverages', expiry: '2026-12' },
  ];

  const VOICE_ESSENTIAL_ITEMS = [
    { name: 'Maggi', nameTE: 'మ్యాగీ', unit: 'pkt', price: 14, qty: 120, category: 'Snacks', expiry: '2026-09' },
    { name: 'Coke', nameTE: 'కోక్', unit: 'pcs', price: 40, qty: 120, category: 'Beverages', expiry: '2026-12' }
  ];

  // ========== STORAGE HELPERS ==========
  function load(key, fallback) {
    try { const d = localStorage.getItem('lc_' + key); return d ? JSON.parse(d) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, data) {
    try { localStorage.setItem('lc_' + key, JSON.stringify(data)); } catch (e) {}
  }

  // ========== STATE ==========
  let inventory = load('inventory', [...DEFAULT_INVENTORY]);
  let transactions = load('transactions', generateSampleTransactions());
  let priceMemory = load('priceMemory', {});
  let unavailableLog = load('unavailableLog', []);
  let currentBill = { items: [], discount: 0, discountType: 'percent', customerName: '' };
  let undoStack = [];

  ensureVoiceEssentialInventory();

  // ========== GENERATE SAMPLE TRANSACTIONS ==========
  function generateSampleTransactions() {
    const txns = [];
    const items = DEFAULT_INVENTORY;
    const now = Date.now();
    // Common shopping patterns (indices into DEFAULT_INVENTORY)
    const BUNDLES = [
      [0, 1, 2],       // Rice + Dal + Oil
      [3, 7, 4],       // Milk + Bread + Butter
      [15, 16, 17],    // Onion + Potato + Tomato
      [0, 5, 10],      // Rice + Sugar + Atta
      [9, 19],          // Maggi + Biscuit
      [6, 20, 21],     // Surf Excel + Soap + Shampoo
      [3, 14, 24],     // Milk + Curd + Eggs
      [22, 23, 2],     // Chilli + Turmeric + Oil
      [11, 5],          // Tea + Sugar
      [15, 17, 22],    // Onion + Tomato + Chilli
    ];
    for (let d = 0; d < 30; d++) {
      const numTxns = 8 + Math.floor(Math.random() * 12);
      for (let t = 0; t < numTxns; t++) {
        const hour = 7 + Math.floor(Math.random() * 14);
        const billItems = [];
        const used = new Set();
        // 60% chance: start from a known bundle
        if (Math.random() < 0.6) {
          const bundle = BUNDLES[Math.floor(Math.random() * BUNDLES.length)];
          bundle.forEach(idx => {
            if (!used.has(idx)) {
              used.add(idx);
              const item = items[idx];
              const qty = 1 + Math.floor(Math.random() * 3);
              billItems.push({ id: item.id, name: item.name, price: item.price, qty, unit: item.unit });
            }
          });
        }
        // Add 1-3 random items
        const extra = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < extra; i++) {
          let idx;
          do { idx = Math.floor(Math.random() * items.length); } while (used.has(idx));
          used.add(idx);
          const item = items[idx];
          const qty = 1 + Math.floor(Math.random() * 3);
          billItems.push({ id: item.id, name: item.name, price: item.price, qty, unit: item.unit });
        }
        const total = billItems.reduce((s, i) => s + i.price * i.qty, 0);
        txns.push({
          id: `TXN-${String(txns.length + 1).padStart(4, '0')}`,
          date: new Date(now - d * 86400000 + hour * 3600000).toISOString(),
          hour,
          items: billItems,
          total,
          discount: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 5 : 0
        });
      }
    }
    return txns;
  }

  // ========== INVENTORY METHODS ==========
  function ensureVoiceEssentialInventory() {
    let changed = false;
    const normalizeName = (v) => String(v || '').toLowerCase().trim();

    VOICE_ESSENTIAL_ITEMS.forEach((required) => {
      const exists = inventory.some((item) => normalizeName(item.name) === normalizeName(required.name));
      if (exists) return;

      const nextId = inventory.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
      inventory.push({ id: nextId, ...required });
      changed = true;
    });

    if (changed) save('inventory', inventory);
  }

  function getInventory() { return inventory; }
  function getItem(nameOrId) {
    if (typeof nameOrId === 'number') return inventory.find(i => i.id === nameOrId);
    const q = String(nameOrId || '').toLowerCase().trim();
    if (!q) return null;

    // 1. Exact name match (highest priority)
    const exact = inventory.find(i => i.name.toLowerCase() === q);
    if (exact) return exact;

    // 2. Exact Telugu name match
    const teExact = inventory.find(i => i.nameTE && i.nameTE.trim() === nameOrId.trim());
    if (teExact) return teExact;

    // 3. Telugu name contains search
    const tePartial = inventory.find(i => i.nameTE && i.nameTE.includes(nameOrId));
    if (tePartial) return tePartial;

    // 4. Name starts with query (e.g. "sugar" matches "Sugar" but not "Brown Sugar")
    const startsWith = inventory.find(i => i.name.toLowerCase().startsWith(q));
    if (startsWith) return startsWith;

    // 5. Query starts with name (e.g. "basmati rice 5kg" matches "Basmati Rice")
    const nameInQuery = inventory.find(i => q.startsWith(i.name.toLowerCase()));
    if (nameInQuery) return nameInQuery;

    // 6. Partial match — but score by specificity
    const partials = inventory.filter(i =>
      i.name.toLowerCase().includes(q) || q.includes(i.name.toLowerCase())
    );
    if (partials.length === 1) return partials[0];
    if (partials.length > 1) {
      // Return the one with the closest name length to the query
      partials.sort((a, b) =>
        Math.abs(a.name.length - q.length) - Math.abs(b.name.length - q.length)
      );
      return partials[0];
    }

    return null;
  }
  function updateStock(itemId, newQty) {
    const item = inventory.find(i => i.id === itemId);
    if (item) { item.qty = Math.max(0, newQty); save('inventory', inventory); }
    return item;
  }
  function getLowStock(threshold = 10) {
    return inventory.filter(i => i.qty <= threshold);
  }
  function addNewItem(data) {
    const id = Math.max(...inventory.map(i => i.id)) + 1;
    const item = { id, ...data };
    inventory.push(item);
    save('inventory', inventory);
    return item;
  }

  // ========== PRICE MEMORY ==========
  function learnPrice(itemName, price) {
    priceMemory[itemName.toLowerCase()] = price;
    save('priceMemory', priceMemory);
  }
  function getLearnedPrice(itemName) {
    return priceMemory[itemName.toLowerCase()] || null;
  }

  // ========== BILLING ==========
  function getBill() { return currentBill; }
  function addToBill(itemName, qty, priceOverride) {
    const item = getItem(itemName);
    let price = priceOverride || (item ? item.price : getLearnedPrice(itemName));
    if (!price) return { success: false, reason: 'price_unknown', item: itemName };
    if (!item && priceOverride) learnPrice(itemName, priceOverride);

    // Check stock
    if (item && item.qty < qty) {
      return { success: false, reason: 'low_stock', available: item.qty, item: item.name };
    }

    // Save undo state
    undoStack.push(JSON.parse(JSON.stringify(currentBill)));

    const existing = currentBill.items.find(i => i.name.toLowerCase() === (item ? item.name.toLowerCase() : itemName.toLowerCase()));
    if (existing) {
      existing.qty += qty;
      existing.subtotal = existing.qty * existing.price;
    } else {
      currentBill.items.push({
        id: item ? item.id : null,
        name: item ? item.name : itemName,
        nameTE: item ? item.nameTE : '',
        price,
        qty,
        unit: item ? item.unit : 'pcs',
        subtotal: price * qty
      });
    }

    return { success: true, item: item ? item.name : itemName, qty, price, total: getBillTotal() };
  }

  function removeFromBill(itemName) {
    undoStack.push(JSON.parse(JSON.stringify(currentBill)));
    const idx = currentBill.items.findIndex(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
    if (idx >= 0) {
      const removed = currentBill.items.splice(idx, 1)[0];
      return { success: true, item: removed.name };
    }
    return { success: false, reason: 'not_found' };
  }

  function setBillDiscount(value, type = 'percent') {
    undoStack.push(JSON.parse(JSON.stringify(currentBill)));
    currentBill.discount = value;
    currentBill.discountType = type;
    return { success: true, discount: value, type, total: getBillTotal() };
  }

  function setItemDiscount(itemName, value, type = 'percent') {
    const item = currentBill.items.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
    if (item) {
      undoStack.push(JSON.parse(JSON.stringify(currentBill)));
      item.itemDiscount = value;
      item.itemDiscountType = type;
      item.subtotal = item.price * item.qty;
      if (type === 'percent') item.subtotal -= item.subtotal * (value / 100);
      else item.subtotal -= value;
      return { success: true, item: item.name, total: getBillTotal() };
    }
    return { success: false, reason: 'not_found' };
  }

  function getBillSubtotal() {
    return currentBill.items.reduce((s, i) => s + (i.subtotal || i.price * i.qty), 0);
  }

  function getBillTotal() {
    let sub = getBillSubtotal();
    if (currentBill.discount > 0) {
      if (currentBill.discountType === 'percent') sub -= sub * (currentBill.discount / 100);
      else sub -= currentBill.discount;
    }
    return Math.max(0, Math.round(sub));
  }

  function undoBill() {
    if (undoStack.length > 0) {
      currentBill = undoStack.pop();
      return { success: true, total: getBillTotal() };
    }
    return { success: false, reason: 'nothing_to_undo' };
  }

  function clearBill() {
    undoStack.push(JSON.parse(JSON.stringify(currentBill)));
    currentBill = { items: [], discount: 0, discountType: 'percent', customerName: '' };
    return { success: true };
  }

  function completeBill() {
    if (currentBill.items.length === 0) return { success: false, reason: 'empty_bill' };

    // Deduct stock
    currentBill.items.forEach(bi => {
      if (bi.id) {
        const inv = inventory.find(i => i.id === bi.id);
        if (inv) inv.qty = Math.max(0, inv.qty - bi.qty);
      }
    });
    save('inventory', inventory);

    const txn = {
      id: `TXN-${String(transactions.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString(),
      hour: new Date().getHours(),
      items: [...currentBill.items],
      subtotal: getBillSubtotal(),
      discount: currentBill.discount,
      discountType: currentBill.discountType,
      total: getBillTotal(),
      customerName: currentBill.customerName
    };
    transactions.push(txn);
    save('transactions', transactions);

    // Check low stock alerts
    const lowStockAlerts = [];
    currentBill.items.forEach(bi => {
      if (bi.id) {
        const inv = inventory.find(i => i.id === bi.id);
        if (inv && inv.qty <= 10) lowStockAlerts.push(inv);
      }
    });

    currentBill = { items: [], discount: 0, discountType: 'percent', customerName: '' };
    undoStack = [];

    return { success: true, txn, lowStockAlerts };
  }

  // ========== UNAVAILABLE LOG ==========
  function logUnavailable(itemName) {
    unavailableLog.push({ item: itemName, date: new Date().toISOString() });
    save('unavailableLog', unavailableLog);
  }
  function getUnavailableItems() {
    const counts = {};
    unavailableLog.forEach(l => {
      const k = l.item.toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([item, count]) => ({ item, count }));
  }

  // ========== ANALYTICS ==========
  function getTodayTransactions() {
    const today = new Date().toDateString();
    return transactions.filter(t => new Date(t.date).toDateString() === today);
  }

  function getDaySummary(daysAgo = 0) {
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    const targetStr = target.toDateString();
    const dayTxns = transactions.filter(t => new Date(t.date).toDateString() === targetStr);

    const totalRevenue = dayTxns.reduce((s, t) => s + t.total, 0);
    const totalTransactions = dayTxns.length;

    // Top items
    const itemCounts = {};
    dayTxns.forEach(t => t.items.forEach(i => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
    }));
    const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    // Peak hours
    const hourCounts = {};
    dayTxns.forEach(t => { hourCounts[t.hour] = (hourCounts[t.hour] || 0) + 1; });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    return { totalRevenue, totalTransactions, topItems, peakHour: peakHour ? +peakHour[0] : null, hourCounts };
  }

  function getWeeklySummary() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const s = getDaySummary(i);
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), ...s });
    }
    return days;
  }

  function getPeakHours() {
    const hourCounts = {};
    transactions.forEach(t => { hourCounts[t.hour] = (hourCounts[t.hour] || 0) + 1; });
    return Object.entries(hourCounts).sort((a, b) => b[1] - a[1]).map(([h, c]) => ({ hour: +h, count: c }));
  }

  function getTopSellingItems(days = 30) {
    const cutoff = Date.now() - days * 86400000;
    const recent = transactions.filter(t => new Date(t.date).getTime() >= cutoff);
    const counts = {};
    recent.forEach(t => t.items.forEach(i => {
      if (!counts[i.name]) counts[i.name] = { name: i.name, qty: 0, revenue: 0 };
      counts[i.name].qty += i.qty;
      counts[i.name].revenue += i.price * i.qty;
    }));
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  // ========== APRIORI ALGORITHM ==========
  function runApriori(minSupport = 0.1, minConfidence = 0.5) {
    const txnItems = transactions.map(t => t.items.map(i => i.name));
    const totalTxns = txnItems.length;
    if (totalTxns < 5) return { frequentSets: [], rules: [] };

    // Count single items
    const itemCounts = {};
    txnItems.forEach(items => {
      const unique = [...new Set(items)];
      unique.forEach(item => { itemCounts[item] = (itemCounts[item] || 0) + 1; });
    });

    // Filter by min support
    const frequentItems = Object.entries(itemCounts)
      .filter(([, count]) => count / totalTxns >= minSupport)
      .map(([item]) => item);

    // Count pairs
    const pairCounts = {};
    txnItems.forEach(items => {
      const unique = [...new Set(items)].filter(i => frequentItems.includes(i));
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          const key = [unique[i], unique[j]].sort().join('||');
          pairCounts[key] = (pairCounts[key] || 0) + 1;
        }
      }
    });

    // Frequent pairs
    const frequentPairs = Object.entries(pairCounts)
      .filter(([, count]) => count / totalTxns >= minSupport)
      .map(([pair, count]) => ({
        items: pair.split('||'),
        support: (count / totalTxns * 100).toFixed(1),
        count
      }))
      .sort((a, b) => b.count - a.count);

    // Count triples
    const tripleCounts = {};
    txnItems.forEach(items => {
      const unique = [...new Set(items)].filter(i => frequentItems.includes(i));
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          for (let k = j + 1; k < unique.length; k++) {
            const key = [unique[i], unique[j], unique[k]].sort().join('||');
            tripleCounts[key] = (tripleCounts[key] || 0) + 1;
          }
        }
      }
    });

    const frequentTriples = Object.entries(tripleCounts)
      .filter(([, count]) => count / totalTxns >= minSupport * 0.7)
      .map(([triple, count]) => ({
        items: triple.split('||'),
        support: (count / totalTxns * 100).toFixed(1),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Association Rules (from pairs)
    const rules = [];
    frequentPairs.forEach(pair => {
      const [a, b] = pair.items;
      const confAB = pair.count / itemCounts[a];
      const confBA = pair.count / itemCounts[b];
      if (confAB >= minConfidence) rules.push({ if: a, then: b, confidence: (confAB * 100).toFixed(0), support: pair.support });
      if (confBA >= minConfidence) rules.push({ if: b, then: a, confidence: (confBA * 100).toFixed(0), support: pair.support });
    });
    rules.sort((a, b) => b.confidence - a.confidence);

    return {
      frequentSets: [...frequentPairs.slice(0, 15), ...frequentTriples.slice(0, 5)],
      rules: rules.slice(0, 20)
    };
  }

  function getBundleRecommendations() {
    const { rules } = runApriori(0.08, 0.3);
    return rules.slice(0, 8).map(r => ({
      trigger: r.if,
      suggest: r.then,
      confidence: r.confidence,
      message: `${r.if} కొన్నవాళ్ళు ${r.confidence}% ${r.then} కూడా కొంటారు`
    }));
  }

  function getRestockSuggestions() {
    const topSelling = getTopSellingItems(7);
    const low = getLowStock(15);
    return low.map(item => {
      const selling = topSelling.find(t => t.name === item.name);
      const dailyAvg = selling ? Math.ceil(selling.qty / 7) : 1;
      const daysLeft = item.qty > 0 ? Math.floor(item.qty / dailyAvg) : 0;
      return { ...item, dailyAvg, daysLeft, urgency: daysLeft <= 2 ? 'critical' : daysLeft <= 5 ? 'warning' : 'normal' };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }

  // ========== PUBLIC API ==========
  return {
    getInventory, getItem, updateStock, getLowStock, addNewItem, addProduct: addNewItem,
    learnPrice, getLearnedPrice,
    getBill, addToBill, removeFromBill, setBillDiscount, setItemDiscount,
    getBillSubtotal, getBillTotal, undoBill, clearBill, completeBill,
    logUnavailable, getUnavailableItems,
    getTodayTransactions, getDaySummary, getWeeklySummary, getPeakHours, getTopSellingItems,
    runApriori, getBundleRecommendations, getRestockSuggestions,
    getTransactions: () => transactions,
    resetTransactions: () => {
      transactions = generateSampleTransactions();
      save('transactions', transactions);
      return transactions;
    }
  };
})();
