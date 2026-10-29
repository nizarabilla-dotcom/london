window.__londoOK = true;   // penanda: script.js berhasil dimuat
/* ===== 1. PENGATURAN ===== */
const WA_NUMBER = "62881023110921";   // ganti dengan nomor WhatsApp warung (format 62...)
const FOTO_UTAMA = "img/hero.jpg";   // foto besar di bagian atas (opsional)
const ONGKIR = 10000;                // biaya antar (isi 0 jika ongkir ditanggung resto)

/* metode pembayaran. untuk = tersedia saat "antar" dan/atau "ambil". {total} diganti total pesanan.
   Nomor rekening dan e-wallet di bawah hanya contoh, ganti dengan milik resto. */
const PEMBAYARAN = [
  {id:"cod", nama:"Bayar di tempat (COD)", untuk:["antar"], info:"Bayar tunai ke kurir saat pesanan tiba. Siapkan uang sejumlah {total}."},
  {id:"transfer", nama:"Transfer bank", untuk:["antar","ambil"], info:"BCA 1234567890 a.n. Mie Ayam Mas Londo Jenggot. Kirim bukti transfer lewat WhatsApp. Total: {total}."},
  {id:"qris", nama:"QRIS", untuk:["antar","ambil"], info:"Kode QRIS dikirim admin lewat WhatsApp setelah pesanan dikonfirmasi. Total: {total}."},
  {id:"ewallet", nama:"E-wallet (GoPay, OVO, DANA)", untuk:["antar","ambil"], info:"Kirim ke nomor 0812-3456-7890 a.n. Mie Ayam Mas Londo Jenggot. Total: {total}."},
  {id:"kasir", nama:"Bayar di resto", untuk:["ambil"], info:"Bayar tunai atau QRIS di kasir saat mengambil pesanan. Total: {total}."}
];
let bayar = "cod";   // metode yang sedang dipilih

/* ulasan pelanggan (contoh). Ganti dengan ulasan asli, bintang 1 sampai 5. */
const TESTI = [
  {nama:"Rina", area:"Batununggal", menu:"Mie Ayam Komplit", bintang:5, teks:"Mie-nya kenyal dan porsinya pas. Bakso di mie ayam komplit juga enak. Pesan lewat WhatsApp gampang."},
  {nama:"Dimas", area:"Lengkong", menu:"Mie Ayam Bakso", bintang:5, teks:"Pesan COD jadi tenang, bayar saat mie sampai. Pengantarannya cepat dan mie masih hangat."},
  {nama:"Sari", area:"Kiaracondong", menu:"Pangsit Goreng", bintang:4, teks:"Pangsit gorengnya renyah, cocok jadi teman makan mie. Sambalnya pas."},
  {nama:"Bagas", area:"Antapani", menu:"Es Kopi Susu Gula Aren", bintang:5, teks:"Es kopi susunya segar dan tidak terlalu manis. Cocok diminum setelah makan mie."},
  {nama:"Bu Yanti", area:"Buahbatu", menu:"Mie Ayam Original", bintang:5, teks:"Porsinya pas untuk makan bareng keluarga. Semua pesanan lengkap dan rapi."},
  {nama:"Fikri", area:"Cicendo", menu:"Bakso Kuah", bintang:4, teks:"Kuah baksonya hangat dan bumbunya terasa. Admin ramah dan cepat membalas."}
];

/* ===== ULASAN: contoh TESTI + ulasan baru yang ditulis pengunjung (tersimpan di browser mereka) ===== */
let ULASAN = [];
try { ULASAN = JSON.parse(localStorage.getItem("ulasan-londo") || "[]"); } catch(e){}
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function simpanUlasan(){ try { localStorage.setItem("ulasan-londo", JSON.stringify(ULASAN)); return true; } catch(e){ return false; } }
function semuaUlasan(){ return TESTI.concat(ULASAN); }

/* ===== 2. DATA MENU: tambah atau ubah menu di sini ===== */
const MENU = [
  {id:1, name:"Mie Ayam Original", cat:"Mie Ayam", price:15000, desc:"Mie kenyal, ayam cincang berbumbu, sawi, dan bawang goreng."},
  {id:2, name:"Mie Ayam Bakso", cat:"Mie Ayam", price:20000, desc:"Mie ayam dengan tiga bakso sapi.", badge:"Terlaris"},
  {id:3, name:"Mie Ayam Pangsit", cat:"Mie Ayam", price:20000, desc:"Mie ayam dengan pangsit goreng yang renyah."},
  {id:4, name:"Mie Ayam Jamur", cat:"Mie Ayam", price:19000, desc:"Mie ayam dengan tumisan jamur berbumbu kecap."},
  {id:5, name:"Mie Ayam Komplit", cat:"Mie Ayam", price:25000, desc:"Mie ayam dengan bakso dan pangsit goreng sekaligus.", badge:"Favorit"},
  {id:6, name:"Bakso Kuah", cat:"Mie Ayam", price:18000, desc:"Bakso sapi, mie, dan sayuran dalam kuah kaldu hangat."},
  {id:7, name:"Pangsit Goreng", cat:"Camilan", price:12000, desc:"Pangsit isi ayam, digoreng renyah dengan saus sambal."},
  {id:8, name:"Tahu Crispy", cat:"Camilan", price:10000, desc:"Tahu goreng tepung, disajikan dengan sambal kacang."},
  {id:9, name:"Siomay Ayam", cat:"Camilan", price:14000, desc:"Siomay ayam kukus dengan bumbu kacang."},
  {id:10, name:"Kerupuk Pangsit", cat:"Camilan", price:8000, desc:"Kerupuk pangsit renyah, cocok untuk pendamping mie."},
  {id:11, name:"Es Teh Manis", cat:"Minuman", price:6000, desc:"Teh melati diseduh segar, gula bisa dikurangi."},
  {id:12, name:"Es Jeruk Peras", cat:"Minuman", price:12000, desc:"Jeruk peras asli tanpa pewarna.", badge:"Segar"},
  {id:13, name:"Es Kopi Susu Gula Aren", cat:"Minuman", price:18000, desc:"Kopi, susu segar, dan gula aren cair.", badge:"Baru"},
  {id:14, name:"Es Cendol", cat:"Minuman", price:15000, desc:"Cendol pandan, santan, dan gula merah."},
  {id:15, name:"Teh Jahe Hangat", cat:"Minuman", price:9000, desc:"Teh hangat dengan jahe bakar dan gula aren."}
];
const $ = s => document.querySelector(s);
const rupiah = n => "Rp" + n.toLocaleString("id-ID");

/* ===== 3. ILUSTRASI MENU: SVG beranimasi, tanpa file foto ===== */
const dl = (i, s = .4) => `style="animation-delay:${(i * s).toFixed(1)}s"`;
const steamG = y => `<g class="steam" transform="translate(0,${y})"><path d="M80 50c-8-10 8-14 0-26"/><path d="M100 50c-8-10 8-14 0-26"/><path d="M120 50c-8-10 8-14 0-26"/></g>`;

function artMie(m){
  const n = m.name.toLowerCase(), kuah = /kuah/.test(n);
  const bakso = /bakso|komplit/.test(n), pangsit = /pangsit|komplit/.test(n), jamur = /jamur/.test(n);
  const both = bakso && pangsit;
  let t = "";
  if (bakso) t += (both ? [58, 84] : [70, 100, 130]).map((x, i) => `<circle class="top" ${dl(i)} cx="${x}" cy="72" r="11" fill="#7a4a2b"/>`).join("");
  if (pangsit) t += (both ? [114, 140] : [70, 100, 130]).map((x, i) => `<path class="top" ${dl(i + 1)} d="M${x - 12} 82 l12 -22 l12 22z" fill="#e0a43a" stroke="#b9791c" stroke-width="2" stroke-linejoin="round"/>`).join("");
  if (jamur) t += [66, 96, 126].map((x, i) => `<path class="top" ${dl(i)} d="M${x - 11} 80 a11 11 0 0 1 22 0z" fill="#b08968"/>`).join("");
  if (!bakso && !pangsit && !jamur) t += [72, 100, 128].map((x, i) => `<rect class="top" ${dl(i)} x="${x - 8}" y="66" width="16" height="11" rx="3" fill="#a8642a"/>`).join("");
  t += `<ellipse class="top" cx="150" cy="74" rx="9" ry="5" fill="#4f9d3a" ${dl(2)}/>`;
  return `<svg class="art" viewBox="0 0 200 160" style="background:#fde9b0" role="img" aria-label="${m.name}">
    ${steamG(0)}
    <path d="M28 78h144c0 38-30 62-72 62S28 116 28 78z" fill="#d62f1f"/>
    <ellipse cx="100" cy="78" rx="72" ry="14" fill="${kuah ? "#e8b866" : "#f2d27a"}"/>
    ${kuah ? "" : [0, 1, 2].map(i => `<path class="noodle" ${dl(i, .3)} d="M44 ${76 + i * 3}q12-9 24 0t24 0t24 0t24 0t24 0" stroke="#c9972b" fill="none" stroke-width="4" stroke-linecap="round"/>`).join("")}
    ${t}
    <rect x="60" y="136" width="80" height="8" rx="4" fill="#a31f13"/></svg>`;
}

function artCamilan(m){
  const n = m.name.toLowerCase(), xs = [62, 100, 138];
  let it;
  if (/pangsit goreng/.test(n)) it = xs.map((x, i) => `<path class="top" ${dl(i)} d="M${x - 17} 112 l17 -36 l17 36z" fill="#e0a43a" stroke="#b9791c" stroke-width="3" stroke-linejoin="round"/>`);
  else if (/tahu/.test(n)) it = xs.map((x, i) => `<rect class="top" ${dl(i)} x="${x - 15}" y="82" width="30" height="30" rx="4" fill="#f0c66a" stroke="#c9972b" stroke-width="3"/>`);
  else if (/siomay/.test(n)) it = xs.map((x, i) => `<g class="top" ${dl(i)}><rect x="${x - 15}" y="88" width="30" height="24" rx="8" fill="#f3e2b3" stroke="#d6bd82" stroke-width="3"/><circle cx="${x}" cy="88" r="4" fill="#e8892b"/></g>`);
  else it = xs.map((x, i) => `<ellipse class="top" ${dl(i)} cx="${x}" cy="98" rx="19" ry="15" fill="#f6dc9b" stroke="#d9b45a" stroke-width="3"/>`);
  return `<svg class="art" viewBox="0 0 200 160" style="background:#fbe0c3" role="img" aria-label="${m.name}">
    <ellipse cx="100" cy="118" rx="80" ry="20" fill="#fff" stroke="#d9cdb8" stroke-width="4"/>
    ${it.join("")}
    <ellipse cx="100" cy="116" rx="80" ry="16" fill="none"/></svg>`;
}

function artMinum(m){
  const n = m.name.toLowerCase();
  if (/hangat/.test(n)) return `<svg class="art" viewBox="0 0 200 160" style="background:#f6e3d0" role="img" aria-label="${m.name}">
    ${steamG(20)}
    <path d="M140 84h12a16 16 0 0 1 0 34h-14" fill="none" stroke="#e9e1d4" stroke-width="8" stroke-linecap="round"/>
    <path d="M56 76h88v40a22 22 0 0 1-22 22H78a22 22 0 0 1-22-22z" fill="#fff" stroke="#e0d6c4" stroke-width="3"/>
    <ellipse cx="100" cy="80" rx="42" ry="7" fill="#c8832f"/>
    <circle class="top" cx="112" cy="80" r="6" fill="#f2c94c" stroke="#d9a520" stroke-width="2"/></svg>`;
  const c = /jeruk/.test(n) ? "#ffa62b" : /kopi/.test(n) ? "#8b5a3c" : /cendol/.test(n) ? "#7fcf6a" : "#b5651d";
  const top = /kopi/.test(n) ? "#f3e3c8" : /cendol/.test(n) ? "#fffaf0" : "";
  return `<svg class="art" viewBox="0 0 200 160" style="background:#dff1f7" role="img" aria-label="${m.name}">
    <path d="M64 62h72l-6 78H70z" fill="${c}"/>
    ${top ? `<path d="M64 62h72l-2 26H66z" fill="${top}"/>` : ""}
    ${/cendol/.test(n) ? [78, 98, 118].map((x, i) => `<ellipse class="top" ${dl(i)} cx="${x}" cy="124" rx="7" ry="4" fill="#4fae3c"/>`).join("") : ""}
    <rect class="ice" x="76" y="66" width="20" height="20" rx="4" fill="#fff" opacity=".6"/>
    <rect class="ice" ${dl(2)} x="104" y="72" width="20" height="20" rx="4" fill="#fff" opacity=".6"/>
    ${[84, 100, 116].map((x, i) => `<circle class="bub" ${dl(i, .7)} cx="${x}" cy="130" r="3" fill="#fff"/>`).join("")}
    <path d="M62 40h76l-8 100H70z" fill="#fff" fill-opacity=".25" stroke="#9fb7c0" stroke-width="3" stroke-linejoin="round"/>
    <path d="M108 20l14 56" stroke="#d62f1f" stroke-width="6" stroke-linecap="round"/></svg>`;
}

const picHTML = m => m.cat === "Mie Ayam" ? artMie(m) : m.cat === "Camilan" ? artCamilan(m) : artMinum(m);

function renderHero(){   // bagian atas: kartu info; jika file img/hero.jpg ada, diganti foto
  $("#heroSide").innerHTML = `<div class="info-card"><h2>Buka hari ini</h2><p class="jam">08.00–21.00 WIB</p><p>Jl. Laswi No.182, Samoja, Batununggal, Bandung</p><ul><li>COD tersedia untuk pesanan diantar</li></ul></div>`;
  const im = new Image();
  im.onload = () => { $("#heroSide").innerHTML = `<div class="hero-photo"><img src="${FOTO_UTAMA}" alt="Mie Ayam Mas Londo Jenggot"></div>`; };
  im.src = FOTO_UTAMA;
}

/* ===== 4. KERANJANG: {idMenu: jumlah}, disimpan di browser ===== */
let cart = {};
try { cart = JSON.parse(localStorage.getItem("cart-londo") || "{}"); } catch(e){}
const save = () => { try { localStorage.setItem("cart-londo", JSON.stringify(cart)); } catch(e){} };
const find = id => MENU.find(m => m.id === +id);
function change(id, d){
  cart[id] = Math.max(0, (cart[id] || 0) + d);
  if (!cart[id]) delete cart[id];
  save(); updateRow(id); renderCart();
}
const entries = () => Object.keys(cart).map(id => ({item: find(id), qty: cart[id]})).filter(e => e.item);
const subtotal = () => entries().reduce((s, e) => s + e.item.price * e.qty, 0);
const total = () => subtotal() + ongkir();
const mode = () => document.querySelector("input[name=mode]:checked").value;
const ongkir = () => (mode() === "antar" && subtotal() > 0) ? ONGKIR : 0;

/* ===== 4. TAMPILAN MENU ===== */
let cat = "Mie Ayam", q = "";
function renderTabs(){
  const cats = [...new Set(MENU.map(m => m.cat))];
  $("#tabs").innerHTML = cats.map(c => `<button class="tab" type="button" data-cat="${c}" aria-pressed="${c === cat && !q}">${c}</button>`).join("");
}
const ctlHTML = (m, n) => n
  ? `<span class="qty new"><button type="button" data-dec="${m.id}" aria-label="Kurangi ${m.name}">−</button><output>${n}</output><button type="button" data-inc="${m.id}" aria-label="Tambah ${m.name}">+</button></span>`
  : `<button class="add" type="button" data-inc="${m.id}">Tambah</button>`;
function updateRow(id){   // ubah satu kartu saja, tanpa menggambar ulang semua kartu
  const card = document.querySelector(`.item[data-id="${id}"]`); if (!card) return;
  const n = cart[id] || 0, box = card.querySelector(".ctl"), out = box.querySelector("output");
  if (n && out){ out.textContent = n; out.classList.remove("tick"); void out.offsetWidth; out.classList.add("tick"); }
  else box.innerHTML = ctlHTML(find(id), n);
}
function renderMenu(){
  const key = q.trim().toLowerCase();
  const list = MENU.filter(m => key ? (m.name + " " + m.desc).toLowerCase().includes(key) : m.cat === cat);
  $("#grid").innerHTML = list.length ? list.map((m, i) => `<article class="item" data-id="${m.id}" style="--i:${i}">${m.badge ? `<span class="tag">${m.badge}</span>` : ""}
      <div class="pic">${picHTML(m)}</div><h3>${m.name}</h3><p class="desc">${m.desc}</p>
      <div class="row"><span class="price">${rupiah(m.price)}</span><span class="ctl">${ctlHTML(m, cart[m.id] || 0)}</span></div></article>`).join("")
    : `<p class="empty">Menu tidak ditemukan. Coba kata lain.</p>`;
}
function enterGrid(){   // jalankan animasi kartu muncul bergantian
  const g = $("#grid"); g.classList.remove("enter"); void g.offsetWidth; g.classList.add("enter");
  clearTimeout(enterGrid.t); enterGrid.t = setTimeout(() => g.classList.remove("enter"), 900);
}
$("#q").addEventListener("input", e => { q = e.target.value; renderTabs(); renderMenu(); enterGrid(); });
$("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b){ cat = b.dataset.cat; q = ""; $("#q").value = ""; renderTabs(); renderMenu(); enterGrid(); }});
$("#grid").addEventListener("click", e => {
  const i = e.target.closest("[data-inc]"), d = e.target.closest("[data-dec]");
  if (i){ fly(i); change(i.dataset.inc, 1); } if (d) change(d.dataset.dec, -1);
});

/* ===== 5. TAMPILAN PESANAN (drawer) ===== */
let prevN = 0;
function renderCart(){
  const list = entries(), n = list.reduce((s, e) => s + e.qty, 0);
  $("#badge").textContent = n;
  if (n > prevN){ const b = $("#badge"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  prevN = n;
  $("#empty").hidden = n > 0;
  $("#lines").innerHTML = list.map(e => `<li><div>${e.item.name}<small>${rupiah(e.item.price)} × ${e.qty}</small></div>
    <div class="qty"><button type="button" data-dec="${e.item.id}" aria-label="Kurangi ${e.item.name}">−</button><output>${e.qty}</output><button type="button" data-inc="${e.item.id}" aria-label="Tambah ${e.item.name}">+</button></div></li>`).join("");
  $("#sub").textContent = rupiah(subtotal());
