import { test, expect } from "@playwright/test";

const tickets = [
  { id: 1, slug: "flash", name: "Flash", price: 2, maxReward: 20, winProbability: 35 },
  { id: 2, slug: "fortune", name: "Fortune", price: 5, maxReward: 75, winProbability: 24 },
  { id: 3, slug: "jackpot", name: "Jackpot", price: 10, maxReward: 250, winProbability: 19 },
  { id: 4, slug: "mystere", name: "Mystere", price: 4, maxReward: 100, winProbability: 12.5 },
  { id: 5, slug: "lucky-7", name: "Lucky 7", price: 3, maxReward: 50, winProbability: 15.5 },
].map((ticket) => ({ ...ticket, rewards: [{ id: ticket.id, label: "Lot maximum", amount: ticket.maxReward }], description: "Ticket de démonstration" }));
const user = { id: 123, username: "Studio", email: "studio@example.com", credits: 100 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("scratchwin_token", `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 7200 }))}.signature`);
    localStorage.setItem("scratchwin_refresh_token", "visual-test-refresh");
    localStorage.setItem("scratchwin_last_refresh_at", String(Date.now()));
    localStorage.setItem("scratchwin_theme", "light");
  });
  await page.route("**/scratchwin/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/auth/me")) return route.fulfill({ json: { user } });
    if (path.endsWith("/tickets")) return route.fulfill({ json: { tickets } });
    if (path.endsWith("/games/play")) {
      const ticket = tickets.find((item) => item.id === route.request().postDataJSON().ticketId);
      const symbol = { flash: "bolt", fortune: "crown", jackpot: "seven", mystere: "question", "lucky-7": "seven" }[ticket.slug];
      const winningCount = ticket.slug === "lucky-7" ? 3 : ticket.slug === "mystere" ? 2 : 1;
      const resultData = {
        headline: ticket.name, columns: 3, rewardAmount: ticket.maxReward, rewardLabel: "Lot maximum",
        isJackpot: true, summary: `Bravo ! Tu remportes ${ticket.maxReward} crédits.`,
        cells: Array.from({ length: ticket.slug === "lucky-7" ? 9 : 6 }, (_, index) => ({
          id: index + 1, symbol: index < winningCount ? symbol : "star",
          label: index < winningCount ? "Lot maximum" : "Étoile", caption: index < winningCount ? `+${ticket.maxReward}` : null,
          variant: index < winningCount ? "win" : "neutral",
        })),
      };
      return route.fulfill({ json: { ticket, user: { ...user, credits: user.credits - ticket.price + ticket.maxReward }, game: { id: 456, ticketId: ticket.id, resultData } } });
    }
    // An unexpected endpoint must not reach the live backend.
    return route.fulfill({ status: 404, json: { message: "Route de test non prévue." } });
  });
});

test("les cinq tickets restent lisibles du mobile au grand écran", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("tickets");
  await expect(page.locator(".lottery-ticket")).toHaveCount(5);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const clippedTitles = await page.locator(".ticket-display-title").evaluateAll((titles) => titles.filter((title) => title.scrollWidth > title.clientWidth + 2).length);
    expect(clippedTitles).toBe(0);
    if (width === 390 || width === 1440) await page.screenshot({ path: testInfo.outputPath(`catalogue-${width}.png`), fullPage: true });
  }
  await page.getByRole("button", { name: "Activer le mode sombre" }).click();
  await page.screenshot({ path: testInfo.outputPath("catalogue-dark.png"), fullPage: true });
  expect(errors).toEqual([]);
});

for (const ticket of tickets) {
  test(`${ticket.name} : aperçu, achat unique et révélation`, async ({ page }, testInfo) => {
    let purchases = 0;
    page.on("request", (request) => { if (request.url().endsWith("/games/play")) purchases++; });
    await page.goto(`tickets/${ticket.id}/play`);
    await expect(page.locator(`.lottery-${ticket.slug}`)).toBeVisible();
    expect(purchases).toBe(0);
    await expect(page.locator("canvas.scratch-cover")).toHaveCount(0);
    await page.getByRole("button", { name: "Acheter et gratter" }).click();
    const count = ticket.slug === "lucky-7" ? 9 : 6;
    await expect(page.locator("canvas.scratch-cover")).toHaveCount(count);
    expect(purchases).toBe(1);
    await expect(page.locator(".result-banner")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`${ticket.slug}-sealed.png`), fullPage: true });
    await page.locator("canvas.scratch-cover").last().focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("canvas.scratch-cover")).toHaveCount(count - 1);
    await page.getByRole("button", { name: "Tout révéler" }).click();
    await expect(page.locator("canvas.scratch-cover")).toHaveCount(0);
    await expect(page.locator(".result-banner")).toContainText(`Tu remportes ${ticket.maxReward}`);
    await expect(page.getByRole("button", { name: "Tout révéler" })).toBeDisabled();
    await page.screenshot({ path: testInfo.outputPath(`${ticket.slug}-revealed.png`), fullPage: true });
    expect(purchases).toBe(1);
  });
}

test("le grattage efface progressivement la matière et découvre le symbole", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("tickets/1/play");
  await page.getByRole("button", { name: "Acheter et gratter" }).click();
  const canvas = page.locator("canvas.scratch-cover").first();
  await expect(canvas).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  await expect(page.locator(".scratch-cell-content").first()).toHaveCSS("opacity", "1");
  const rect = await canvas.boundingBox();
  await page.mouse.move(rect.x + rect.width * .3, rect.y + rect.height * .5);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .7, rect.y + rect.height * .5, { steps: 8 });
  await page.mouse.up();
  await expect(canvas).toBeVisible();
  const erased = await canvas.evaluate((element) => {
    const pixels = element.getContext("2d").getImageData(0, 0, element.width, element.height).data;
    let transparent = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] === 0) transparent++;
    return transparent / (pixels.length / 4);
  });
  expect(erased).toBeGreaterThan(.02);
  expect(erased).toBeLessThan(.5);
  await page.screenshot({ path: testInfo.outputPath("mobile-scratching.png"), fullPage: true });
  await page.mouse.move(rect.x + 8, rect.y + 8);
  await page.mouse.down();
  for (let index = 1; index < 5; index++) {
    await page.mouse.move(rect.x + rect.width - 8, rect.y + rect.height * index / 5, { steps: 8 });
    await page.mouse.move(rect.x + 8, rect.y + rect.height * index / 5, { steps: 8 });
  }
  await page.mouse.up();
  await expect(page.locator(".scratch-cell-shell.revealed")).toHaveCount(1);
});
