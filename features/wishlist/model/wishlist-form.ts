import type {
  WishlistFormValues,
  WishlistInput,
  WishlistItem,
} from "@/features/wishlist/types";

export const initialWishlistForm: WishlistFormValues = {
  category: "",
  desireLevel: 3,
  imagePath: "",
  imageUrl: "",
  memo: "",
  price: "",
  title: "",
  url: "",
};

const defaultCategoryOptions = [
  "ガジェット",
  "ファッション",
  "コスメ",
  "インテリア",
  "本・文具",
  "その他",
];

export function getWishlistCategoryOptions(currentCategory: string) {
  return currentCategory && !defaultCategoryOptions.includes(currentCategory)
    ? [currentCategory, ...defaultCategoryOptions]
    : defaultCategoryOptions;
}

export function createWishlistFormFromItem(
  item: WishlistItem,
): WishlistFormValues {
  return {
    category: item.category ?? "",
    desireLevel: item.desire_level ?? 3,
    imagePath: item.image_path ?? "",
    imageUrl: item.image_url ?? "",
    memo: item.memo ?? "",
    price: item.price === null ? "" : String(item.price),
    title: item.title,
    url: item.url ?? "",
  };
}

export function createWishlistInput(
  form: WishlistFormValues,
  imagePath = form.imagePath,
): WishlistInput {
  return {
    category: form.category.trim(),
    desire_level: form.desireLevel ?? 3,
    image_path: imagePath,
    memo: form.memo.trim(),
    price: form.price.trim(),
    title: form.title.trim(),
    url: form.url.trim(),
  };
}
