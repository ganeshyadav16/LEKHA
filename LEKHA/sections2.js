// Inject sections 9-15 into the container
document.getElementById('sections2Container').innerHTML = `

<!-- ========== 9. CUSTOMER INTERFACE ========== -->
<div class="section" id="sec-customers">
<div class="section-header"><div><div class="section-title">Customer Interface</div><div class="section-subtitle">Preview of customer-facing storefront experience</div></div><div class="tabs"><button class="tab active">Browse</button><button class="tab">Cart</button><button class="tab">Track Order</button><button class="tab">Reviews</button></div></div>
<div class="glass-card mb-24"><div class="font-bold mb-16">Nearby Shops</div>
<div class="grid-3">
<div class="product-card" style="cursor:pointer"><div class="product-img" style="background:linear-gradient(135deg,rgba(79,125,248,0.15),rgba(155,109,255,0.1));height:100px"><div style="font-size:36px">🏪</div></div><div class="product-info"><div class="product-name">Rajesh General Store</div><div class="text-xs text-muted"><i class="fas fa-star" style="color:var(--accent-orange)"></i> 4.8 • 0.3 km • <span class="badge badge-success" style="font-size:9px">Open</span></div></div></div>
<div class="product-card" style="cursor:pointer"><div class="product-img" style="background:linear-gradient(135deg,rgba(52,211,153,0.15),rgba(54,214,231,0.1));height:100px"><div style="font-size:36px">🥬</div></div><div class="product-info"><div class="product-name">Fresh Veggie Corner</div><div class="text-xs text-muted"><i class="fas fa-star" style="color:var(--accent-orange)"></i> 4.5 • 0.5 km • <span class="badge badge-success" style="font-size:9px">Open</span></div></div></div>
<div class="product-card" style="cursor:pointer"><div class="product-img" style="background:linear-gradient(135deg,rgba(236,72,153,0.15),rgba(244,63,94,0.1));height:100px"><div style="font-size:36px">🍰</div></div><div class="product-info"><div class="product-name">Meera Home Bakery</div><div class="text-xs text-muted"><i class="fas fa-star" style="color:var(--accent-orange)"></i> 4.9 • 0.8 km • <span class="badge badge-warning" style="font-size:9px">Busy</span></div></div></div>
</div></div>
<div class="grid-2">
<div class="glass-card"><div class="font-bold mb-16">Shopping Cart (3 items)</div>
<div class="flex flex-col gap-8">
<div class="flex items-center justify-between" style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><span style="font-size:20px">🍚</span><div><div class="text-sm font-bold">Basmati Rice 5kg</div><div class="text-xs text-muted">Qty: 1</div></div></div><span class="font-bold">₹385</span></div>
<div class="flex items-center justify-between" style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><span style="font-size:20px">🥛</span><div><div class="text-sm font-bold">Amul Milk 500ml</div><div class="text-xs text-muted">Qty: 2</div></div></div><span class="font-bold">₹56</span></div>
<div class="flex items-center justify-between" style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><span style="font-size:20px">🧼</span><div><div class="text-sm font-bold">Surf Excel 1kg</div><div class="text-xs text-muted">Qty: 1</div></div></div><span class="font-bold">₹199</span></div>
</div>
<div style="border-top:1px solid var(--border-color);margin-top:16px;padding-top:16px" class="flex items-center justify-between"><span class="font-bold">Total: ₹640</span><button class="btn btn-primary"><i class="fas fa-shopping-bag"></i> Checkout</button></div>
</div>
<div class="glass-card"><div class="font-bold mb-16">Order Tracking — #1240</div>
<div class="timeline">
<div class="timeline-item completed"><div class="timeline-dot"></div><div><div class="text-sm font-bold">Order Placed</div><div class="text-xs text-muted">11 Apr, 1:00 PM</div></div></div>
<div class="timeline-item completed"><div class="timeline-dot"></div><div><div class="text-sm font-bold">Order Confirmed by Shop</div><div class="text-xs text-muted">11 Apr, 1:05 PM</div></div></div>
<div class="timeline-item completed"><div class="timeline-dot"></div><div><div class="text-sm font-bold">Being Prepared</div><div class="text-xs text-muted">11 Apr, 1:20 PM</div></div></div>
<div class="timeline-item"><div class="timeline-dot"></div><div><div class="text-sm font-bold">Out for Delivery</div><div class="text-xs text-muted">ETA ~15 min</div></div></div>
</div>
<div class="mt-16"><div class="font-bold text-sm mb-8">Rate your experience</div>
<div class="flex gap-8"><span style="font-size:24px;cursor:pointer;opacity:0.3">⭐</span><span style="font-size:24px;cursor:pointer;opacity:0.3">⭐</span><span style="font-size:24px;cursor:pointer;opacity:0.3">⭐</span><span style="font-size:24px;cursor:pointer;opacity:0.3">⭐</span><span style="font-size:24px;cursor:pointer;opacity:0.3">⭐</span></div></div>
</div>
</div>
</div>

<!-- ========== 10. SUPPLIERS ========== -->
<div class="section" id="sec-suppliers">
<div class="section-header"><div><div class="section-title">Supplier & Procurement</div><div class="section-subtitle">Manage your supply chain and vendor relationships</div></div><button class="btn btn-primary"><i class="fas fa-plus"></i> Add Supplier</button></div>
<div class="grid-3 mb-24">
<div class="glass-card" style="border-color:rgba(79,125,248,0.15)">
<div class="flex items-center gap-12 mb-16"><div class="avatar" style="background:var(--gradient-1);width:44px;height:44px;font-size:16px">AG</div><div><div class="font-bold">Agarwal Traders</div><div class="text-xs text-muted">Grains & Pulses</div></div></div>
<div class="flex items-center justify-between text-xs mb-8"><span class="text-muted">Reliability</span><span class="font-bold" style="color:var(--accent-green)">98%</span></div>
<div class="progress-bar mb-16"><div class="progress-fill" style="width:98%;background:var(--accent-green)"></div></div>
<div class="flex items-center justify-between text-xs"><span class="text-muted">Avg Delivery</span><span>2 days</span></div>
<div class="flex gap-8 mt-16"><button class="btn btn-primary btn-sm w-full">Order</button><button class="btn btn-secondary btn-sm w-full">Compare</button></div>
</div>
<div class="glass-card" style="border-color:rgba(155,109,255,0.15)">
<div class="flex items-center gap-12 mb-16"><div class="avatar" style="background:var(--gradient-2);width:44px;height:44px;font-size:16px">PM</div><div><div class="font-bold">Patel FMCG Mart</div><div class="text-xs text-muted">FMCG & Cleaning</div></div></div>
<div class="flex items-center justify-between text-xs mb-8"><span class="text-muted">Reliability</span><span class="font-bold" style="color:var(--accent-green)">92%</span></div>
<div class="progress-bar mb-16"><div class="progress-fill" style="width:92%;background:var(--accent-blue)"></div></div>
<div class="flex items-center justify-between text-xs"><span class="text-muted">Avg Delivery</span><span>3 days</span></div>
<div class="flex gap-8 mt-16"><button class="btn btn-primary btn-sm w-full">Order</button><button class="btn btn-secondary btn-sm w-full">Compare</button></div>
</div>
<div class="glass-card" style="border-color:rgba(52,211,153,0.15)">
<div class="flex items-center gap-12 mb-16"><div class="avatar" style="background:var(--gradient-4);width:44px;height:44px;font-size:16px">SD</div><div><div class="font-bold">Sharma Dairy</div><div class="text-xs text-muted">Dairy Products</div></div></div>
<div class="flex items-center justify-between text-xs mb-8"><span class="text-muted">Reliability</span><span class="font-bold" style="color:var(--accent-orange)">85%</span></div>
<div class="progress-bar mb-16"><div class="progress-fill" style="width:85%;background:var(--accent-orange)"></div></div>
<div class="flex items-center justify-between text-xs"><span class="text-muted">Avg Delivery</span><span>1 day</span></div>
<div class="flex gap-8 mt-16"><button class="btn btn-primary btn-sm w-full">Order</button><button class="btn btn-secondary btn-sm w-full">Compare</button></div>
</div>
</div>
<div class="glass-card"><div class="flex items-center justify-between mb-16"><span class="font-bold">Auto Reorder Rules</span><button class="btn btn-secondary btn-sm"><i class="fas fa-plus"></i> Add Rule</button></div>
<table class="data-table"><thead><tr><th>Product</th><th>Supplier</th><th>Threshold</th><th>Reorder Qty</th><th>Auto</th></tr></thead>
<tbody>
<tr><td class="font-bold">Basmati Rice 5kg</td><td>Agarwal Traders</td><td>20 units</td><td>100 units</td><td><div class="toggle active" onclick="this.classList.toggle('active')"></div></td></tr>
<tr><td class="font-bold">Amul Milk 500ml</td><td>Sharma Dairy</td><td>50 units</td><td>200 units</td><td><div class="toggle active" onclick="this.classList.toggle('active')"></div></td></tr>
<tr><td class="font-bold">Surf Excel 1kg</td><td>Patel FMCG Mart</td><td>15 units</td><td>50 units</td><td><div class="toggle" onclick="this.classList.toggle('active')"></div></td></tr>
</tbody></table></div>
</div>

<!-- ========== 11. MARKETING ========== -->
<div class="section" id="sec-marketing">
<div class="section-header"><div><div class="section-title">Marketing & Engagement</div><div class="section-subtitle">Run campaigns, manage coupons and loyalty programs</div></div><button class="btn btn-primary"><i class="fas fa-plus"></i> New Campaign</button></div>
<div class="grid-2 mb-24">
<div class="glass-card"><div class="font-bold mb-16"><i class="fab fa-whatsapp" style="color:var(--accent-green)"></i> WhatsApp Broadcast</div>
<div style="background:var(--bg-glass);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px">
<div class="flex items-center gap-8 mb-8"><div class="avatar" style="background:var(--accent-green);width:28px;height:28px;font-size:12px"><i class="fab fa-whatsapp"></i></div><span class="text-sm font-bold">Rajesh General Store</span></div>
<div style="background:rgba(52,211,153,0.08);border-radius:0 var(--radius-md) var(--radius-md) var(--radius-md);padding:12px;font-size:13px">🎉 <strong>Weekend Sale!</strong><br><br>Get 15% OFF on all cooking oils & 10% OFF on dal varieties!<br><br>🛒 Valid: Sat-Sun only<br>📍 Visit us or order on WhatsApp<br><br>Use code: <strong>WEEKEND15</strong></div>
<div class="text-xs text-muted mt-8">Preview • Will be sent to 847 customers</div>
</div>
<button class="btn btn-primary w-full"><i class="fab fa-whatsapp"></i> Send Broadcast</button>
</div>
<div class="glass-card"><div class="font-bold mb-16">Active Coupons</div>
<div class="flex flex-col gap-12">
<div style="padding:16px;background:linear-gradient(135deg,rgba(79,125,248,0.08),rgba(155,109,255,0.05));border-radius:var(--radius-md);border:1px dashed rgba(79,125,248,0.3)"><div class="flex items-center justify-between"><div><div class="font-bold" style="color:var(--accent-blue)">WEEKEND15</div><div class="text-xs text-muted mt-4">15% off on cooking oils • Min ₹500</div></div><span class="badge badge-success">Active</span></div><div class="flex items-center justify-between mt-8 text-xs text-muted"><span>Used: 23 / 100</span><span>Expires: 13 Apr</span></div></div>
<div style="padding:16px;background:linear-gradient(135deg,rgba(155,109,255,0.08),rgba(236,72,153,0.05));border-radius:var(--radius-md);border:1px dashed rgba(155,109,255,0.3)"><div class="flex items-center justify-between"><div><div class="font-bold" style="color:var(--accent-purple)">NEWUSER50</div><div class="text-xs text-muted mt-4">₹50 off for new customers</div></div><span class="badge badge-success">Active</span></div><div class="flex items-center justify-between mt-8 text-xs text-muted"><span>Used: 156 / ∞</span><span>No expiry</span></div></div>
</div>
<button class="btn btn-secondary w-full mt-16"><i class="fas fa-plus"></i> Create Coupon</button>
</div>
</div>
<div class="glass-card"><div class="font-bold mb-16">Loyalty Points Program</div>
<div class="grid-4">
<div style="text-align:center;padding:20px;background:var(--bg-glass);border-radius:var(--radius-md)"><div style="font-size:28px;margin-bottom:8px">🥉</div><div class="text-sm font-bold">Bronze</div><div class="text-xs text-muted">0 - 500 pts</div><div class="text-xs mt-4">1% cashback</div></div>
<div style="text-align:center;padding:20px;background:var(--bg-glass);border-radius:var(--radius-md)"><div style="font-size:28px;margin-bottom:8px">🥈</div><div class="text-sm font-bold">Silver</div><div class="text-xs text-muted">500 - 2000 pts</div><div class="text-xs mt-4">3% cashback</div></div>
<div style="text-align:center;padding:20px;background:var(--bg-glass);border-radius:var(--radius-md)"><div style="font-size:28px;margin-bottom:8px">🥇</div><div class="text-sm font-bold">Gold</div><div class="text-xs text-muted">2000 - 5000 pts</div><div class="text-xs mt-4">5% cashback</div></div>
<div style="text-align:center;padding:20px;background:linear-gradient(135deg,rgba(155,109,255,0.1),rgba(236,72,153,0.1));border-radius:var(--radius-md);border:1px solid rgba(155,109,255,0.2)"><div style="font-size:28px;margin-bottom:8px">💎</div><div class="text-sm font-bold">Platinum</div><div class="text-xs text-muted">5000+ pts</div><div class="text-xs mt-4">8% cashback</div></div>
</div></div>
</div>

<!-- ========== 12. TEAM & ACCESS ========== -->
<div class="section" id="sec-team">
<div class="section-header"><div><div class="section-title">User & Access Control</div><div class="section-subtitle">Manage team members, roles, and permissions</div></div><button class="btn btn-primary"><i class="fas fa-user-plus"></i> Add Member</button></div>
<div class="grid-3 mb-24">
<div class="glass-card" style="text-align:center"><div class="avatar" style="background:var(--gradient-1);width:56px;height:56px;font-size:20px;margin:0 auto 12px">RK</div><div class="font-bold">Rajesh Kumar</div><div class="text-xs text-muted mb-8">rajesh@localcart.in</div><span class="badge badge-purple">Owner</span><div class="text-xs text-muted mt-12"><i class="fas fa-clock"></i> Active now</div></div>
<div class="glass-card" style="text-align:center"><div class="avatar" style="background:var(--gradient-2);width:56px;height:56px;font-size:20px;margin:0 auto 12px">PM</div><div class="font-bold">Pooja M.</div><div class="text-xs text-muted mb-8">pooja@localcart.in</div><span class="badge badge-info">Manager</span><div class="text-xs text-muted mt-12"><i class="fas fa-clock"></i> 2h ago</div></div>
<div class="glass-card" style="text-align:center"><div class="avatar" style="background:var(--gradient-3);width:56px;height:56px;font-size:20px;margin:0 auto 12px">AK</div><div class="font-bold">Arun K.</div><div class="text-xs text-muted mb-8">arun@localcart.in</div><span class="badge badge-success">Staff</span><div class="text-xs text-muted mt-12"><i class="fas fa-clock"></i> 5h ago</div></div>
</div>
<div class="glass-card"><div class="font-bold mb-16">Activity Logs</div>
<div class="timeline">
<div class="timeline-item completed"><div class="timeline-dot"></div><div><div class="text-sm"><strong>Rajesh K.</strong> updated product price — Basmati Rice</div><div class="text-xs text-muted">Today, 4:30 PM</div></div></div>
<div class="timeline-item completed"><div class="timeline-dot"></div><div><div class="text-sm"><strong>Pooja M.</strong> processed order #1246</div><div class="text-xs text-muted">Today, 3:15 PM</div></div></div>
<div class="timeline-item completed"><div class="timeline-dot"></div><div><div class="text-sm"><strong>Arun K.</strong> added 50 units of Amul Milk to inventory</div><div class="text-xs text-muted">Today, 2:00 PM</div></div></div>
<div class="timeline-item completed"><div class="timeline-dot"></div><div><div class="text-sm"><strong>Rajesh K.</strong> created coupon WEEKEND15</div><div class="text-xs text-muted">Today, 11:00 AM</div></div></div>
</div></div>
</div>

<!-- ========== 13. PLATFORM ========== -->
<div class="section" id="sec-platform">
<div class="section-header"><div><div class="section-title">Platform Features</div><div class="section-subtitle">Connectivity, sync, and device management</div></div></div>
<div class="grid-3 mb-24">
<div class="glass-card" style="text-align:center;border-color:rgba(52,211,153,0.2)"><i class="fas fa-wifi" style="font-size:36px;color:var(--accent-green);display:block;margin-bottom:12px"></i><div class="font-bold">Online Mode</div><div class="text-xs text-muted mt-4">All systems connected and syncing</div><div class="sync-indicator sync-online mt-16" style="justify-content:center"><i class="fas fa-circle" style="font-size:6px"></i> Connected</div></div>
<div class="glass-card" style="text-align:center"><i class="fas fa-rotate" style="font-size:36px;color:var(--accent-blue);display:block;margin-bottom:12px"></i><div class="font-bold">Last Synced</div><div class="text-xs text-muted mt-4">All data is up to date</div><div class="text-sm font-bold mt-16" style="color:var(--accent-blue)">Just now</div></div>
<div class="glass-card" style="text-align:center"><i class="fas fa-laptop" style="font-size:36px;color:var(--accent-purple);display:block;margin-bottom:12px"></i><div class="font-bold">3 Devices</div><div class="text-xs text-muted mt-4">Desktop, Tablet, Mobile</div><div class="text-sm font-bold mt-16" style="color:var(--accent-purple)">All Active</div></div>
</div>
<div class="glass-card"><div class="font-bold mb-16">Offline Mode Capability</div>
<div class="grid-2">
<div style="padding:20px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-8 mb-8"><i class="fas fa-check-circle" style="color:var(--accent-green)"></i><span class="text-sm font-bold">Available Offline</span></div><div class="text-xs text-muted">• View inventory & products<br>• Create manual orders<br>• Generate invoices<br>• Access customer data</div></div>
<div style="padding:20px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-8 mb-8"><i class="fas fa-cloud" style="color:var(--accent-blue)"></i><span class="text-sm font-bold">Requires Internet</span></div><div class="text-xs text-muted">• Payment processing<br>• WhatsApp messaging<br>• AI predictions<br>• Live delivery tracking</div></div>
</div></div>
</div>

<!-- ========== 14. LOCAL NETWORK ========== -->
<div class="section" id="sec-network">
<div class="section-header"><div><div class="section-title">Local Vendor Network</div><div class="section-subtitle">Connect with nearby vendors for collaboration</div></div><button class="btn btn-primary"><i class="fas fa-handshake"></i> Join Network</button></div>
<div class="grid-2 mb-24">
<div class="glass-card"><div class="font-bold mb-16">Nearby Vendors</div>
<div class="flex flex-col gap-12">
<div class="flex items-center justify-between" style="padding:14px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><div class="avatar" style="background:var(--gradient-4);width:40px;height:40px;font-size:14px">🥬</div><div><div class="text-sm font-bold">Fresh Veggie Corner</div><div class="text-xs text-muted">Vegetables • 0.5 km away</div></div></div><button class="btn btn-secondary btn-sm">Connect</button></div>
<div class="flex items-center justify-between" style="padding:14px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><div class="avatar" style="background:var(--gradient-2);width:40px;height:40px;font-size:14px">🍰</div><div><div class="text-sm font-bold">Meera Home Bakery</div><div class="text-xs text-muted">Bakery • 0.8 km away</div></div></div><span class="badge badge-success">Connected</span></div>
<div class="flex items-center justify-between" style="padding:14px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><div class="avatar" style="background:var(--gradient-1);width:40px;height:40px;font-size:14px">💊</div><div><div class="text-sm font-bold">Health Plus Pharmacy</div><div class="text-xs text-muted">Pharmacy • 1.2 km away</div></div></div><button class="btn btn-secondary btn-sm">Connect</button></div>
</div></div>
<div class="glass-card"><div class="font-bold mb-16">Shared Delivery Collaboration</div>
<div style="padding:20px;background:linear-gradient(135deg,rgba(54,214,231,0.05),rgba(79,125,248,0.05));border-radius:var(--radius-lg);border:1px solid rgba(54,214,231,0.1);margin-bottom:16px;text-align:center">
<i class="fas fa-truck-fast" style="font-size:40px;color:var(--accent-cyan);display:block;margin-bottom:12px"></i>
<div class="font-bold">Pool Deliveries & Save</div>
<div class="text-xs text-muted mt-4">Share delivery partners with nearby vendors to reduce costs by up to 40%</div>
</div>
<div class="flex flex-col gap-8">
<div class="flex items-center justify-between text-sm" style="padding:10px 0;border-bottom:1px solid var(--border-color)"><span>Active shared routes</span><span class="font-bold">3</span></div>
<div class="flex items-center justify-between text-sm" style="padding:10px 0;border-bottom:1px solid var(--border-color)"><span>Cost saved this month</span><span class="font-bold" style="color:var(--accent-green)">₹2,400</span></div>
<div class="flex items-center justify-between text-sm" style="padding:10px 0"><span>Partner vendors</span><span class="font-bold">2</span></div>
</div></div>
</div>
</div>

<!-- ========== 15. ADMIN / SETTINGS ========== -->
<div class="section" id="sec-admin">
<div class="section-header"><div><div class="section-title">Settings & Admin</div><div class="section-subtitle">Configure your platform preferences</div></div></div>
<div class="grid-2 mb-24">
<div class="glass-card"><div class="font-bold mb-16">General Settings</div>
<div class="flex flex-col gap-16">
<div class="flex items-center justify-between"><div><div class="text-sm font-bold">Theme</div><div class="text-xs text-muted">Switch between dark and light mode</div></div><div class="flex items-center gap-8"><span class="badge badge-info" id="themeModeLabel">Dark</span><div class="toggle active" id="themeToggle" onclick="toggleTheme(this)"></div></div></div>
<div class="flex items-center justify-between"><div><div class="text-sm font-bold">Language</div><div class="text-xs text-muted">Choose voice recognition language</div></div><div class="lang-toggle"><button class="lang-btn active" onclick="setVoiceLang('te-IN',this)">TE</button><button class="lang-btn" onclick="setVoiceLang('en-IN',this)">EN</button><button class="lang-btn" onclick="setVoiceLang('hi-IN',this)">HI</button></div></div>
<div class="flex items-center justify-between"><div><div class="text-sm font-bold">Voice Assistant</div><div class="text-xs text-muted">Enable wake word and voice commands</div></div><div class="flex items-center gap-8"><span class="badge badge-success" id="voiceToggleState">On</span><div class="toggle active" id="voiceToggle" onclick="toggleVoiceAssistant(this)"></div></div></div>
<div class="flex items-center justify-between"><div><div class="text-sm font-bold">Push Notifications</div><div class="text-xs text-muted">Receive alerts for new orders</div></div><div class="toggle active" onclick="this.classList.toggle('active')"></div></div>
<div class="flex items-center justify-between"><div><div class="text-sm font-bold">Sound Alerts</div><div class="text-xs text-muted">Play sound on new order</div></div><div class="toggle" onclick="this.classList.toggle('active')"></div></div>
<div class="flex items-center justify-between"><div><div class="text-sm font-bold">Auto Accept Orders</div><div class="text-xs text-muted">Automatically confirm incoming orders</div></div><div class="toggle" onclick="this.classList.toggle('active')"></div></div>
<div class="flex items-center justify-between"><div><div class="text-sm font-bold">Sync Status</div><div class="text-xs text-muted">Current network and offline mode state</div></div><span class="badge badge-success" id="settingsSyncStatus">Online</span></div>
</div></div>
<div class="glass-card"><div class="font-bold mb-16">Export & Reports</div>
<div class="flex flex-col gap-12">
<div class="flex items-center justify-between" style="padding:16px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><i class="fas fa-file-pdf" style="color:var(--accent-red);font-size:20px"></i><div><div class="text-sm font-bold">Sales Report</div><div class="text-xs text-muted">Monthly summary PDF</div></div></div><button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Export</button></div>
<div class="flex items-center justify-between" style="padding:16px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><i class="fas fa-file-csv" style="color:var(--accent-green);font-size:20px"></i><div><div class="text-sm font-bold">Inventory Data</div><div class="text-xs text-muted">Full product list CSV</div></div></div><button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Export</button></div>
<div class="flex items-center justify-between" style="padding:16px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><i class="fas fa-file-excel" style="color:var(--accent-green);font-size:20px"></i><div><div class="text-sm font-bold">Customer Data</div><div class="text-xs text-muted">Customer list with orders</div></div></div><button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Export</button></div>
<div class="flex items-center justify-between" style="padding:16px;background:var(--bg-glass);border-radius:var(--radius-md)"><div class="flex items-center gap-12"><i class="fas fa-file-pdf" style="color:var(--accent-red);font-size:20px"></i><div><div class="text-sm font-bold">Tax Report</div><div class="text-xs text-muted">GST summary for filing</div></div></div><button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Export</button></div>
</div></div>
</div>
<div class="glass-card"><div class="font-bold mb-16">Danger Zone</div>
<div class="flex items-center justify-between" style="padding:16px;background:rgba(244,63,94,0.05);border:1px solid rgba(244,63,94,0.1);border-radius:var(--radius-md)"><div><div class="text-sm font-bold" style="color:var(--accent-red)">Delete Store</div><div class="text-xs text-muted">Permanently remove your store and all data</div></div><button class="btn btn-danger btn-sm"><i class="fas fa-trash"></i> Delete</button></div>
</div>
</div>
`;
