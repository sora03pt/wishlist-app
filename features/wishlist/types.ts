export type WishlistItemId = number | string;

export type WishlistItem = {
  id: WishlistItemId;
  title: string;
  price: number | null;
  url: string | null;
  image_url: string | null;
  image_path: string | null;
  memo: string | null;
  category: string | null;
  desire_level: number | null;
  completed: boolean;
  created_at: string;
};

export type WishlistInput = {
  title: string;
  price: string;
  url: string;
  image_path: string;
  memo: string;
  category: string;
  desire_level: number;
};

export type WishlistFormValues = {
  title: string;
  price: string;
  url: string;
  imageUrl: string;
  imagePath: string;
  category: string;
  desireLevel: number;
  memo: string;
};

export type UpdateWishlistForm = <Field extends keyof WishlistFormValues>(
  field: Field,
  value: WishlistFormValues[Field],
) => void;

export type WishlistGetStatus = "idle" | "initial" | "refreshing";
