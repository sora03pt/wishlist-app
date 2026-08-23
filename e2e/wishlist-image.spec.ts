import path from "node:path";
import { expect, test } from "@playwright/test";
import { openLoggedInWishlist } from "./support/wishlist";

test("画像をWebPへ変換してpreviewと商品画像へ反映する", async ({
  page,
}) => {
  await openLoggedInWishlist(page, "image@example.com");

  const title = "ポータブルスピーカー";
  const imageInput = page.getByLabel("画像");
  await imageInput.setInputFiles(
    path.resolve("e2e/fixtures/wishlist-item.svg"),
  );

  await expect(page.getByText("選択済み。タップして変更")).toBeVisible();
  const preview = page.locator('form img[alt=""]');
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("src", /^blob:/);

  await page.getByLabel("商品名").fill(title);
  await page.getByRole("button", { name: "追加する" }).click();

  const item = page.getByRole("listitem").filter({ hasText: title });
  await expect(item.getByRole("img", { name: title })).toBeVisible();

  const storedWishlist = await page.evaluate(() =>
    Object.entries(window.localStorage).find(([key]) =>
      key.startsWith("wishlist-app:mock-items:"),
    )?.[1],
  );
  expect(storedWishlist).toContain("data:image/webp");
});
