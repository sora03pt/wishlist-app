import { expect, type Page } from "@playwright/test";

const mockSessionKey = "wishlist-app:mock-session";

export async function openLoggedInWishlist(
  page: Page,
  email = "playwright@example.com",
) {
  await page.goto("/login");
  await page.evaluate(
    ({ sessionKey, sessionEmail }) => {
      window.localStorage.clear();
      window.localStorage.setItem(
        sessionKey,
        JSON.stringify({ email: sessionEmail }),
      );
    },
    { sessionEmail: email, sessionKey: mockSessionKey },
  );
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "欲しいものリスト" }),
  ).toBeVisible();
  await expect(page.getByText("欲しいものがまだありません。"))
    .toBeVisible();
}

export async function loginThroughMockUi(
  page: Page,
  email = "playwright-login@example.com",
) {
  const loginForm = page.locator("form");

  await loginForm.getByLabel("メールアドレス").fill(email);
  await loginForm.getByLabel("パスワード").fill("playwright-password");
  await loginForm.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "欲しいものリスト" }),
  ).toBeVisible();
}

export async function createWishlistItem(page: Page, title: string) {
  await page.getByLabel("商品名").fill(title);
  await page.getByRole("button", { name: "追加する" }).click();

  const item = page.getByRole("listitem").filter({ hasText: title });
  await expect(item).toBeVisible();
  return item;
}
