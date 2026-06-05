const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

const BASE = "http://localhost:3000";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function makePNG(w, h) {
  const raw = Buffer.alloc((1 + w * 3) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0;
    for (let x = 0; x < w; x++) {
      const off = y * (1 + w * 3) + 1 + x * 3;
      raw[off] = Math.floor(100 + (x/w)*155);
      raw[off+1] = Math.floor(50 + (y/h)*150);
      raw[off+2] = Math.floor(200 - (x+y)/(w+h)*150);
    }
  }
  const def = zlib.deflateSync(raw);
  function crc32(b) {
    let c = 0xffffffff, t = new Int32Array(256);
    for (let i = 0; i < 256; i++) { let x = i; for (let j = 0; j < 8; j++) x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1; t[i] = x; }
    for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function chk(type, data) {
    let len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    let t = Buffer.from(type);
    let crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
  }
  let ih = Buffer.alloc(13);
  ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  return Buffer.concat([Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]), chk("IHDR",ih), chk("IDAT",def), chk("IEND",Buffer.alloc(0))]);
}

async function main() {
  const imgPath = path.join(__dirname, "test-upload.png");
  fs.writeFileSync(imgPath, makePNG(200, 200));
  console.log("Test image:", fs.statSync(imgPath).size, "bytes");

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const cdp = await page.target().createCDPSession();

  page.on("pageerror", err => console.log("[PAGE ERROR]", err.message));
  
  // Log to see what's happening
  page.on("console", msg => {
    const t = msg.text();
    if (t.includes("[Upload]") || t.includes("[Gallery]") || t.includes("[debug]")) {
      console.log("  [browser]", t);
    }
  });

  // 1) Navigate
  console.log("\n1) Load /");
  await page.goto(BASE, { waitUntil: "networkidle0", timeout: 15000 });
  await sleep(2000);

  let debug = await page.evaluate(() => 
    document.querySelector(".font-mono")?.innerText.replace(/\s+/g, " ").trim() || "NOPANEL"
  );
  console.log("Debug:", debug);

  // 2) Get the input's ObjectId and set files via CDP
  console.log("\n2) Upload file via CDP...");
  
  const input = await page.$('input#image-upload');
  if (!input) throw new Error("No input found");
  
  const remoteObj = await input.remoteObject();
  
  // Use CDP to set file input files - this is the most reliable method
  await cdp.send("DOM.setFileInputFiles", {
    objectId: remoteObj.objectId,
    files: [imgPath],
  });
  console.log("  CDP setFileInputFiles done");

  // Wait a moment and check state
  await sleep(500);
  debug = await page.evaluate(() => 
    document.querySelector(".font-mono")?.innerText.replace(/\s+/g, " ").trim() || "NOPANEL"
  );
  console.log("  After CDP:", debug);

  // If still not triggered, manually invoke the hidden handler
  if (debug.includes("Ready") && !debug.includes("Selected") && !debug.includes("Reading")) {
    console.log("  Trying to invoke handler directly...");
    await page.evaluate(() => {
      // Find the input
      const input = document.querySelector('input#image-upload');
      if (!input || !input.files || input.files.length === 0) {
        console.log("[debug] no files on input after CDP!");
        return;
      }
      console.log("[debug] files found:", input.files.length, input.files[0].name);
      // Dispatch both input and change events
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("[debug] events dispatched");
    });
    await sleep(1000);
    
    debug = await page.evaluate(() => 
      document.querySelector(".font-mono")?.innerText.replace(/\s+/g, " ").trim() || "NOPANEL"
    );
    console.log("  After manual dispatch:", debug);
  }

  // 3) Poll
  console.log("\n3) Poll for 30s...");
  let last = "";
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    let txt = await page.evaluate(() => {
      let p = document.querySelector(".font-mono");
      return p ? p.innerText.replace(/\s+/g, " ").trim() : "NOPANEL";
    });
    if (txt !== last) {
      console.log(`  [${i+1}s] ${txt}`);
      last = txt;
    }
    let url = page.url();
    if (url.includes("/gallery")) {
      console.log(`  [${i+1}s] → /gallery`);
      await sleep(2000);
      break;
    }
    if (txt.includes("Error")) break;
  }

  // 4) Final
  debug = await page.evaluate(() => 
    document.querySelector(".font-mono")?.innerText.replace(/\s+/g, " ").trim() || "NOPANEL"
  );
  let url = page.url();
  let ls = await page.evaluate(() => {
    let r = localStorage.getItem("color-archive-images");
    if (!r) return "EMPTY";
    let p = JSON.parse(r);
    return `${p.length} items, keys: ${Object.keys(p[0]||{}).join(", ")}`;
  });
  
  console.log(`\n  URL: ${url}`);
  console.log(`  Debug: ${debug}`);
  console.log(`  localStorage: ${ls}`);

  if (url.includes("/gallery")) {
    const imgs = await page.evaluate(() => document.querySelectorAll("img").length);
    console.log(`  Gallery <img> count: ${imgs}`);
  }

  await page.screenshot({ path: "debug-final.png" });
  console.log("  Screenshot: debug-final.png");
  fs.unlinkSync(imgPath);
  await browser.close();
  console.log("\n=== Done ===");
}

main().catch(e => { console.error("CRASH:", e); process.exit(1); });