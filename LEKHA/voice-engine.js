// ========== VOICE ENGINE — BhashaBill Voice Assistant ==========
// Browser SpeechRecognition STT, multilingual NLU, and real-time command execution

const VoiceEngine = (() => {
  // ========== PERSISTED CONFIG ==========
  const STORAGE_KEYS = {
    sttProvider: 'lc_voice_stt_provider',
    backendUrl: 'lc_voice_backend_url',
    wakeWord: 'lc_voice_wake_word'
  };

  const DEFAULT_BACKEND_URL = 'http://127.0.0.1:5005';
  const COMMAND_CACHE_LIMIT = 220;
  const SILENCE_TIMEOUT = 7000;
  const STREAM_CMD_MEMORY_MS = 9000;
  const STREAM_OVERLAP_WORDS = 14;
  const RECOGNITION_RESTART_DELAY_MS = 220;

  // ========== STATE ==========
  let synth = window.speechSynthesis;
  let isListening = false;
  let isActivated = false;
  let currentLang = 'en-IN';
  let isSynthSpeaking = false;
  let recognition = null;
  let recognitionIsRunning = false;
  let recognitionShouldRun = false;
  let recognitionRestartTimer = null;
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

  let sttProvider = (localStorage.getItem(STORAGE_KEYS.sttProvider) || 'browser-speech').toLowerCase();
  let backendUrl = localStorage.getItem(STORAGE_KEYS.backendUrl) || DEFAULT_BACKEND_URL;
  let wakeWordEnabled = localStorage.getItem(STORAGE_KEYS.wakeWord) === '1';

  if (sttProvider !== 'browser-speech') {
    sttProvider = 'browser-speech';
    localStorage.setItem(STORAGE_KEYS.sttProvider, sttProvider);
  }

  const listeners = {
    transcript: new Set(),
    state: new Set(),
    command: new Set(),
    debug: new Set()
  };

  let commandHistory = [];
  let silenceTimer = null;
  const commandCache = new Map();

  let liveTranscript = '';
  let streamCommandMemory = new Map();

  const debugStats = {
    chunkCount: 0,
    lastChunkMs: 0,
    avgChunkMs: 0,
    lastChunkChars: 0,
    lastCommandMs: 0,
    lastCommandAction: 'none',
    finalTurnMs: 0,
    updatedAt: 0
  };

  // ========== VOCABULARY ==========
  const COMMANDS = {
    add: {
      en: ['add', 'put', 'include', 'insert', 'give', 'add chey', 'add cheyyi', 'vesuko', 'vesey', 'petti', 'daalo', 'dalo', 'daal do'],
      te: ['చేర్చు', 'వేయి', 'పెట్టు', 'ఇయ్యి', 'కావాలి', 'వేసుకో', 'పెట్టి', 'యాడ్ చేయి'],
      hi: ['जोड़ो', 'डालो', 'रखो', 'देना', 'लगाओ', 'दालो', 'डाल दो']
    },
    remove: {
      en: ['remove', 'delete', 'cancel', 'drop', 'teesi', 'teesey', 'hatao'],
      te: ['తీసెయ్యి', 'తీసేయ్', 'వద్దు', 'రద్దు', 'తీసి', 'తీసివేయి'],
      hi: ['हटाओ', 'निकालो', 'कैंसल', 'मत रखो', 'हटा दो']
    },
    undo: {
      en: ['undo', 'reverse', 'rollback', 'go back'],
      te: ['వెనక్కి', 'తిరిగి', 'undo'],
      hi: ['वापस', 'पीछे', 'अनडू']
    },
    total: {
      en: ['total', 'how much', 'bill amount', 'grand total'],
      te: ['మొత్తం', 'ఎంత', 'బిల్లు ఎంత'],
      hi: ['कुल', 'कितना हुआ', 'बिल कितना', 'टोटल']
    },
    discount: {
      en: ['discount', 'off', 'reduce', 'apply discount', 'apply'],
      te: ['తగ్గించు', 'తక్కువ', 'రాయితీ', 'discount'],
      hi: ['छूट', 'डिस्काउंट', 'कम करो']
    },
    bill: {
      en: ['generate bill', 'create bill', 'final bill', 'finish bill', 'complete bill'],
      te: ['బిల్లు', 'బిల్లు చేయి', 'పూర్తి'],
      hi: ['बिल बनाओ', 'फाइनल बिल', 'बिल करो', 'पूरा हो गया']
    },
    print_bill: {
      en: ['print bill', 'print receipt', 'print'],
      te: ['బిల్లు ప్రింట్', 'రశీదు ప్రింట్', 'ప్రింట్'],
      hi: ['बिल प्रिंट', 'रसीद प्रिंट', 'प्रिंट']
    },
    clear: {
      en: ['clear', 'reset', 'start over', 'new bill', 'clear bill', 'empty', 'empty bill'],
      te: ['క్లియర్', 'కొత్త బిల్లు', 'మొదలు', 'ఖాళీ చేయి', 'ఖాళీ'],
      hi: ['साफ़ करो', 'रीसेट', 'नया बिल', 'खाली करो']
    },
    stock: {
      en: ['stock', 'inventory', 'update stock', 'restock', 'check stock'],
      te: ['స్టాక్', 'సరుకు', 'స్టాక్ అప్డేట్', 'స్టాక్ ఎంత'],
      hi: ['स्टॉक', 'माल', 'सामान', 'स्टॉक अपडेट', 'स्टॉक कितना']
    },
    inventory_add: {
      en: ['add product', 'new product', 'add to inventory', 'add item to inventory', 'new item'],
      te: ['కొత్త వస్తువు', 'ఇన్వెంటరీలో చేర్చు', 'కొత్త ప్రొడక్ట్'],
      hi: ['नया प्रोडक्ट', 'इन्वेंटरी में जोड़ो', 'नया आइटम']
    },
    summary: {
      en: ['summary', 'day summary', 'report', 'today report', 'closing summary'],
      te: ['సారాంశం', 'ఈరోజు', 'రిపోర్ట్'],
      hi: ['आज का हिसाब', 'सारांश', 'रिपोर्ट', 'दिन का हिसाब']
    },
    today_sales: {
      en: ['today sales', 'sales today', 'today revenue'],
      te: ['ఈరోజు సేల్స్', 'ఈరోజు అమ్మకాలు'],
      hi: ['आज की बिक्री', 'आज की सेल्स']
    },
    top_items: {
      en: ['top items', 'best selling', 'best items', 'most sold'],
      te: ['టాప్ ఐటమ్స్', 'ఎక్కువ అమ్ముడైనవి'],
      hi: ['टॉप आइटम', 'सबसे ज्यादा बिके']
    },
    activate: {
      en: ['lekha', 'hey bhashabill', 'hey bhasha bill', 'start listening', 'wake up'],
      te: ['హే భాషాబిల్', 'భాషాబిల్', 'లేవు', 'విను'],
      hi: ['हे भाषाबिल', 'भाषा बिल', 'सुनो', 'शुरू करो']
    },
    stop: {
      en: ['stop', 'stop listening', 'sleep', 'go to sleep', 'pause'],
      te: ['ఆపు', 'ఆపేయ్', 'నిద్ర'],
      hi: ['बंद करो', 'रुको', 'सो जाओ']
    },
    confirm: {
      en: ['yes', 'yeah', 'confirm', 'proceed', 'ok', 'okay'],
      te: ['అవును', 'హా', 'సరే', 'ఊ'],
      hi: ['हाँ', 'हां', 'जी', 'ठीक है']
    },
    deny: {
      en: ['no', 'cancel', 'donot', 'dont', 'stop it'],
      te: ['వద్దు', 'లేదు', 'కాదు'],
      hi: ['नहीं', 'मत करो', 'रहने दो', 'कैंसल']
    },
    navigate: {
      en: ['go to', 'open', 'show', 'navigate', 'switch'],
      te: ['వెళ్ళు', 'ఓపెన్', 'చూపించు', 'తెరువు'],
      hi: ['जाओ', 'खोलो', 'दिखाओ', 'चलो']
    },
    share_bill: {
      en: ['share bill', 'send bill', 'whatsapp bill'],
      te: ['బిల్లు షేర్', 'బిల్లు పంపు'],
      hi: ['बिल भेजो', 'बिल शेयर करो', 'व्हाट्सऐप बिल']
    },
    start_billing: {
      en: ['start billing', 'begin billing', 'new billing'],
      te: ['బిల్లింగ్ మొదలు', 'కొత్త బిల్లింగ్'],
      hi: ['बिलिंग शुरू', 'नई बिलिंग']
    },
    close_shop: {
      en: ['close shop', 'close day', 'end day', 'shop close'],
      te: ['షాప్ క్లోజ్', 'రోజు ముగించు', 'క్లోజ్ చేయి'],
      hi: ['दुकान बंद', 'दिन बंद', 'दिन खत्म']
    }
  };

  const NAV_TARGETS = {
    dashboard: ['home', 'dashboard', 'main', 'హోమ్', 'డాష్బోర్డ్', 'होम', 'डैशबोर्ड'],
    voicebill: ['billing', 'voice billing', 'bill', 'బిల్లింగ్', 'బిల్లు', 'बिलिंग', 'बिल'],
    inventory: ['inventory', 'stock', 'items', 'సరుకు', 'స్టాక్', 'इन्वेंटरी', 'स्टॉक'],
    smartinsights: ['analytics', 'insights', 'smart insights', 'విశ్లేషణ', 'ఇన్‌సైట్స్', 'एनालिटिक्स', 'इनसाइट्स'],
    billpreview: ['bill preview', 'receipt', 'invoice', 'బిల్ ప్రివ్యూ', 'రసీదు', 'बिल प्रीव्यू', 'रसीद'],
    voicepanel: ['voice panel', 'voice center', 'commands', 'వాయిస్ ప్యానెల్', 'వాయిస్ సెట్టింగ్స్', 'वॉइस पैनल'],
    datamining: ['data mining', 'mining', 'patterns', 'డేటా మైనింగ్', 'माइनिंग'],
    eod: ['day summary', 'close summary', 'end of day', 'రోజు సారాంశం', 'आज का हिसाब'],
    admin: ['settings', 'admin', 'system settings', 'సెట్టింగ్స్', 'सेटिंग्स'],
    store: ['store', 'storefront', 'స్టోర్', 'स्टोर'],
    orders: ['orders', 'ఆర్డర్స్', 'ऑर्डर्स'],
    customers: ['customers', 'కస్టమర్స్', 'ग्राहक'],
    suppliers: ['suppliers', 'సప్లయర్స్', 'सप्लायर्स'],
    marketing: ['marketing', 'మార్కెటింగ్', 'मार्केटिंग'],
    team: ['team', 'staff', 'యూజర్లు', 'टीम'],
    platform: ['platform', 'cloud', 'ప్లాట్‌ఫామ్', 'प्लेटफॉर्म'],
    network: ['network', 'local network', 'నెట్‌వర్క్', 'नेटवर्क']
  };

  const NUM_WORDS = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, fifty: 50, hundred: 100,
    ek: 1, do: 2, teen: 3, char: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
    oka: 1, okati: 1, rendu: 2, renduu: 2, moodu: 3, mudu: 3, nalugu: 4, naalugu: 4,
    aidu: 5, aaidu: 5, aaru: 6, edu: 7, enimidi: 8, enmidi: 8, tommidi: 9, padi: 10,
    ఒక: 1, రెండు: 2, మూడు: 3, నాలుగు: 4, ఐదు: 5, ఆరు: 6, ఏడు: 7, ఎనిమిది: 8, తొమ్మిది: 9, పది: 10,
    అర: 0.5, పావు: 0.25, half: 0.5, quarter: 0.25,
    एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9, दस: 10,
    ग्यारह: 11, बारह: 12, पंद्रह: 15, बीस: 20, पच्चीस: 25, तीस: 30, पचास: 50, सौ: 100,
    आधा: 0.5, पाव: 0.25
  };

  const MULTI_WORD_NUMBERS = {
    'two hundred': 200,
    'three hundred': 300,
    'five hundred': 500,
    'दो सौ': 200,
    'तीन सौ': 300,
    'पांच सौ': 500,
    'రెండొందలు': 200,
    'మూడొందలు': 300,
    'ఐదొందలు': 500
  };

  const UNITS = [
    'kg', 'kilo', 'gram', 'grams', 'g', 'litre', 'liter', 'l', 'ml', 'packet', 'pack', 'piece', 'pcs', 'pieces',
    'కిలో', 'కేజీ', 'గ్రాము', 'లీటరు', 'ప్యాకెట్', 'పీసు',
    'किलो', 'ग्राम', 'लीटर', 'पैकेट', 'पीस'
  ];

  const PRICE_WORDS = [
    'at', 'rate', 'price', 'rupees', 'rupee', 'rs', 'inr', '@',
    'రూపాయలు', 'రూపాయి', 'రేటు', 'ధర',
    'रुपये', 'रुपया', 'रेट', 'कीमत', 'दाम'
  ];

  const NOISE_WORDS = [
    'please', 'bhai', 'anna', 'bro', 'ra', 'the', 'a', 'of', 'and', 'also', 'dena', 'de',
    'just', 'bye', 'go', 'call', 'guess', 'my', 'me', 'nd', 'then',
    'chesko', 'chesuko', 'chesey', 'chesi',
    'అన్నా', 'రా', 'భాయ్', 'కూడా', 'ఇయ్యి', 'కావాలి', 'చేసుకో', 'చేయి',
    'भाई', 'भैया', 'भी', 'और', 'ज़रा', 'कृपया', 'प्लीज', 'करो', 'करना',
    'bhayya', 'ayya', 'sir', 'madam'
  ];

  const FILLER_WORDS = [
    'bro', 'ra', 'please', 'anna', 'bhai', 'bhayya', 'ayya', 'sir', 'madam', 'zara', 'kripya', 'kindly'
  ];

  const ITEM_ALIAS_MAP = {
    // === Maggi ===
    maggie: 'maggi', maggies: 'maggi', maggiee: 'maggi', magi: 'maggi', maggy: 'maggi',
    'మగ్గీ': 'maggi', 'మ్యాగీ': 'maggi', 'మాగీ': 'maggi',
    'मैगी': 'maggi', 'मेगी': 'maggi', 'मैग्गी': 'maggi',
    // === Coke ===
    cokee: 'coke', cok: 'coke', kok: 'coke', gok: 'coke', cola: 'coke',
    cocacola: 'coke', 'coca cola': 'coke', 'coca-cola': 'coke',
    cooldrink: 'coke', 'cool drink': 'coke',
    'కోక్': 'coke', 'కోకు': 'coke',
    'कोक': 'coke', 'कोल्ड ड्रिंक': 'coke',
    // === Rice / Basmati Rice ===
    rice: 'basmati rice', ryce: 'basmati rice', chawal: 'basmati rice',
    'బియ్యం': 'basmati rice', 'బాస్మతి': 'basmati rice', 'బాస్మతి బియ్యం': 'basmati rice',
    'चावल': 'basmati rice', 'बासमती': 'basmati rice', 'बासमती चावल': 'basmati rice',
    // === Toor Dal ===
    dal: 'toor dal', daal: 'toor dal', dhal: 'toor dal', 'toor daal': 'toor dal', 'arhar dal': 'toor dal',
    'కందిపప్పు': 'toor dal', 'పప్పు': 'toor dal',
    'दाल': 'toor dal', 'तूर दाल': 'toor dal', 'अरहर दाल': 'toor dal',
    // === Fortune Oil ===
    oil: 'fortune oil', 'cooking oil': 'fortune oil', 'fortune': 'fortune oil',
    'నూనె': 'fortune oil', 'ఆయిల్': 'fortune oil', 'ఫార్చ్యూన్': 'fortune oil', 'ఫార్చ్యూన్ ఆయిల్': 'fortune oil',
    'तेल': 'fortune oil', 'रिफाइंड तेल': 'fortune oil',
    // === Amul Milk ===
    milk: 'amul milk', dudh: 'amul milk', palu: 'amul milk',
    'పాలు': 'amul milk', 'అమూల్ పాలు': 'amul milk', 'అమూల్': 'amul milk',
    'दूध': 'amul milk', 'अमूल दूध': 'amul milk',
    // === Amul Butter ===
    butter: 'amul butter', makhan: 'amul butter',
    'వెన్న': 'amul butter', 'బటర్': 'amul butter', 'అమూల్ వెన్న': 'amul butter',
    'मक्खन': 'amul butter', 'बटर': 'amul butter',
    // === Sugar ===
    suger: 'sugar', sugr: 'sugar', cheeni: 'sugar', chini: 'sugar',
    'చక్కెర': 'sugar', 'పంచదార': 'sugar',
    'चीनी': 'sugar', 'शक्कर': 'sugar',
    // === Surf Excel ===
    surf: 'surf excel', 'washing powder': 'surf excel',
    'సర్ఫ్': 'surf excel', 'సర్ఫ్ ఎక్సెల్': 'surf excel',
    'सर्फ': 'surf excel', 'सर्फ एक्सेल': 'surf excel',
    // === Bread ===
    bred: 'bread', 'pav': 'bread', 'roti bread': 'bread',
    'బ్రెడ్': 'bread', 'బ్రెడ్డు': 'bread',
    'ब्रेड': 'bread', 'पाव': 'bread',
    // === Dairy Milk (chocolate) ===
    chocolate: 'dairy milk', choclate: 'dairy milk', cadbury: 'dairy milk',
    'చాక్లెట్': 'dairy milk', 'డైరీ మిల్క్': 'dairy milk',
    'चॉकलेट': 'dairy milk', 'डेयरी मिल्क': 'dairy milk', 'कैडबरी': 'dairy milk',
    // === Atta ===
    aata: 'atta', 'wheat flour': 'atta', 'whole wheat': 'atta', gehu: 'atta',
    'గోధుమపిండి': 'atta', 'ఆటా': 'atta', 'గోధుమలు': 'atta',
    'आटा': 'atta', 'गेहूं': 'atta',
    // === Tea Powder ===
    tea: 'tea powder', chai: 'tea powder', 'tea podi': 'tea powder',
    'టీ': 'tea powder', 'టీ పొడి': 'tea powder', 'చాయ్': 'tea powder',
    'चाय': 'tea powder', 'चाय पत्ती': 'tea powder',
    // === Salt ===
    namak: 'salt', uppu: 'salt',
    'ఉప్పు': 'salt',
    'नमक': 'salt',
    // === Mustard Oil ===
    'mustard': 'mustard oil', 'sarso': 'mustard oil', 'sarson': 'mustard oil',
    'ఆవాల నూనె': 'mustard oil', 'ఆవ నూనె': 'mustard oil',
    'सरसों': 'mustard oil', 'सरसों का तेल': 'mustard oil',
    // === Curd ===
    dahi: 'curd', yogurt: 'curd', yoghurt: 'curd',
    'పెరుగు': 'curd', 'తోడుపెరుగు': 'curd',
    'दही': 'curd',
    // === Onion ===
    pyaz: 'onion', 'pyaaz': 'onion',
    'ఉల్లిపాయ': 'onion', 'ఉల్లి': 'onion',
    'प्याज': 'onion',
    // === Potato ===
    aloo: 'potato', aaloo: 'potato',
    'బంగాళాదుంప': 'potato', 'ఆలూ': 'potato', 'బంగాళ': 'potato',
    'आलू': 'potato',
    // === Tomato ===
    tamatar: 'tomato', tamato: 'tomato',
    'టమాటో': 'tomato', 'టమాట': 'tomato',
    'टमाटर': 'tomato',
    // === Coconut Oil ===
    'coconut': 'coconut oil', 'nariyal tel': 'coconut oil',
    'కొబ్బరి నూనె': 'coconut oil', 'కొబ్బరి': 'coconut oil',
    'नारियल तेल': 'coconut oil', 'नारियल': 'coconut oil',
    // === Biscuit ===
    biscut: 'biscuit', biscit: 'biscuit', biskut: 'biscuit', cookies: 'biscuit',
    'బిస్కెట్': 'biscuit', 'బిస్కిట్': 'biscuit',
    'बिस्किट': 'biscuit', 'बिस्कुट': 'biscuit',
    // === Soap ===
    sabun: 'soap',
    'సబ్బు': 'soap',
    'साबुन': 'soap',
    // === Shampoo ===
    shampu: 'shampoo',
    'షాంపూ': 'shampoo',
    'शैम्पू': 'shampoo',
    // === Chilli Powder ===
    'chilli': 'chilli powder', 'mirchi': 'chilli powder', 'chili': 'chilli powder',
    'మిరపకాయల పొడి': 'chilli powder', 'మిర్చి': 'chilli powder',
    'मिर्ची': 'chilli powder', 'लाल मिर्च': 'chilli powder',
    // === Turmeric ===
    haldi: 'turmeric', 'haldi powder': 'turmeric',
    'పసుపు': 'turmeric',
    'हल्दी': 'turmeric',
    // === Eggs ===
    egg: 'eggs', anda: 'eggs', ande: 'eggs',
    'గుడ్లు': 'eggs', 'గుడ్డు': 'eggs',
    'अंडे': 'eggs', 'अंडा': 'eggs'
  };

  // ========== UTILS ==========
  function emitTo(set, ...args) {
    if (!set || !set.size) return;
    set.forEach((handler) => {
      try {
        handler(...args);
      } catch (_err) {
        // Keep voice pipeline resilient even if a listener throws.
      }
    });
  }

  function emitState(state) {
    emitTo(listeners.state, state);
  }

  function emitTranscript(text, isInterim = false) {
    emitTo(listeners.transcript, text, isInterim);
  }

  function emitCommand(cmd, result) {
    emitTo(listeners.command, cmd, result);
  }

  function emitDebug(update = null) {
    if (update && typeof update === 'object') {
      Object.assign(debugStats, update);
    }
    debugStats.updatedAt = Date.now();
    emitTo(listeners.debug, { ...debugStats });
  }

  function resetDebugTurnMetrics() {
    emitDebug({
      chunkCount: 0,
      lastChunkMs: 0,
      avgChunkMs: 0,
      lastChunkChars: 0,
      finalTurnMs: 0
    });
  }

  function normalizedBackendUrl() {
    return (backendUrl || DEFAULT_BACKEND_URL).replace(/\/$/, '');
  }

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[.,/#!$%^&*;:{}=\-_`~()"'?<>\\|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeRegex(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function stripFillerWords(text) {
    let output = ` ${normalizeText(text)} `;
    FILLER_WORDS.forEach((word) => {
      const key = normalizeText(word);
      if (!key) return;
      const pattern = new RegExp(`\\b${escapeRegex(key)}\\b`, 'gi');
      output = output.replace(pattern, ' ');
    });
    return output.replace(/\s+/g, ' ').trim();
  }

  function applyItemAliases(text) {
    let output = ` ${normalizeText(text)} `;
    const aliasEntries = Object.entries(ITEM_ALIAS_MAP).sort((a, b) => b[0].length - a[0].length);
    aliasEntries.forEach(([from, to]) => {
      const key = normalizeText(from);
      if (!key) return;
      // \b doesn't work with non-Latin scripts (Telugu/Hindi/Devanagari)
      const isNonLatin = /[^\u0000-\u007F]/.test(key);
      if (isNonLatin || key.includes(' ')) {
        // For non-Latin or multi-word: simple string replacement with space boundaries
        const search = ` ${key} `;
        while (output.includes(search)) {
          output = output.replace(search, ` ${to} `);
        }
        // Also try without trailing space (end of string after trim)
        if (output.trimEnd().endsWith(key)) {
          output = output.replace(new RegExp(escapeRegex(key) + '\\s*$'), ` ${to} `);
        }
      } else {
        const pattern = new RegExp(`\\b${escapeRegex(key)}\\b`, 'gi');
        output = output.replace(pattern, ` ${to} `);
      }
    });
    return output.replace(/\s+/g, ' ').trim();
  }

  function tokenize(text) {
    return normalizeText(text).split(' ').filter(Boolean);
  }

  function splitCommandSegments(text) {
    const normalized = stripFillerWords(text);
    if (!normalized) return [];

    // Keep correction utterances intact so "no, 3 maggi" maps to
    // correct_add instead of being split into separate fragments.
    if (/^(?:no|nope|nahi|లేదు|కాదు|नहीं)\b/i.test(normalized)) {
      return [normalized];
    }

    return normalized
      .split(/(?:\band then\b|\bthen\b|\band\b|\bnd\b|\bplus\b|\baur\b|\bమరియు\b|\bతర్వాత\b|[,;])/gi)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function splitCompositeAddSegment(segment) {
    const normalized = stripFillerWords(segment);
    if (!normalized) return [];

    // Keep qty+price utterances as a single command (e.g., "2 maggi at 14").
    if (/\b(at|@|rs|rupee|rupees|ధర|రేటు|कीमत|दाम)\b/i.test(normalized)) {
      return [normalized];
    }

    const qtyPattern = /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|paanch|oka|okati|rendu|moodu|nalugu|aidu|aaru|edu|enimidi|tommidi|padi|ఒక|రెండు|మూడు|నాలుగు|ఐదు|ఆరు|ఏడు|ఎనిమిది|తొమ్మిది|పది|एक|दो|तीन|चार|पांच|छह|सात|आठ|नौ|दस)\b/gi;
    const markers = [];
    let match;
    while ((match = qtyPattern.exec(normalized)) !== null) {
      markers.push(match.index);
    }

    if (markers.length < 2) return [normalized];

    const segments = [];
    for (let i = 0; i < markers.length; i++) {
      const start = markers[i];
      const end = i + 1 < markers.length ? markers[i + 1] : normalized.length;
      const part = normalized.slice(start, end).trim();
      if (part) segments.push(part);
    }

    return segments.length ? segments : [normalized];
  }

  function cleanupStreamCommandMemory() {
    const now = Date.now();
    for (const [key, timestamp] of streamCommandMemory.entries()) {
      if (now - timestamp > STREAM_CMD_MEMORY_MS) {
        streamCommandMemory.delete(key);
      }
    }
  }

  function commandFingerprint(cmd) {
    return [
      cmd.action || '',
      cmd.item || '',
      cmd.qty || '',
      cmd.price || '',
      cmd.value || '',
      cmd.type || '',
      cmd.screen || ''
    ].join('|');
  }

  function isStreamActionable(cmd) {
    if (!cmd || cmd.action === 'unknown') return false;
    if (['confirm', 'deny', 'activate', 'stop'].includes(cmd.action)) return false;
    if (cmd.action === 'add' && !cmd.item) return false;
    if (cmd.action === 'remove' && !cmd.item) return false;
    if (cmd.action === 'discount' && (!cmd.value || cmd.value <= 0)) return false;
    if (cmd.action === 'stock' && (!cmd.item || !cmd.qty)) return false;
    if (cmd.action === 'stock_check' && !cmd.item) return false;
    return true;
  }

  function executeStreamingTranscript(text, isFinal = false) {
    const segments = splitCommandSegments(text).flatMap((segment) => splitCompositeAddSegment(segment));
    if (!segments.length) return;

    cleanupStreamCommandMemory();
    const now = Date.now();
    const controlActions = new Set(['confirm', 'deny', 'activate', 'stop']);

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const cmd = parseCommand(segment);
      const isControl = controlActions.has(cmd.action);

      if (!isFinal && isLast && segment.split(' ').length < 2 && !isControl) return;
      if (!isControl && !isStreamActionable(cmd)) return;

      const key = `${normalizeText(segment)}::${commandFingerprint(cmd)}`;
      const seenAt = streamCommandMemory.get(key);
      if (seenAt && now - seenAt < STREAM_CMD_MEMORY_MS) return;

      streamCommandMemory.set(key, now);
      processTranscript(segment);
    });
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b[i - 1] === a[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }

  function similarity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (!maxLen) return 1;
    return 1 - (levenshtein(a, b) / maxLen);
  }

  function fuzzyTokenMatch(token, keyword) {
    if (token === keyword) return true;
    if (!token || !keyword) return false;
    if (keyword.length <= 2) return false;
    const dist = levenshtein(token, keyword);
    if (keyword.length <= 4) return dist <= 1;
    if (keyword.length <= 7) return dist <= 2;
    return similarity(token, keyword) >= 0.75;
  }

  function hasKeyword(normalized, tokens, keyword) {
    const key = normalizeText(keyword);
    if (!key) return false;
    if (key.includes(' ')) {
      return normalized.includes(key);
    }
    return tokens.some((t) => fuzzyTokenMatch(t, key));
  }

  function hasKeywordStrict(normalized, tokens, keyword) {
    const key = normalizeText(keyword);
    if (!key) return false;
    if (key.includes(' ')) {
      return normalized.includes(key);
    }
    return tokens.includes(key);
  }

  function hasAnyKeyword(normalized, tokens, list) {
    return list.some((k) => hasKeyword(normalized, tokens, k));
  }

  function hasAnyKeywordStrict(normalized, tokens, list) {
    return list.some((k) => hasKeywordStrict(normalized, tokens, k));
  }

  function flattenCommandWords(cmdKey) {
    const set = COMMANDS[cmdKey] || {};
    return [...(set.en || []), ...(set.te || []), ...(set.hi || [])];
  }

  function parseNumber(text) {
    const lower = normalizeText(text);
    const digitMatch = lower.match(/\d+\.?\d*/);
    if (digitMatch) return parseFloat(digitMatch[0]);

    for (const [phrase, value] of Object.entries(MULTI_WORD_NUMBERS)) {
      if (lower.includes(phrase)) return value;
    }

    const words = lower.split(' ');
    for (const w of words) {
      if (Object.prototype.hasOwnProperty.call(NUM_WORDS, w)) return NUM_WORDS[w];
    }
    return null;
  }

  function extractAllNumbers(text) {
    const lower = normalizeText(text);
    const found = [];

    const digitMatches = lower.match(/\d+\.?\d*/g) || [];
    digitMatches.forEach((d) => found.push(parseFloat(d)));

    for (const [phrase, value] of Object.entries(MULTI_WORD_NUMBERS)) {
      if (lower.includes(phrase)) found.push(value);
    }

    lower.split(' ').forEach((token) => {
      if (Object.prototype.hasOwnProperty.call(NUM_WORDS, token)) {
        found.push(NUM_WORDS[token]);
      }
    });

    return found;
  }

  function resolveLikelyItem(rawName) {
    const cleaned = applyItemAliases(rawName);
    if (!cleaned) return null;
    if (typeof DataEngine === 'undefined') return cleaned;

    const exact = DataEngine.getItem(cleaned);
    if (exact && exact.name) return exact.name;

    // Also try finding by the raw (unaliased) input — handles Telugu/Hindi script directly
    const rawExact = DataEngine.getItem(rawName);
    if (rawExact && rawExact.name) return rawExact.name;

    if (typeof DataEngine.getInventory !== 'function') return cleaned;
    const inventory = DataEngine.getInventory() || [];
    let best = null;
    let bestScore = 0;

    for (const item of inventory) {
      const name = normalizeText(item.name || '');
      if (!name) continue;
      let score = similarity(cleaned, name);
      if (name.includes(cleaned) || cleaned.includes(name)) score = Math.max(score, 0.85);
      // Check Telugu name
      if (item.nameTE) {
        const nameTE = normalizeText(item.nameTE);
        if (nameTE.includes(normalizeText(rawName)) || normalizeText(rawName).includes(nameTE)) score = Math.max(score, 0.92);
        const teScore = similarity(normalizeText(rawName), nameTE);
        score = Math.max(score, teScore);
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    return bestScore >= 0.55 && best ? best.name : cleaned;
  }

  function extractItemName(text) {
    let clean = applyItemAliases(text);

    Object.keys(COMMANDS).forEach((k) => {
      flattenCommandWords(k).forEach((w) => {
        const key = normalizeText(w);
        if (!key) return;
        if (key.includes(' ')) {
          clean = clean.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
        } else {
          clean = clean.replace(new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'), ' ');
        }
      });
    });

    clean = clean.replace(/\d+\.?\d*/g, ' ');
    Object.keys(MULTI_WORD_NUMBERS).forEach((phrase) => {
      const key = normalizeText(phrase);
      if (!key) return;
      clean = clean.replace(new RegExp(escapeRegex(key), 'gi'), ' ');
    });
    Object.keys(NUM_WORDS).forEach((word) => {
      const key = normalizeText(word);
      if (!key) return;
      clean = clean.replace(new RegExp('\\b' + escapeRegex(key) + '\\b', 'gi'), ' ');
    });
    UNITS.forEach((u) => {
      const key = normalizeText(u);
      clean = clean.replace(new RegExp('\\b' + escapeRegex(key) + '\\b', 'gi'), ' ');
    });
    PRICE_WORDS.forEach((u) => {
      const key = normalizeText(u);
      clean = clean.replace(new RegExp('\\b' + escapeRegex(key) + '\\b', 'gi'), ' ');
    });
    NOISE_WORDS.forEach((u) => {
      const key = normalizeText(u);
      clean = clean.replace(new RegExp('\\b' + escapeRegex(key) + '\\b', 'gi'), ' ');
    });

    clean = clean.replace(/\s+/g, ' ').trim();
    return resolveLikelyItem(clean);
  }

  function detectNavigationScreen(normalized, tokens) {
    let best = null;
    let bestScore = 0;

    for (const [screen, keywords] of Object.entries(NAV_TARGETS)) {
      for (const kw of keywords) {
        const key = normalizeText(kw);
        if (!key) continue;
        if (key.includes(' ')) {
          if (normalized.includes(key)) {
            const score = key.length / 20 + 0.8;
            if (score > bestScore) {
              best = screen;
              bestScore = score;
            }
          }
          continue;
        }

        const direct = tokens.some((t) => t === key);
        if (direct) {
          if (1 > bestScore) {
            best = screen;
            bestScore = 1;
          }
          continue;
        }

        const fuzzy = tokens.some((t) => fuzzyTokenMatch(t, key));
        if (fuzzy && 0.86 > bestScore) {
          best = screen;
          bestScore = 0.86;
        }
      }
    }

    return best;
  }

  function detectAction(normalized, tokens) {
    const activateWords = flattenCommandWords('activate');
    const stopWords = flattenCommandWords('stop');
    const confirmWords = flattenCommandWords('confirm');
    const denyWords = flattenCommandWords('deny');

    if (hasAnyKeywordStrict(normalized, tokens, activateWords)) return 'activate';
    if (hasAnyKeywordStrict(normalized, tokens, confirmWords)) return 'confirm';
    if (hasAnyKeywordStrict(normalized, tokens, denyWords)) return 'deny';

    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('start_billing'))) return 'start_billing';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('close_shop'))) return 'close_shop';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('share_bill'))) return 'share_bill';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('print_bill'))) return 'print_bill';

    const navVerbs = flattenCommandWords('navigate');
    const navScreen = detectNavigationScreen(normalized, tokens);
    const hasNavVerb = navScreen && hasAnyKeyword(normalized, tokens, navVerbs);
    if (hasNavVerb) {
      return { action: 'navigate', screen: navScreen };
    }

    if (hasAnyKeywordStrict(normalized, tokens, stopWords)) return 'stop';

    // Priority prevents collisions like "undo" being interpreted as "add".
    if (hasAnyKeywordStrict(normalized, tokens, flattenCommandWords('undo'))) return 'undo';
    if (hasAnyKeywordStrict(normalized, tokens, flattenCommandWords('clear'))) return 'clear';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('discount'))) return 'discount';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('remove'))) return 'remove';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('inventory_add'))) return 'inventory_add';
    if (hasAnyKeywordStrict(normalized, tokens, flattenCommandWords('bill'))) return 'bill';
    if (hasAnyKeywordStrict(normalized, tokens, flattenCommandWords('today_sales'))) return 'today_sales';
    if (hasAnyKeywordStrict(normalized, tokens, flattenCommandWords('top_items'))) return 'top_items';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('total'))) return 'total';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('summary'))) return 'summary';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('stock'))) return 'stock';
    if (hasAnyKeyword(normalized, tokens, flattenCommandWords('add'))) return 'add';

    if (navScreen) {
      const directShortIntent = tokens.length <= 2;
      if (hasNavVerb || directShortIntent) {
        return { action: 'navigate', screen: navScreen };
      }
    }

    if (parseNumber(normalized) !== null) {
      const implicitItem = extractItemName(normalized);
      if (typeof DataEngine !== 'undefined' && implicitItem && DataEngine.getItem(implicitItem)) {
        return 'add';
      }
    }
    if (typeof DataEngine !== 'undefined' && DataEngine.getItem(normalized)) return 'add';
    if (navScreen) return { action: 'navigate', screen: navScreen };

    return 'unknown';
  }

  function cacheCommand(key, cmd) {
    if (commandCache.has(key)) commandCache.delete(key);
    commandCache.set(key, cmd);
    if (commandCache.size > COMMAND_CACHE_LIMIT) {
      const firstKey = commandCache.keys().next().value;
      commandCache.delete(firstKey);
    }
  }

  function parseCommand(text) {
    const raw = String(text || '').trim();
    const normalized = stripFillerWords(raw);
    if (!normalized) return { action: 'unknown', raw };
    const cacheKey = `${currentLang}::${normalized}`;
    if (commandCache.has(cacheKey)) {
      const hit = commandCache.get(cacheKey);
      return { ...hit, raw };
    }

    const correctionMatch = normalized.match(/^(?:no|nope|nahi|లేదు|కాదు|नहीं)\s*(?:,\s*|\s+)(.+)$/i);
    if (correctionMatch && correctionMatch[1]) {
      const corrected = parseCommand(correctionMatch[1]);
      if (corrected.action === 'add' && corrected.item) {
        const parsedCorrection = {
          action: 'correct_add',
          item: corrected.item,
          qty: corrected.qty || 1,
          quantity: corrected.qty || 1,
          price: corrected.price || null,
          raw
        };
        cacheCommand(cacheKey, { ...parsedCorrection, raw: '' });
        return parsedCorrection;
      }
    }

    const tokens = tokenize(normalized);
    const actionDetected = detectAction(normalized, tokens);
    const action = typeof actionDetected === 'string' ? actionDetected : actionDetected.action;

    let parsed;
    switch (action) {
      case 'activate':
      case 'stop':
      case 'undo':
      case 'total':
      case 'clear':
      case 'summary':
      case 'today_sales':
      case 'top_items':
      case 'bill':
      case 'print_bill':
      case 'confirm':
      case 'deny':
      case 'share_bill':
      case 'start_billing':
      case 'close_shop':
      case 'inventory_add':
        parsed = { action, raw };
        break;

      case 'navigate': {
        const screen = actionDetected.screen || detectNavigationScreen(normalized, tokens);
        parsed = screen ? { action: 'navigate', screen, raw } : { action: 'unknown', raw };
        break;
      }

      case 'discount': {
        const value = parseNumber(normalized);
        const isFlat = /\b(rs|rupee|rupees|flat|రూపాయి|రూపాయలు|रुपया|रुपये)\b/.test(normalized);
        parsed = { action: 'discount', value: value || 0, type: isFlat ? 'flat' : 'percent', raw };
        break;
      }

      case 'remove': {
        parsed = { action: 'remove', item: extractItemName(normalized), raw };
        break;
      }

      case 'stock': {
        const numbers = extractAllNumbers(normalized).filter((n) => Number.isFinite(n));
        const item = extractItemName(normalized);
        if (!numbers.length && /\b(check|show|available|ఎంత|ఎన్ని|कितना|कितनी|स्टॉक)\b/i.test(normalized)) {
          parsed = { action: 'stock_check', item, raw };
        } else {
          const quantity = numbers.length ? Math.round(numbers[0]) : 0;
          parsed = { action: 'stock', item, qty: quantity, quantity, raw };
        }
        break;
      }

      case 'add': {
        const numbers = extractAllNumbers(normalized).filter((n) => Number.isFinite(n));
        let qty = numbers[0] || 1;
        let price = null;
        const item = extractItemName(normalized);
        const hasAddVerb = hasAnyKeyword(normalized, tokens, flattenCommandWords('add'));
        const knownItem = typeof DataEngine !== 'undefined' && item ? !!DataEngine.getItem(item) : false;

        const priceMatch = normalized.match(/(?:at|@|rupees?|rs|రూపాయలు|ధర|कीमत|दाम)\s*(\d+\.?\d*)/i);
        const hasJoiner = /\b(and|nd|plus|aur|మరియు)\b/i.test(normalized);
        if (priceMatch) {
          price = parseFloat(priceMatch[1]);
        } else if (!hasJoiner && numbers.length >= 2) {
          price = numbers[1];
        }

        if (qty <= 0) qty = 1;
        if (!item || (!knownItem && !hasAddVerb)) {
          parsed = { action: 'unknown', raw };
        } else {
          parsed = { action: 'add', item, qty, quantity: qty, price, raw };
        }
        break;
      }

      default:
        parsed = { action: 'unknown', raw };
    }

    cacheCommand(cacheKey, { ...parsed, raw: '' });
    return parsed;
  }

  // ========== BROWSER SPEECH RECOGNITION STT ==========
  let lastSpeechTickAt = 0;

  function resetSilenceTimer() {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      if (!isListening) {
        emitState(isActivated ? 'waiting' : 'idle');
        return;
      }
      emitTranscript(normalizeTranscriptText(liveTranscript), false);
      emitState(isActivated ? 'waiting' : 'idle');
    }, SILENCE_TIMEOUT);
  }

  function normalizeSpaces(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeTranscriptText(text) {
    return normalizeSpaces(
      String(text || '')
        .replace(/\s+([,.!?;:])/g, '$1')
        .replace(/([,.!?;:])([^\s])/g, '$1 $2')
    );
  }

  function getWordOverlapCount(baseText, chunkText) {
    const baseWords = normalizeSpaces(baseText).toLowerCase().split(' ').filter(Boolean);
    const chunkWords = normalizeSpaces(chunkText).toLowerCase().split(' ').filter(Boolean);
    const maxWindow = Math.min(STREAM_OVERLAP_WORDS, baseWords.length, chunkWords.length);

    for (let overlap = maxWindow; overlap > 0; overlap -= 1) {
      const tail = baseWords.slice(-overlap).join(' ');
      const head = chunkWords.slice(0, overlap).join(' ');
      if (tail === head) return overlap;
    }

    return 0;
  }

  function appendFinalTranscript(chunk) {
    const cleanedChunk = normalizeTranscriptText(chunk);
    if (!cleanedChunk) return;

    if (!liveTranscript) {
      liveTranscript = cleanedChunk;
      return;
    }

    const overlapCount = getWordOverlapCount(liveTranscript, cleanedChunk);
    const dedupedChunk = cleanedChunk.split(' ').slice(overlapCount).join(' ');
    if (!dedupedChunk) return;

    liveTranscript = normalizeTranscriptText(`${liveTranscript} ${dedupedChunk}`);
  }

  function getRecognitionLanguageCode() {
    const lang = String(currentLang || '').toLowerCase();
    if (lang.startsWith('te')) return 'te-IN';
    if (lang.startsWith('hi')) return 'hi-IN';
    return 'en-IN';
  }

  function recordSpeechTick(roundTripMs, charCount) {
    const now = performance.now();
    const gapMs = lastSpeechTickAt > 0 ? Math.max(1, Math.round(now - lastSpeechTickAt)) : 0;
    lastSpeechTickAt = now;

    const effectiveMs = roundTripMs > 0 ? roundTripMs : gapMs;
    const nextChunkCount = (debugStats.chunkCount || 0) + 1;
    const avgChunkMs = nextChunkCount <= 1
      ? effectiveMs
      : Math.round(((debugStats.avgChunkMs || 0) * (nextChunkCount - 1) + effectiveMs) / nextChunkCount);

    emitDebug({
      chunkCount: nextChunkCount,
      lastChunkMs: effectiveMs,
      avgChunkMs,
      lastChunkChars: Number(charCount || 0)
    });
  }

  function ensureRecognitionReady() {
    if (recognition) return true;
    if (!SpeechRecognitionCtor) return false;

    recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = getRecognitionLanguageCode();

    recognition.onstart = () => {
      recognitionIsRunning = true;
      isListening = true;
      emitState('listening');
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const chunk = normalizeTranscriptText((result[0] && result[0].transcript) || '');
        if (!chunk) continue;

        if (result.isFinal) {
          appendFinalTranscript(chunk);
          finalChunk = normalizeTranscriptText(`${finalChunk} ${chunk}`);
        } else {
          interimTranscript = normalizeTranscriptText(`${interimTranscript} ${chunk}`);
        }
      }

      const visibleTranscript = normalizeTranscriptText(`${liveTranscript} ${interimTranscript}`);
      emitTranscript(visibleTranscript, !!interimTranscript);

      if (finalChunk) {
        executeStreamingTranscript(finalChunk, true);
        recordSpeechTick(0, finalChunk.length);
      } else if (interimTranscript) {
        recordSpeechTick(0, interimTranscript.length);
      }

      if (visibleTranscript) resetSilenceTimer();
    };

    recognition.onerror = (event) => {
      const err = event && event.error ? event.error : '';
      if (err === 'no-speech') {
        emitState('listening');
        emitTranscript(normalizeTranscriptText(liveTranscript), true);
        return;
      }

      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(err)) {
        recognitionShouldRun = false;
        recognitionIsRunning = false;
        isListening = false;
        emitState('error-permission');
        emitTranscript('Microphone permission denied or unavailable. Allow microphone access and try again.', false);
        return;
      }

      if (err === 'aborted' && !recognitionShouldRun) return;

      if (err === 'network') {
        recognitionShouldRun = false;
        emitState('unsupported');
        emitTranscript('Speech service network issue. Check internet and try again.', false);
        return;
      }

      emitTranscript(`Speech recognition error: ${err || 'unknown error'}`, false);
      emitState('unsupported');
    };

    recognition.onend = () => {
      recognitionIsRunning = false;
      if (recognitionShouldRun) {
        if (recognitionRestartTimer) clearTimeout(recognitionRestartTimer);
        recognitionRestartTimer = setTimeout(() => {
          if (!recognitionShouldRun || recognitionIsRunning || !recognition) return;
          try {
            recognition.lang = getRecognitionLanguageCode();
            recognition.start();
          } catch (_err) {
            // start can throw if browser is not ready yet; next end cycle retries
          }
        }, RECOGNITION_RESTART_DELAY_MS);
        return;
      }

      isListening = false;
      emitState(isActivated ? 'waiting' : 'idle');
    };

    return true;
  }

  async function startBrowserSpeechListening() {
    if (isListening || recognitionShouldRun) return true;

    const host = (window.location && window.location.hostname) || '';
    const isLocalHost = /^(localhost|127\.0\.0\.1|::1)$/i.test(host);
    if (!window.isSecureContext && !isLocalHost) {
      emitState('unsupported');
      emitTranscript('Mic access needs HTTPS on non-localhost URLs. Open on localhost or enable HTTPS.', false);
      return false;
    }

    if (!ensureRecognitionReady()) {
      emitState('unsupported');
      emitTranscript('SpeechRecognition is unavailable in this browser. Use Chrome or Edge.', false);
      return false;
    }

    if (!wakeWordEnabled) isActivated = true;

    recognitionShouldRun = true;
    liveTranscript = '';
    lastSpeechTickAt = 0;
    streamCommandMemory.clear();
    resetDebugTurnMetrics();
    emitTranscript('', true);

    try {
      recognition.lang = getRecognitionLanguageCode();
      recognition.start();
      return true;
    } catch (_err) {
      recognitionShouldRun = false;
      emitState('error-permission');
      return false;
    }
  }

  async function completeBrowserSpeechListeningTurn() {
    recognitionShouldRun = false;
    if (recognitionRestartTimer) {
      clearTimeout(recognitionRestartTimer);
      recognitionRestartTimer = null;
    }

    if (recognition && recognitionIsRunning) {
      emitState('processing');
      try {
        recognition.stop();
      } catch (_err) {
        // no-op
      }
    }

    const finalText = normalizeTranscriptText(liveTranscript);
    if (finalText) emitTranscript(finalText, false);
    emitState(isActivated ? 'waiting' : 'idle');
    return true;
  }

  async function stopBrowserSpeechListening(cancelOnly = false) {
    recognitionShouldRun = false;
    if (recognitionRestartTimer) {
      clearTimeout(recognitionRestartTimer);
      recognitionRestartTimer = null;
    }

    if (recognition && recognitionIsRunning) {
      try {
        recognition.stop();
      } catch (_err) {
        // no-op
      }
    }

    isListening = false;
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }

    if (cancelOnly) {
      liveTranscript = '';
      emitTranscript('', false);
    } else {
      const finalText = normalizeTranscriptText(liveTranscript);
      if (finalText) emitTranscript(finalText, false);
    }

    emitState(isActivated ? 'waiting' : 'idle');
    return true;
  }

  // ========== PROCESS TRANSCRIPT ==========
  function getLangText(te, en, hi) {
    if (currentLang === 'te-IN') return te;
    if (currentLang === 'hi-IN') return hi || en;
    return en;
  }

  function processTranscript(text) {
    const cmd = parseCommand(text);
    commandHistory.push({ text, command: cmd, time: new Date().toISOString() });

    if (cmd.action === 'activate') {
      isActivated = true;
      emitState('activated');
      speak(getLangText(
        'నమస్కారం! చెప్పండి, ఏం కావాలి?',
        'Hello! I am listening. What do you need?',
        'नमस्ते! बताइए, क्या चाहिए?'
      ));
      emitCommand(cmd, null);
      return;
    }

    if (cmd.action === 'stop') {
      isActivated = false;
      speak(getLangText(
        'సరే, అవసరం అయితే మళ్ళీ పిలవండి!',
        'Okay, call me when needed.',
        'ठीक है, ज़रूरत हो तो बुलाना।'
      ));
      void stopBrowserSpeechListening(true);
      emitCommand(cmd, null);
      return;
    }

    if (wakeWordEnabled && !isActivated) {
      emitState('waiting');
      emitCommand(cmd, null);
      return;
    }

    emitState('processing');

    executeCommand(cmd);
  }

  function navigateTo(screen) {
    const navEl = document.querySelector(`.nav-item[data-section="${screen}"]`);
    if (typeof switchSection === 'function') {
      switchSection(screen, navEl || null);
      return true;
    }
    return false;
  }

  function setCommandFeedback(cmd, message, type = 'success') {
    if (!cmd || typeof cmd !== 'object') return;
    cmd.feedbackMessage = String(message || '').trim();
    cmd.feedbackType = type;
  }

  // ========== EXECUTE COMMAND ==========
  function executeCommand(cmd) {
    emitState('executing');
    const execStartedAt = performance.now();
    let result;

    switch (cmd.action) {
      case 'navigate': {
        if (!cmd.screen) {
          speak(getLangText('ఏ స్క్రీన్ ఓపెన్ చేయాలి?', 'Which screen should I open?', 'कौन सी स्क्रीन खोलूँ?'));
          setCommandFeedback(cmd, 'Command not recognized', 'error');
          break;
        }
        const ok = navigateTo(cmd.screen);
        if (ok) {
          const title = (typeof sectionTitles !== 'undefined' && sectionTitles[cmd.screen]) ? sectionTitles[cmd.screen][0] : cmd.screen;
          speak(getLangText(`${title} ఓపెన్ చేశాను`, `Opened ${title}`, `${title} खोल दिया`));
          setCommandFeedback(cmd, `Opened ${title}`, 'success');
        } else {
          speak(getLangText('నావిగేషన్ సాధ్యపడలేదు', 'Unable to navigate right now', 'अभी नेविगेट नहीं कर पाया'));
          setCommandFeedback(cmd, 'Navigation failed', 'error');
        }
        break;
      }

      case 'start_billing': {
        navigateTo('voicebill');
        speak(getLangText('బిల్లింగ్ మొదలైంది', 'Billing started', 'बिलिंग शुरू'));
        setCommandFeedback(cmd, 'Billing started', 'success');
        break;
      }

      case 'close_shop': {
        navigateTo('eod');
        if (typeof renderEOD === 'function') renderEOD();
        const summary = typeof DataEngine !== 'undefined' ? DataEngine.getDaySummary() : { totalTransactions: 0, totalRevenue: 0 };
        speak(getLangText(
          `రోజు ముగింపు సిద్ధం. ${summary.totalTransactions} బిల్లు, ₹${summary.totalRevenue}.`,
          `Shop close summary ready. ${summary.totalTransactions} bills, ₹${summary.totalRevenue}.`,
          `दुकान बंद सारांश तैयार। ${summary.totalTransactions} बिल, ₹${summary.totalRevenue}.`
        ));
        setCommandFeedback(cmd, 'Day close summary ready', 'success');
        break;
      }

      case 'share_bill': {
        if (typeof shareBillWhatsApp === 'function') {
          shareBillWhatsApp();
          speak(getLangText('బిల్లు షేర్ చేస్తున్నాను', 'Sharing the bill', 'बिल शेयर कर रहा हूँ'));
          setCommandFeedback(cmd, 'Sharing bill', 'success');
        } else {
          speak(getLangText('షేర్ చేయడానికి బిల్లు లేదు', 'No bill is available to share', 'शेयर करने के लिए बिल नहीं है'));
          setCommandFeedback(cmd, 'No bill to share', 'error');
        }
        break;
      }

      case 'print_bill': {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          window.print();
          speak(getLangText('బిల్లు ప్రింట్ చేస్తున్నాను', 'Printing bill', 'बिल प्रिंट कर रहा हूँ'));
          setCommandFeedback(cmd, 'Printing bill', 'success');
        } else {
          speak(getLangText('ప్రింట్ చేయలేకపోయాను', 'Print is not available', 'प्रिंट उपलब्ध नहीं है'));
          setCommandFeedback(cmd, 'Print is not available', 'error');
        }
        break;
      }

      case 'add': {
        if (typeof DataEngine === 'undefined') {
          speak('Data engine unavailable');
          setCommandFeedback(cmd, 'Data engine unavailable', 'error');
          break;
        }
        if (!cmd.item) {
          speak(getLangText('ఏ వస్తువు?', 'Which item?', 'कौन सा आइटम?'));
          setCommandFeedback(cmd, 'Item not found', 'error');
          break;
        }
        result = DataEngine.addToBill(cmd.item, cmd.qty || 1, cmd.price || null);
        if (result.success) {
          speak(getLangText(
            `${result.item} ${result.qty} చేర్చాను. మొత్తం ₹${result.total}`,
            `Added ${result.qty} ${result.item}. Total ₹${result.total}`,
            `${result.qty} ${result.item} जोड़ा. कुल ₹${result.total}`
          ));
          setCommandFeedback(cmd, `Added ${result.qty} ${result.item}`, 'success');
        } else if (result.reason === 'price_unknown') {
          speak(getLangText('ఆ వస్తువు దొరకలేదు', 'Item not found', 'आइटम नहीं मिला'));
          setCommandFeedback(cmd, 'Item not found', 'error');
          DataEngine.logUnavailable(cmd.item);
        } else if (result.reason === 'low_stock') {
          speak(getLangText(
            `${result.item} స్టాక్ తక్కువ. ${result.available} మాత్రమే ఉన్నాయి`,
            `Low stock for ${result.item}. Only ${result.available} available`,
            `${result.item} का स्टॉक कम है। सिर्फ ${result.available} बचा है`
          ));
          setCommandFeedback(cmd, `Low stock: ${result.available} left`, 'error');
        }
        break;
      }

      case 'correct_add': {
        if (typeof DataEngine === 'undefined') {
          speak('Data engine unavailable');
          setCommandFeedback(cmd, 'Data engine unavailable', 'error');
          break;
        }
        if (!cmd.item) {
          speak(getLangText('సరైన వస్తువు చెప్పండి', 'Please tell the corrected item', 'सही आइटम बताइए'));
          setCommandFeedback(cmd, 'Item not found', 'error');
          break;
        }

        DataEngine.undoBill();

        // Treat correction as "set this item to corrected qty" to avoid
        // accidental stacking when the same item already exists.
        const existingLine = (DataEngine.getBill().items || []).find(
          (line) => normalizeText(line.name) === normalizeText(cmd.item)
        );
        if (existingLine) {
          DataEngine.removeFromBill(cmd.item);
        }

        result = DataEngine.addToBill(cmd.item, cmd.qty || 1, cmd.price || null);
        if (result.success) {
          speak(getLangText(
            `సరి చేశాను. ${result.qty} ${result.item} చేర్చాను`,
            `Corrected. Added ${result.qty} ${result.item}`,
            `सुधार दिया। ${result.qty} ${result.item} जोड़ा`
          ));
          setCommandFeedback(cmd, `Corrected: added ${result.qty} ${result.item}`, 'success');
        } else {
          speak(getLangText('సరిచేయడం సాధ్యపడలేదు', 'Could not apply correction', 'सुधार लागू नहीं हुआ'));
          setCommandFeedback(cmd, 'Item not found', 'error');
        }
        break;
      }

      case 'remove': {
        if (!cmd.item) {
          speak(getLangText('ఏ వస్తువు తీసేయాలి?', 'Which item should I remove?', 'कौन सा आइटम हटाऊँ?'));
          setCommandFeedback(cmd, 'Item not found', 'error');
          break;
        }
        result = DataEngine.removeFromBill(cmd.item || '');
        if (result.success) {
          speak(getLangText(`${result.item} తీసేశాను`, `Removed ${result.item}`, `${result.item} हटा दिया`));
          setCommandFeedback(cmd, `Removed ${result.item}`, 'success');
        } else {
          speak(getLangText('ఆ వస్తువు దొరకలేదు', 'Item not found', 'आइटम नहीं मिला'));
          setCommandFeedback(cmd, 'Item not found', 'error');
        }
        break;
      }

      case 'undo': {
        result = DataEngine.undoBill();
        speak(result.success
          ? getLangText(`వెనక్కి తీసుకున్నాను. మొత్తం ₹${result.total}`, `Undone. Total ₹${result.total}`, `वापस किया. कुल ₹${result.total}`)
          : getLangText('undo చేయడానికి ఏమీ లేదు', 'Nothing to undo', 'वापस करने के लिए कुछ नहीं'));
        setCommandFeedback(cmd, result.success ? 'Undo complete' : 'Nothing to undo', result.success ? 'success' : 'error');
        break;
      }

      case 'total': {
        const total = DataEngine.getBillTotal();
        const count = DataEngine.getBill().items.length;
        speak(getLangText(
          `${count} వస్తువులు. మొత్తం ₹${total}`,
          `${count} items. Total ₹${total}`,
          `${count} आइटम. कुल ₹${total}`
        ));
        setCommandFeedback(cmd, `Total is ₹${total}`, 'success');
        break;
      }

      case 'discount': {
        if (!cmd.value || cmd.value <= 0) {
          speak(getLangText('డిస్కౌంట్ విలువ చెప్పండి', 'Please say a discount value', 'छूट की वैल्यू बताइए'));
          setCommandFeedback(cmd, 'Command not recognized', 'error');
          break;
        }
        result = DataEngine.setBillDiscount(cmd.value, cmd.type || 'percent');
        speak(getLangText(
          `${cmd.value}${cmd.type === 'percent' ? '%' : ' రూపాయలు'} discount ఇచ్చాను. మొత్తం ₹${result.total}`,
          `Applied ${cmd.value}${cmd.type === 'percent' ? '%' : ' rupees'} discount. Total ₹${result.total}`,
          `${cmd.value}${cmd.type === 'percent' ? '%' : ' रुपये'} छूट दी. कुल ₹${result.total}`
        ));
        const label = cmd.type === 'percent' ? `${cmd.value}% discount applied` : `₹${cmd.value} discount applied`;
        setCommandFeedback(cmd, label, 'success');
        break;
      }

      case 'bill': {
        if (typeof window !== 'undefined' && typeof window.generateBill === 'function') {
          result = window.generateBill({ source: 'voice' });
        } else {
          result = DataEngine.completeBill();
        }
        if (result.success) {
          speak(getLangText(
            `బిల్లు పూర్తయింది! ₹${result.txn.total}`,
            `Bill completed! ₹${result.txn.total}`,
            `बिल बन गया! ₹${result.txn.total}`
          ));
          cmd.billResult = result;
          setCommandFeedback(cmd, `Bill generated: ₹${result.txn.total}`, 'success');
        } else {
          speak(getLangText('బిల్లులో ఏమీ లేదు', 'Bill is empty', 'बिल खाली है'));
          setCommandFeedback(cmd, 'Bill is empty', 'error');
        }
        break;
      }

      case 'clear': {
        DataEngine.clearBill();
        speak(getLangText('బిల్లు క్లియర్ చేశాను', 'Bill cleared', 'बिल साफ़ कर दिया'));
        setCommandFeedback(cmd, 'Bill cleared', 'success');
        break;
      }

      case 'summary': {
        const s = DataEngine.getDaySummary();
        speak(getLangText(
          `ఈరోజు ${s.totalTransactions} bills. మొత్తం ₹${s.totalRevenue}.`,
          `Today ${s.totalTransactions} bills. Revenue ₹${s.totalRevenue}.`,
          `आज ${s.totalTransactions} बिल. कुल ₹${s.totalRevenue}.`
        ));
        setCommandFeedback(cmd, 'Summary ready', 'success');
        break;
      }

      case 'today_sales': {
        const s = DataEngine.getDaySummary();
        navigateTo('smartinsights');
        if (typeof refreshInsights === 'function') refreshInsights();
        speak(getLangText(
          `ఈరోజు అమ్మకాలు ₹${s.totalRevenue}. మొత్తం ${s.totalTransactions} బిల్లులు.`,
          `Today's sales are ₹${s.totalRevenue} across ${s.totalTransactions} bills.`,
          `आज की बिक्री ₹${s.totalRevenue} और कुल ${s.totalTransactions} बिल हैं।`
        ));
        setCommandFeedback(cmd, `Today's sales ₹${s.totalRevenue}`, 'success');
        break;
      }

      case 'top_items': {
        const summary = DataEngine.getDaySummary();
        const topList = (summary.topItems || []).slice(0, 3);
        navigateTo('smartinsights');
        if (typeof refreshInsights === 'function') refreshInsights();

        if (!topList.length) {
          speak(getLangText(
            'ఈరోజు టాప్ ఐటమ్స్ డేటా లేదు',
            'No top items data for today',
            'आज टॉप आइटम्स का डेटा नहीं है'
          ));
          setCommandFeedback(cmd, 'No top items data', 'error');
          break;
        }

        const names = topList.map((x) => `${x.name} (${x.qty})`).join(', ');
        speak(getLangText(
          `ఈరోజు టాప్ ఐటమ్స్: ${names}`,
          `Top items today: ${names}`,
          `आज के टॉप आइटम: ${names}`
        ));
        setCommandFeedback(cmd, `Top items: ${names}`, 'success');
        break;
      }

      case 'stock': {
        if (cmd.item && cmd.qty) {
          const item = DataEngine.getItem(cmd.item);
          if (item) {
            DataEngine.updateStock(item.id, cmd.qty);
            speak(getLangText(
              `${item.name} స్టాక్ ${cmd.qty} కి అప్డేట్ చేశాను`,
              `Updated ${item.name} stock to ${cmd.qty}`,
              `${item.name} का स्टॉक ${cmd.qty} कर दिया`
            ));
            setCommandFeedback(cmd, `Updated stock: ${item.name} = ${cmd.qty}`, 'success');
          } else {
            speak(getLangText('ఆ వస్తువు దొరకలేదు', 'Item not found', 'आइटम नहीं मिला'));
            setCommandFeedback(cmd, 'Item not found', 'error');
          }
        } else {
          speak(getLangText('ఎంత స్టాక్ చెప్పాలి?', 'Tell me the stock quantity', 'स्टॉक की मात्रा बताइए'));
          setCommandFeedback(cmd, 'Command not recognized', 'error');
        }
        break;
      }

      case 'stock_check': {
        if (!cmd.item) {
          speak(getLangText('ఏ వస్తువు స్టాక్ చూడాలి?', 'Which item stock should I check?', 'किस आइटम का स्टॉक देखूँ?'));
          setCommandFeedback(cmd, 'Item not found', 'error');
          break;
        }
        const item = DataEngine.getItem(cmd.item);
        if (!item) {
          speak(getLangText('ఆ వస్తువు దొరకలేదు', 'Item not found', 'आइटम नहीं मिला'));
          setCommandFeedback(cmd, 'Item not found', 'error');
          break;
        }
        speak(getLangText(
          `${item.name} స్టాక్ ${item.qty} ఉంది`,
          `${item.name} stock is ${item.qty}`,
          `${item.name} का स्टॉक ${item.qty} है`
        ));
        setCommandFeedback(cmd, `${item.name} stock is ${item.qty}`, 'success');
        break;
      }

      case 'confirm': {
        if (typeof acceptVoiceConfirm === 'function') {
          acceptVoiceConfirm();
          speak(getLangText('సరే, చేస్తున్నాను', 'Confirmed', 'ठीक है'));
          setCommandFeedback(cmd, 'Confirmed', 'success');
        } else {
          speak(getLangText('ఏమీ కన్ఫర్మ్ చేయడానికి లేదు', 'Nothing to confirm', 'कन्फर्म करने को कुछ नहीं'));
          setCommandFeedback(cmd, 'Nothing to confirm', 'error');
        }
        break;
      }

      case 'deny': {
        if (typeof cancelVoiceConfirm === 'function') {
          cancelVoiceConfirm();
          speak(getLangText('రద్దు చేశాను', 'Cancelled', 'कैंसल कर दिया'));
          setCommandFeedback(cmd, 'Cancelled', 'success');
        } else {
          speak(getLangText('రద్దు చేయడానికి ఏమీ లేదు', 'Nothing to cancel', 'कैंसल करने को कुछ नहीं'));
          setCommandFeedback(cmd, 'Nothing to cancel', 'error');
        }
        break;
      }

      case 'inventory_add': {
        if (typeof DataEngine === 'undefined') {
          speak('Data engine unavailable');
          setCommandFeedback(cmd, 'Data engine unavailable', 'error');
          break;
        }
        const numbers = extractAllNumbers(normalized).filter((n) => Number.isFinite(n));
        const itemName = extractItemName(normalized);
        if (!itemName) {
          speak(getLangText('ప్రొడక్ట్ పేరు చెప్పండి', 'Please say the product name', 'प्रोडक्ट का नाम बताइए'));
          setCommandFeedback(cmd, 'Product name missing', 'error');
          break;
        }
        const invPrice = numbers.length >= 1 ? numbers[0] : null;
        const invQty = numbers.length >= 2 ? Math.round(numbers[1]) : 10;
        if (!invPrice) {
          speak(getLangText('ధర చెప్పండి', 'Please tell the price', 'कीमत बताइए'));
          setCommandFeedback(cmd, 'Price missing', 'error');
          break;
        }
        const newItem = DataEngine.addNewItem({ name: itemName, price: invPrice, qty: invQty, unit: 'pcs', category: 'General' });
        navigateTo('inventory');
        speak(getLangText(
          `${newItem.name} ₹${invPrice} ధరతో ఇన్వెంటరీలో చేర్చాను`,
          `Added ${newItem.name} at ₹${invPrice} to inventory`,
          `${newItem.name} ₹${invPrice} में इन्वेंटरी में जोड़ा`
        ));
        setCommandFeedback(cmd, `Added ${newItem.name} to inventory`, 'success');
        break;
      }

      default:
        speak(getLangText('కమాండ్ గుర్తించలేకపోయాను. మళ్ళీ చెప్పండి', 'Command not recognized. Please repeat.', 'कमांड समझ नहीं आया। फिर से बोलिए।'));
        setCommandFeedback(cmd, 'Command not recognized', 'error');
        break;
    }

    if (cmd && cmd.raw) {
      mirrorCommandToBackend(cmd.raw);
    }

    emitDebug({
      lastCommandMs: Math.max(1, Math.round(performance.now() - execStartedAt)),
      lastCommandAction: cmd && cmd.action ? cmd.action : 'unknown'
    });

    emitCommand(cmd, result);
    setTimeout(() => {
      if (isActivated && !isListening) emitState('waiting');
      else if (!isActivated && !isListening) emitState('idle');
    }, 700);
  }

  // ========== SPEECH SYNTHESIS ==========
  function speak(text) {
    if (!synth || !text) return;
    synth.cancel();
    isSynthSpeaking = true;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = currentLang;
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 0.9;

    const voices = synth.getVoices ? synth.getVoices() : [];
    const match = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(currentLang.split('-')[0].toLowerCase()));
    if (match) utter.voice = match;

    emitState('speaking');
    utter.onend = () => {
      isSynthSpeaking = false;
      if (isListening) emitState('listening');
      else if (isActivated) emitState('waiting');
      else emitState('idle');
    };
    utter.onerror = () => {
      isSynthSpeaking = false;
      if (isListening) emitState('listening');
      else if (isActivated) emitState('waiting');
      else emitState('idle');
    };

    synth.speak(utter);
  }

  // ========== BACKEND HEALTH ==========
  async function checkBackendHealth(_force = false) {
    return true;
  }

  async function mirrorCommandToBackend(rawText) {
    const text = String(rawText || '').trim();
    if (!text) return;
    try {
      await fetch(`${normalizedBackendUrl()}/voice/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          execute: true,
          source: 'frontend-realtime'
        })
      });
    } catch (_err) {
      // Keep local-first behavior even if backend mirror fails.
    }
  }

  // ========== PUBLIC API ==========
  async function startListening() {
    return startBrowserSpeechListening();
  }

  function stopListening() {
    isActivated = false;
    void stopBrowserSpeechListening(true);
  }

  function toggleListening() {
    if (isListening || recognitionShouldRun) stopListening();
    else void startListening();
  }

  function completeListeningTurn() {
    if (isListening) void completeBrowserSpeechListeningTurn();
  }

  function cancelListeningTurn() {
    isActivated = false;
    void stopBrowserSpeechListening(true);
  }

  function setLanguage(lang) {
    const next = String(lang || '').trim();
    if (next.toLowerCase().startsWith('te')) currentLang = 'te-IN';
    else if (next.toLowerCase().startsWith('hi')) currentLang = 'hi-IN';
    else currentLang = 'en-IN';
    if (recognition) {
      recognition.lang = getRecognitionLanguageCode();
      // If actively listening, restart recognition with the new language
      if (recognitionShouldRun && recognitionIsRunning) {
        try {
          recognition.stop();
          // onend handler will auto-restart with updated lang
        } catch (_err) {
          // no-op
        }
      }
    }
  }

  function setSttProvider(provider) {
    // Kept for UI compatibility. Engine is browser speech only now.
    void provider;
    sttProvider = 'browser-speech';
    localStorage.setItem(STORAGE_KEYS.sttProvider, sttProvider);
    emitState('idle');
  }

  function setSpeechMode(mode) {
    void mode;
  }

  function setBackendUrl(url) {
    const next = String(url || '').trim();
    backendUrl = next || DEFAULT_BACKEND_URL;
    localStorage.setItem(STORAGE_KEYS.backendUrl, backendUrl);
  }

  function setWakeWordEnabled(enabled) {
    wakeWordEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.wakeWord, wakeWordEnabled ? '1' : '0');
    if (!wakeWordEnabled) isActivated = true;
  }

  function manualCommand(text) {
    const input = String(text || '').trim();
    if (!input) return;
    if (!wakeWordEnabled) isActivated = true;

    // Keep control intents direct, but run content commands through the same
    // streaming segment pipeline used by live mic input.
    const parsed = parseCommand(input);
    if (['activate', 'stop', 'confirm', 'deny'].includes(parsed.action)) {
      processTranscript(input);
      return;
    }

    streamCommandMemory.clear();
    executeStreamingTranscript(input, true);
  }

  return {
    startListening,
    stopListening,
    toggleListening,
    completeListeningTurn,
    cancelListeningTurn,
    setLanguage,
    setSttProvider,
    setSpeechMode,
    setBackendUrl,
    setWakeWordEnabled,
    manualCommand,
    speak,
    parseCommand,
    checkBackendHealth,
    getState: () => ({
      isListening,
      isActivated,
      lang: currentLang,
      provider: sttProvider,
      backendUrl,
      wakeWordEnabled
    }),
    getDebugStats: () => ({ ...debugStats }),
    getHistory: () => commandHistory,
    on: (event, handler) => {
      if (typeof handler !== 'function') return () => {};
      const bucket = listeners[event];
      if (!bucket) return () => {};
      bucket.add(handler);
      return () => bucket.delete(handler);
    },
    off: (event, handler) => {
      const bucket = listeners[event];
      if (!bucket || typeof handler !== 'function') return;
      bucket.delete(handler);
    }
  };
})();

if (typeof window !== 'undefined') {
  window.VoiceEngine = VoiceEngine;
  window.VoiceService = VoiceEngine;
}
