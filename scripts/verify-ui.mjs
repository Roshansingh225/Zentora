import { chromium } from "playwright";
import { PNG } from "pngjs";

const baseUrl = process.env.AJIOMART_URL || "http://localhost:5173";

const requiredCategories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Atta, Rice & Dal",
  "Oil & Ghee",
  "Spices & Masala",
  "Snacks & Biscuits",
  "Beverages",
  "Frozen Foods",
  "Bakery",
  "Personal Care",
  "Baby Care",
  "Household Essentials",
  "Cleaning Supplies",
  "Pet Care",
  "Organic Products",
];

function sampleCanvas(buffer) {
  const png = PNG.sync.read(buffer);
  const samples = new Set();
  let nonDark = 0;
  let goldOrEmerald = 0;

  for (let y = 0; y < png.height; y += 12) {
    for (let x = 0; x < png.width; x += 12) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];
      samples.add(`${r},${g},${b},${a}`);
      if (a > 0 && r + g + b > 80) nonDark += 1;
      if ((r > 150 && g > 120 && b < 120) || (g > 120 && b > 80 && r < 140)) {
        goldOrEmerald += 1;
      }
    }
  }

  return {
    width: png.width,
    height: png.height,
    uniqueSamples: samples.size,
    nonDark,
    goldOrEmerald,
  };
}

async function hasOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

async function loadedImageStats(page) {
  return page.evaluate(() =>
    Array.from(document.images).reduce(
      (acc, image) => ({
        total: acc.total + 1,
        loaded: acc.loaded + (image.complete && image.naturalWidth > 0 ? 1 : 0),
      }),
      { total: 0, loaded: 0 },
    ),
  );
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForSelector("canvas", { state: "attached", timeout: 8_000 }).catch(() => null);
await page.waitForTimeout(1_200);

const canvasCount = await page.locator("canvas").count();
const canvasBox = canvasCount > 0 ? await page.locator("canvas").first().boundingBox() : null;
let canvasStats = null;
if (canvasBox) {
  const buffer = await page.screenshot({
    clip: {
      x: Math.max(0, canvasBox.x),
      y: Math.max(0, canvasBox.y),
      width: Math.min(canvasBox.width, 1440 - Math.max(0, canvasBox.x)),
      height: Math.min(canvasBox.height, 1050 - Math.max(0, canvasBox.y)),
    },
  });
  canvasStats = sampleCanvas(buffer);
}

const homeText = await page.locator("body").innerText();
const adminHiddenFromHome = !homeText.includes("Admin");
const homeOverflow = await hasOverflow(page);

await page.goto(`${baseUrl}/grocery`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1_200);
const groceryText = await page.locator("body").innerText();
const groceryTextLower = groceryText.toLowerCase();
const missingCategories = requiredCategories.filter((category) => !groceryText.includes(category));
const featureChecks = {
  unitPrice: groceryTextLower.includes("unit price"),
  brandSelection: groceryTextLower.includes("brand selection"),
  frequentlyBoughtTogether: groceryTextLower.includes("frequently bought together"),
  similarProducts: groceryTextLower.includes("similar products"),
  sameDayDelivery: groceryTextLower.includes("same-day"),
  scheduledSlots: groceryTextLower.includes("scheduled delivery slots"),
  deliveryCharge: groceryTextLower.includes("delivery charge"),
  minimumOrder: groceryTextLower.includes("minimum order amount"),
  orderTracking: groceryTextLower.includes("order tracking"),
  statusTimeline: groceryTextLower.includes("status timeline"),
};
const groceryOverflow = await hasOverflow(page);
const groceryImages = await loadedImageStats(page);
await page.locator('button:has-text("Add")').first().click();
await page.waitForTimeout(500);
const loginGateAppeared = await page.locator("text=Login required").first().isVisible().catch(() => false);

await page.goto(`${baseUrl}/fashion`, { waitUntil: "networkidle", timeout: 60_000 });
await page.locator('a[href="/fashion/fashion-jacket"]').first().click();
await page.waitForURL("**/fashion/fashion-jacket", { timeout: 10_000 });
await page.locator("text=Product specifications").waitFor({ timeout: 10_000 });
const fashionDetailText = await page.locator("body").innerText();
const fashionDetailTextLower = fashionDetailText.toLowerCase();
const fashionDetailChecks = {
  detailUrl: page.url().endsWith("/fashion/fashion-jacket"),
  description: fashionDetailTextLower.includes("product specifications"),
  addToCart: fashionDetailTextLower.includes("add to cart"),
};

await page.goto(`${baseUrl}/cart`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(600);
const cartText = await page.locator("body").innerText();
const cartTextLower = cartText.toLowerCase();
const cartChecks = {
  addedProducts: cartTextLower.includes("added products"),
  deliveryAddress: cartTextLower.includes("delivery address"),
  deliveryCharge: cartTextLower.includes("delivery charge") || cartTextLower.includes("delivery"),
  loginRequired: cartTextLower.includes("login required"),
};

await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(700);
const adminText = await page.locator("body").innerText();
const adminChecks = {
  fashionAdmin: adminText.includes("Fashion Admin"),
  groceryAdmin: adminText.includes("Grocery Admin"),
  groceryProducts: adminText.includes("Grocery Products"),
  inventoryManagement: adminText.includes("Inventory Management"),
  stockAlerts: adminText.includes("Stock Alerts"),
  expiryDateManagement: adminText.includes("Expiry Date Management"),
  suppliers: adminText.includes("Suppliers"),
  purchaseRecords: adminText.includes("Purchase Records"),
  coupons: adminText.includes("Coupons"),
  deliveryCharges: adminText.includes("Delivery Charges"),
  deliverySlots: adminText.includes("Delivery Slots"),
  offers: adminText.includes("Offers"),
  reports: adminText.includes("Reports"),
};

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
await mobile.goto(`${baseUrl}/grocery`, { waitUntil: "networkidle", timeout: 60_000 });
await mobile.waitForTimeout(900);
const mobileOverflow = await hasOverflow(mobile);

await browser.close();

const allText = `${homeText}\n${groceryText}\n${adminText}`;
const standaloneFood = /(^|\s)Food(\s|$)/.test(allText.replace(/Frozen Foods/g, ""));

const result = {
  canvasStats,
  canvasCount,
  homeOverflow,
  adminHiddenFromHome,
  groceryOverflow,
  mobileOverflow,
  loginGateAppeared,
  standaloneFood,
  missingCategories,
  featureChecks,
  fashionDetailChecks,
  cartChecks,
  adminChecks,
  groceryImages,
  pageErrors,
};

const failed =
  !canvasStats ||
  canvasStats.uniqueSamples < 20 ||
  canvasStats.nonDark < 20 ||
  homeOverflow ||
  !adminHiddenFromHome ||
  groceryOverflow ||
  mobileOverflow ||
  !loginGateAppeared ||
  standaloneFood ||
  missingCategories.length > 0 ||
  Object.values(featureChecks).some((value) => !value) ||
  Object.values(fashionDetailChecks).some((value) => !value) ||
  Object.values(cartChecks).some((value) => !value) ||
  Object.values(adminChecks).some((value) => !value) ||
  pageErrors.length > 0;

console.log(JSON.stringify(result, null, 2));

if (failed) {
  process.exitCode = 1;
}
