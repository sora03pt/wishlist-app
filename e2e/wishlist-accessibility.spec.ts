import { expect, test } from "@playwright/test";
import { expectNoAutomatedAccessibilityViolations } from "./support/accessibility";
import {
  createWishlistItem,
  openLoggedInWishlist,
} from "./support/wishlist";

test("Login画面に重大な自動検出a11y違反がない", async ({ page }) => {
  await page.goto("/login");

  await expectNoAutomatedAccessibilityViolations(page);
});

test("Wishlistの代表状態にsemantic構造と重大なa11y違反がない", async ({
  page,
}) => {
  await openLoggedInWishlist(page, "accessibility@example.com");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 2, name: "欲しいものを追加" }),
  ).toBeAttached();
  await expect(
    page.getByRole("heading", { level: 2, name: "欲しいもの一覧" }),
  ).toBeVisible();
  await expect(page.getByLabel("商品名")).toBeVisible();
  await expect(page.getByLabel("価格")).toBeVisible();
  await expect(page.getByLabel("URL")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "カテゴリ" })).toBeVisible();
  await expect(page.getByRole("group", { name: "欲しいレベル" }))
    .toBeVisible();
  await expect(page.getByLabel("画像")).toBeAttached();
  await expect(page.getByLabel("メモ")).toBeVisible();
  await expectNoAutomatedAccessibilityViolations(page);

  await page.getByLabel("商品名").fill("入力中の商品");
  await page.getByLabel("メモ").fill("検討中の入力状態");
  await expectNoAutomatedAccessibilityViolations(page);

  const item = await createWishlistItem(page, "アクセシビリティ確認商品");
  await expect(page.getByRole("list")).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(item).toBeVisible();
  await expectNoAutomatedAccessibilityViolations(page);

  await item.getByRole("button", { name: "編集" }).click();
  await expect(
    page.getByRole("dialog", { name: "欲しいものを編集" }),
  ).toBeVisible();
  await expectNoAutomatedAccessibilityViolations(page);
});
