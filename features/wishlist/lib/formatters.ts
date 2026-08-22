export function formatPrice(price: number | null) {
  if (price === null) {
    return "価格未設定";
  }

  return `${new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 0,
  }).format(price)}円`;
}

export function formatDesireLevel(desireLevel: number | null) {
  return typeof desireLevel === "number" && !Number.isNaN(desireLevel)
    ? `${desireLevel} / 5`
    : "未設定";
}

export function getValidDesireLevel(desireLevel: number | null) {
  return typeof desireLevel === "number" &&
    !Number.isNaN(desireLevel) &&
    desireLevel >= 1 &&
    desireLevel <= 5
    ? desireLevel
    : null;
}

export function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
