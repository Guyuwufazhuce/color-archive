const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const TEST_PORT = 3000;
const BASE = `http://localhost:${TEST_PORT}`;

// Create a small test image (red gradient, 30x30, JPEG)
function createTestImage(name, r, g, b) {
  // 1x1 pixel PNG in base64
  const pixel = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, // PNG header
    0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, // IHDR
    0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x1E, // width=30
    0x00, 0x00, 0x00, 0x1E, // height=30
    0x08, 0x02, 0x00, 0x00, 0x00, // 8-bit RGB
    0x48, 0xD5, 0xA7, 0x58,
    0x00, 0x00, 0x00, // IDAT (deflate)
    0x29, 0x49, 0x44, 0x41, 0x54,
    0x08, 0xD7, 0x63, 0x68, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF,
    0x03, 0x00, 0x00, 0x01, 0x00, 0x01, 0x33, 0xE6, 0xE5, 0x2E,
    0x00, 0x00, 0x00, 0x00, // IEND
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82,
  ]);
  return pixel;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("=== Starting browser test ===");

  const browser = await puppeteer.launch({
    headless: false, // visible for debugging
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Listen for console messages
  page.on("console", (msg) => {
    console.log("[BROWSER]", msg.type().toUpperCase(), msg.text());
  });

  page.on("pageerror", (err) => {
    console.log("[BROWSER ERROR]", err.message);
  });

  // Step 1: Navigate to home page
  console.log("\n--- Step 1: Navigate to / ---");
  await page.goto(BASE, { waitUntil: "networkidle0", timeout: 15000 });
  await sleep(1000);

  // Check debug panel state
  const debugText = await page.evaluate(() => {
    const panel = document.querySelector(".font-mono");
    return panel ? panel.textContent : "NO DEBUG PANEL";
  });
  console.log("Debug panel:", debugText.replace(/\s+/g, " ").trim());

  if (!debugText.includes("Ready")) {
    console.error("FAIL: Debug panel does not show Ready state");
    await browser.close();
    process.exit(1);
  }
  console.log("PASS: Debug panel shows Ready");

  // Step 2: Find the file input and upload an image
  console.log("\n--- Step 2: Upload image ---");

  // Create a test image as PNG bytes
  const testImagePath = path.join(__dirname, "test-upload.png");
  // Create a minimal valid PNG (1x1 red pixel)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // width=1
    0x00, 0x00, 0x00, 0x01, // height=1
    0x08, 0x02, // 8-bit RGB
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x01, 0x63, 0x68, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0xE5, 0x27, 0xDE, 0xFC, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82, // CRC
  ]);
  fs.writeFileSync(testImagePath, pngBuffer);
  console.log("Test image created at:", testImagePath);

  // Set the file input value
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) {
    console.error("FAIL: File input not found");
    await browser.close();
    process.exit(1);
  }

  await fileInput.uploadFile(testImagePath);
  console.log("File uploaded via file input");

  // Step 3: Wait for processing states
  console.log("\n--- Step 3: Monitor processing ---");

  let maxWaits = 60; // 60 seconds max
  let currentState = "";
  let sawDone = false;

  for (let i = 0; i < maxWaits; i++) {
    await sleep(1000);

    const state = await page.evaluate(() => {
      const panel = document.querySelector(".font-mono");
      if (!panel) return "PANEL_NOT_FOUND";
      return panel.textContent.replace(/\s+/g, " ").trim();
    });

    if (state !== currentState) {
      console.log(`  [${i + 1}s] ${state}`);
      currentState = state;
    }

    if (state.includes("Done")) {
      sawDone = true;
      break;
    }

    if (state.includes("Error")) {
      console.error("FAIL: Upload hit error state");
      break;
    }

    const url = page.url();
    if (url.includes("/gallery")) {
      console.log("Detected redirect to /gallery");
      sawDone = true;
      break;
    }
  }

  if (!sawDone) {
    console.error("FAIL: Upload did not complete within timeout");
    // Take screenshot for debugging
    await page.screenshot({ path: "debug-screenshot.png" });
    console.log("Screenshot saved to debug-screenshot.png");
    await browser.close();
    process.exit(1);
  }

  console.log("PASS: Upload processing completed");

  // Step 4: Check redirect to /gallery
  console.log("\n--- Step 4: Check redirect ---");
  await sleep(2000);

  const finalUrl = page.url();
  console.log("Current URL:", finalUrl);

  if (finalUrl.includes("/gallery")) {
    console.log("PASS: Redirected to /gallery");
  } else {
    console.log("WARN: Not on /gallery. Current URL:", finalUrl);
  }

  // Step 5: Check gallery content
  const galleryContent = await page.evaluate(() => {
    const text = document.body.innerText;
    // Look for the image link
    const links = Array.from(document.querySelectorAll("a"));
    return {
      totalLinks: links.length,
      textSnippet: text.substring(0, 500),
      imgElements: document.querySelectorAll("img").length,
    };
  });
  console.log("Gallery content:", JSON.stringify(galleryContent, null, 2));

  if (galleryContent.imgElements > 0 || galleryContent.totalLinks > 1) {
    console.log("PASS: Gallery shows content");
  } else {
    console.log("WARN: Gallery appears empty");
  }

  // Cleanup
  fs.unlinkSync(testImagePath);

  console.log("\n=== Test complete ===");
  await browser.close();
}

main().catch((err) => {
  console.error("Test crashed:", err);
  process.exit(1);
});