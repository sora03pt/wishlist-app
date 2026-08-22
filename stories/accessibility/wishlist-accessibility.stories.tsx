import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  FoundationPage,
  FoundationSection,
} from "../foundations/foundation-layout";

const decisions = [
  {
    criterion: "1.3.1 / 2.1.1 / 2.4.7 / 4.1.2",
    decision:
      "独自button群ではなく、fieldset・legend・native radioを使う。",
    implementation:
      "Tabではgroupへ1回だけ入り、矢印キーで値を変更する。focus ringと星の塗りで状態を示す。",
    issue: "StarRatingの意味・選択値・keyboard操作が支援技術へ伝わらない",
    manual:
      "VoiceOverでgroup名、現在値、選択変更の読み上げと矢印キー操作を確認する。",
    severity: "Serious",
  },
  {
    criterion: "1.3.1 / 3.3.1 / 3.3.2 / 3.3.3",
    decision:
      "商品名をnative requiredにし、見えるlabel、エラー本文、controlをIDで関連付ける。",
    implementation:
      "aria-invalidとaria-describedbyを設定し、空送信時は商品名へfocusを戻す。",
    issue: "必須項目とForm Errorの対象がprogrammatically determinableでない",
    manual:
      "空送信時にエラーが一度通知され、商品名へfocusが移ることを確認する。",
    severity: "Serious",
  },
  {
    criterion: "1.4.3 / 1.4.11 / 2.4.7",
    decision:
      "淡いブランド色は面に残し、情報を担うfocus・control border・小さいaccent textだけ濃くする。",
    implementation:
      "focus 6.038:1、control border 3.616:1、accent emphasis 6.038:1へ更新した。",
    issue: "focus indicator、input境界、小さいaccent textが必要contrastを満たさない",
    manual:
      "surface、selected surface、app background上でfocus ringが連続して見えることを確認する。",
    severity: "Serious",
  },
  {
    criterion: "1.1.1",
    decision:
      "一覧画像は商品識別を補うため商品名をaltにする。フォームpreviewは重複情報のため装飾扱いにする。",
    implementation:
      "WishlistCardはalt={item.title}、ImageDropzone previewはalt=\"\"を維持し選択状態をテキスト化した。",
    issue: "用途の異なる画像に同じ空altが使われている",
    manual:
      "画像あり・なしのカードを読み上げ、商品名が不自然に重複しないか確認する。",
    severity: "Serious",
  },
  {
    criterion: "4.1.3",
    decision:
      "待機・成功はrole=status、失敗はrole=alertとし、spinner自体は装飾にする。",
    implementation:
      "登録・更新・削除・再取得の開始と完了を共通live regionへ通知する。uploadはDropzone内だけで通知する。",
    issue: "非同期処理の開始・成功がfocusを動かさず更新されるが通知されない",
    manual:
      "各操作で重複通知がなく、errorだけが割り込み通知になることを確認する。",
    severity: "Moderate",
  },
  {
    criterion: "2.1.2 / 2.4.3 / 2.4.11 / 4.1.2",
    decision:
      "focus trap・Escape・Dialog semanticsはRadixに委ね、Triggerが別ツリーのfocus復帰だけ補う。",
    implementation:
      "閉じる、Escape、キャンセル後に対応する編集buttonへfocusを戻す。TitleとDescriptionを維持する。",
    issue: "controlled Dialogを閉じた後のfocus復帰先を保証できない",
    manual:
      "開閉、Tab循環、Escape、スクロール時にfocusが隠れないことを確認する。",
    severity: "Moderate",
  },
  {
    criterion: "1.3.1 / 2.4.6",
    decision:
      "画面の主題をh1、追加・一覧をh2、各商品をh3として構造化する。",
    implementation:
      "CardTitleをasChild対応し、見た目を変えずページごとのheading levelを指定した。",
    issue: "LoginとWishlist一覧の見出しlevelが文書構造と一致しない",
    manual:
      "heading navigationでページ構造を順番に移動できることを確認する。",
    severity: "Moderate",
  },
] as const;

function WishlistAccessibilityNotes() {
  return (
    <FoundationPage
      description="自動検査だけで準拠を宣言せず、Issue、基準、判断、実装、手動確認を一つの記録として残します。"
      title="Wishlist Accessibility Review"
    >
      <FoundationSection
        description="axeで検出できる問題はStorybook addonをerror設定で確認します。keyboard、focus復帰、読み上げ品質は手動確認を残します。"
        title="WCAG 2.2 AA decisions"
      >
        <div className="grid gap-4">
          {decisions.map((decision) => (
            <article
              className="rounded-control border border-border bg-surface p-4 sm:p-5"
              key={decision.issue}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-destructive-surface px-2.5 py-1 text-xs font-bold text-destructive">
                  {decision.severity}
                </span>
                <h2 className="font-semibold leading-6">{decision.issue}</h2>
              </div>
              <dl className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
                <div>
                  <dt className="font-bold">WCAG criterion</dt>
                  <dd className="text-muted-foreground">
                    {decision.criterion}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Decision</dt>
                  <dd className="text-muted-foreground">
                    {decision.decision}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Implementation</dt>
                  <dd className="text-muted-foreground">
                    {decision.implementation}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Manual check</dt>
                  <dd className="text-muted-foreground">{decision.manual}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </FoundationSection>
      <FoundationSection
        description="自動検査の通過は、実際の支援技術で意味が伝わることを保証しません。"
        title="Verification boundary"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          project側でaddonのruleを無効化せず、WCAG 2.0 / 2.1 / 2.2 AAとbest practiceのtagを対象にします。VoiceOverの読み上げ文言と複数browserでのfocus挙動は継続確認項目として扱います。
        </p>
      </FoundationSection>
    </FoundationPage>
  );
}

const meta = {
  component: WishlistAccessibilityNotes,
  parameters: { layout: "fullscreen" },
  title: "Features/Wishlist/Accessibility Review",
} satisfies Meta<typeof WishlistAccessibilityNotes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Review: Story = {};
