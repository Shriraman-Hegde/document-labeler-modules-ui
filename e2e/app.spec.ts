import { expect, test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePng = path.join(__dirname, "fixtures/tiny.png");

test.describe("digitizer modules UI", () => {
  test("renders brand and capture shell", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Digitizer", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Capture the paper/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Scan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Relate" })).toBeVisible();
  });

  test("relate shows mocked API JSON", async ({ page }) => {
    await page.route("**/v1/relate?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ relations: [{ from: "a", to: "b" }], checks: [] }),
      });
    });

    await page.goto("/?api=http://127.0.0.1:8091");
    await page.getByRole("button", { name: "Relate" }).click();
    await expect(page.getByText("Relations loaded.")).toBeVisible();
    await expect(page.locator("result-panel pre")).toContainText('"from": "a"');
  });

  test("scan uploads file against mocked API", async ({ page }) => {
    await page.route("**/v1/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          documents: [
            {
              type: "invoice",
              mode: "known_dynamic",
              rescan: false,
              message: "labelled as invoice mode=known_dynamic",
            },
          ],
        }),
      });
    });

    await page.goto("/?api=http://127.0.0.1:8091");
    await page.locator('input[type="file"]').setInputFiles(fixturePng);
    await expect(page.getByText("File selected — press Scan.")).toBeVisible();
    await page.getByRole("button", { name: "Scan" }).click();
    await expect(page.getByRole("status")).toHaveText("labelled as invoice mode=known_dynamic");
    await expect(page.locator("result-panel pre")).toContainText('"type": "invoice"');
  });
});
