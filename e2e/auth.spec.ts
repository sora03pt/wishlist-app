import { expect, test } from "@playwright/test";
import { loginThroughMockUi } from "./support/wishlist";

test("未認証ユーザーをログインへ誘導しmock認証できる", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "ログイン" }),
  ).toBeVisible();
  await expect(page.getByText("ローカルモック", { exact: true })).toBeVisible();

  await loginThroughMockUi(page);

  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("wishlist-app:mock-session"),
      ),
    )
    .toContain("playwright-login@example.com");
});
