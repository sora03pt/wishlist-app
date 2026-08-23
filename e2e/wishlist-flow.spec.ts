import { expect, test } from "@playwright/test";
import { openLoggedInWishlist } from "./support/wishlist";

test("商品名エラーを入力欄へ関連付けてfocusする", async ({ page }) => {
  await openLoggedInWishlist(page, "validation@example.com");

  const titleInput = page.getByLabel("商品名");
  await page.getByRole("button", { name: "追加する" }).click();

  const error = page.getByRole("alert").filter({
    hasText: "商品名を入力してください。",
  });
  await expect(error).toBeVisible();
  await expect(titleInput).toHaveAttribute("aria-invalid", "true");
  await expect(titleInput).toBeFocused();

  const describedBy = await titleInput.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy}`)).toHaveText(
    "商品名を入力してください。",
  );
});

test("キーボード入力を含むWishlistの主要CRUDを完了できる", async ({
  page,
}) => {
  await openLoggedInWishlist(page, "crud@example.com");

  const originalTitle = "ワイヤレスヘッドホン";
  const updatedTitle = "ノイズキャンセリングヘッドホン";
  await page.getByLabel("商品名").fill(originalTitle);
  await page.getByLabel("価格").fill("29800");
  await page.getByLabel("URL").fill("https://example.com/headphones");
  await page.getByLabel("メモ").fill("通勤用に比較する");

  const category = page.getByRole("combobox", { name: "カテゴリ" });
  await category.focus();
  await category.press("Enter");
  await page.getByRole("option", { name: "ガジェット" }).press("Enter");
  await expect(category).toContainText("ガジェット");

  await category.press("Tab");
  const threeStars = page.getByRole("radio", { name: "3つ星" });
  const fourStars = page.getByRole("radio", { name: "4つ星" });
  await expect(threeStars).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(fourStars).toBeChecked();
  await expect(page.getByText("4 / 5", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "追加する" }).click();
  await expect(page.getByRole("button", { name: "登録中" })).toBeDisabled();
  await expect(
    page.getByRole("status").filter({ hasText: "欲しいものを登録しています。" }),
  ).toBeAttached();

  let item = page.getByRole("listitem").filter({ hasText: originalTitle });
  await expect(item).toBeVisible();
  await expect(item).toContainText("29,800円");
  await expect(item).toContainText("ガジェット");
  await expect(item.getByRole("img", { name: "4 / 5" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(1);

  const editButton = item.getByRole("button", { name: "編集" });
  await editButton.click();
  let dialog = page.getByRole("dialog", { name: "欲しいものを編集" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("商品名")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(editButton).toBeFocused();

  await editButton.click();
  dialog = page.getByRole("dialog", { name: "欲しいものを編集" });
  await dialog.getByLabel("商品名").fill(updatedTitle);
  await dialog.getByLabel("メモ").fill("長時間利用のレビューを確認する");
  await dialog.getByRole("button", { name: "保存" }).click();
  await expect(dialog.getByRole("button", { name: "保存中" })).toBeDisabled();
  await expect(dialog).toBeHidden();

  item = page.getByRole("listitem").filter({ hasText: updatedTitle });
  await expect(item).toContainText("長時間利用のレビューを確認する");
  await expect(item.getByRole("button", { name: "編集" })).toBeFocused();

  const purchaseButton = item.getByRole("button", {
    name: "購入済みにする",
  });
  await purchaseButton.click();
  await expect(purchaseButton).toBeDisabled();
  await expect(
    page.getByRole("status").filter({
      hasText: `${updatedTitle}を購入済みに更新しています。`,
    }),
  ).toBeAttached();
  await expect(
    item.getByRole("button", { name: "未購入に戻す" }),
  ).toBeEnabled();

  const deleteButton = item.getByRole("button", {
    name: `${updatedTitle}を削除`,
  });
  await deleteButton.click();
  await expect(deleteButton).toBeDisabled();
  await expect(
    page.getByRole("status").filter({ hasText: `${updatedTitle}を削除しています。` }),
  ).toBeAttached();
  await expect(item).toBeHidden();
  await expect(page.getByText("欲しいものがまだありません。"))
    .toBeVisible();
});
