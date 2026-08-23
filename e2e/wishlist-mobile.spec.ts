import { expect, test } from "@playwright/test";
import { openLoggedInWishlist } from "./support/wishlist";

test("@mobile スマホ幅で登録・購入状態変更・削除を完了できる", async ({
  page,
}) => {
  await openLoggedInWishlist(page, "mobile@example.com");
  expect(page.viewportSize()?.width).toBeLessThanOrEqual(500);

  const title = "モバイルバッテリー";
  await page.getByLabel("商品名").fill(title);
  await page.getByLabel("価格").fill("6500");
  await page.getByRole("button", { name: "追加する" }).click();

  const item = page.getByRole("listitem").filter({ hasText: title });
  await expect(item).toBeVisible();
  await item.getByRole("button", { name: "購入済みにする" }).click();
  await expect(
    item.getByRole("button", { name: "未購入に戻す" }),
  ).toBeEnabled();

  await item.getByRole("button", { name: `${title}を削除` }).click();
  await expect(item).toBeHidden();
  await expect(page.getByText("欲しいものがまだありません。"))
    .toBeVisible();
});
