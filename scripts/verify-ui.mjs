import { chromium } from "playwright";

const root = process.cwd();
const desktopPath = `${root}/.tmp-orchid-desktop.png`;
const mobilePath = `${root}/.tmp-orchid-mobile.png`;
const societiesPath = `${root}/.tmp-orchid-societies.png`;
const eventsPath = `${root}/.tmp-orchid-events.png`;

const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await desktop.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle", timeout: 30000 });
  await desktop.screenshot({ path: desktopPath, fullPage: true });

  const title = await desktop.locator("h1").first().innerText();
  const navCount = await desktop.locator(".stitch-nav-item").count();
  const cardCount = await desktop.locator(".stitch-card").count();

  const primaryNav = desktop.getByLabel("Primary");

  await primaryNav.getByRole("button", { name: "Societies", exact: true }).click();
  await desktop.screenshot({ path: societiesPath, fullPage: true });
  const societiesTitle = await desktop.locator("h1").first().innerText();
  await desktop.locator('button:has-text("Join Society")').first().click();
  const joinBlockedVisible = await desktop.getByText(/Join blocked/).first().isVisible();

  await primaryNav.getByRole("button", { name: "Events", exact: true }).click();
  await desktop.screenshot({ path: eventsPath, fullPage: true });
  const eventsTitle = await desktop.locator("h1").first().innerText();
  await desktop.getByRole("button", { name: "RSVP Now", exact: true }).first().click();
  const cancelVisible = await desktop.getByRole("button", { name: "RSVP confirmed", exact: true }).first().isVisible();

  await primaryNav.getByRole("button", { name: "Forums", exact: true }).click();
  await desktop.getByLabel("Thread title").fill("Who is joining the Heathrow arrival group?");
  await desktop.getByRole("button", { name: "Publish Thread", exact: true }).click();
  const newThreadVisible = await desktop.getByText("Who is joining the Heathrow arrival group?").first().isVisible();

  await desktop.getByRole("button", { name: "Submit Reimbursement", exact: true }).click();
  await desktop.getByLabel("Purpose").fill("Community welcome snacks");
  await desktop.getByLabel("Amount").fill("24.80");
  await desktop.getByRole("button", { name: "Submit Claim", exact: true }).click();
  const newClaimVisible = await desktop.getByText("Community welcome snacks").first().isVisible();
  await desktop.getByLabel("Update Arielle Tan claim status").selectOption("approved");
  const approvedVisible = await desktop.getByLabel("Update Arielle Tan claim status").inputValue() === "approved";

  const mobile = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await mobile.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle", timeout: 30000 });
  await mobile.screenshot({ path: mobilePath, fullPage: true });
  const mobileNavVisible = await mobile.locator(".mobile-tabs").isVisible();

  console.log(
    JSON.stringify(
      {
        title,
        societiesTitle,
        eventsTitle,
        navCount,
        cardCount,
        joinBlockedVisible,
        cancelVisible,
        newThreadVisible,
        newClaimVisible,
        approvedVisible,
        mobileNavVisible,
        desktopPath,
        societiesPath,
        eventsPath,
        mobilePath
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
