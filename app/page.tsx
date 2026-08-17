"use client";

import Image from "next/image";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Check,
  ExternalLink,
  ImagePlus,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WishlistItem = {
  id: number | string;
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

type WishlistForm = {
  title: string;
  price: string;
  url: string;
  imageUrl: string;
  imagePath: string;
  category: string;
  desireLevel: number;
  memo: string;
};

type GetStatus = "idle" | "initial" | "refreshing";

const initialForm: WishlistForm = {
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

function getCategoryOptions(currentCategory: string) {
  return currentCategory && !defaultCategoryOptions.includes(currentCategory)
    ? [currentCategory, ...defaultCategoryOptions]
    : defaultCategoryOptions;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeWishlistItem(value: unknown): WishlistItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    title,
    price,
    url,
    image_url: imageUrl,
    image_path: imagePath,
    memo,
    category,
    desire_level: desireLevel,
    completed,
    created_at: createdAt,
  } = value;

  if (
    (typeof id !== "number" && typeof id !== "string") ||
    typeof title !== "string" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }

  const normalizedPrice =
    typeof price === "number"
      ? price
      : typeof price === "string" && price.trim()
        ? Number(price)
        : null;
  const normalizedDesireLevel =
    typeof desireLevel === "number"
      ? desireLevel
      : typeof desireLevel === "string" && desireLevel.trim()
        ? Number(desireLevel)
        : null;

  return {
    category: typeof category === "string" ? category : null,
    completed: completed === true,
    created_at: createdAt,
    desire_level:
      normalizedDesireLevel === null || Number.isNaN(normalizedDesireLevel)
        ? null
        : normalizedDesireLevel,
    id,
    image_path: typeof imagePath === "string" ? imagePath : null,
    image_url: typeof imageUrl === "string" ? imageUrl : null,
    memo: typeof memo === "string" ? memo : null,
    price:
      normalizedPrice === null || Number.isNaN(normalizedPrice)
        ? null
        : normalizedPrice,
    title,
    url: typeof url === "string" ? url : null,
  };
}

function compareWishlistItemsByDesireLevel(
  firstItem: WishlistItem,
  secondItem: WishlistItem,
) {
  const firstDesireLevel = firstItem.desire_level ?? 0;
  const secondDesireLevel = secondItem.desire_level ?? 0;

  if (firstDesireLevel !== secondDesireLevel) {
    return secondDesireLevel - firstDesireLevel;
  }

  return (
    new Date(secondItem.created_at).getTime() -
    new Date(firstItem.created_at).getTime()
  );
}

function getApiErrorMessage(value: unknown, fallbackMessage: string) {
  if (
    isRecord(value) &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return fallbackMessage;
}

async function readJsonResponse(
  response: Response,
  fallbackMessage: string,
): Promise<unknown> {
  let result: unknown = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, fallbackMessage));
  }

  return result;
}

async function requestWishlistItems() {
  const response = await fetch("/api/todos", {
    cache: "no-store",
  });
  const result = await readJsonResponse(
    response,
    "欲しいものリストの取得に失敗しました。",
  );

  const wishlistItems = Array.isArray(result)
    ? result.flatMap((value) => {
        const item = normalizeWishlistItem(value);
        return item ? [item] : [];
      })
    : [];

  return wishlistItems.sort(compareWishlistItemsByDesireLevel);
}

function formatPrice(price: number | null) {
  if (price === null) {
    return "価格未設定";
  }

  return `${new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 0,
  }).format(price)}円`;
}

function formatDesireLevel(desireLevel: number | null) {
  return typeof desireLevel === "number" && !Number.isNaN(desireLevel)
    ? `${desireLevel} / 5`
    : "未設定";
}

function getValidDesireLevel(desireLevel: number | null) {
  return typeof desireLevel === "number" &&
    !Number.isNaN(desireLevel) &&
    desireLevel >= 1 &&
    desireLevel <= 5
    ? desireLevel
    : null;
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const maxSourceImageSize = 20 * 1024 * 1024;
const optimizedImageMaxDimension = 1200;
const optimizedImageQuality = 0.85;

type UploadedWishlistImage = {
  imagePath: string;
  imageUrl: string;
};

function getOptimizedImageFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim() || "wishlist-image";

  return `${baseName}.webp`;
}

function createImageBlobFromCanvas(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("画像の変換に失敗しました。"));
      },
      type,
      quality,
    );
  });
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = document.createElement("img");

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("画像を読み込めませんでした。"));
    };
    image.src = objectUrl;
  });
}

async function optimizeWishlistImage(file: File) {
  const image = await loadImageElement(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("画像を読み込めませんでした。");
  }

  const scale = Math.min(
    1,
    optimizedImageMaxDimension / Math.max(sourceWidth, sourceHeight),
  );
  const canvasWidth = Math.round(sourceWidth * scale);
  const canvasHeight = Math.round(sourceHeight * scale);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("画像の変換に失敗しました。");
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.drawImage(image, 0, 0, sourceWidth, sourceHeight, 0, 0, canvasWidth, canvasHeight);

  const blob = await createImageBlobFromCanvas(
    canvas,
    "image/webp",
    optimizedImageQuality,
  );

  return new File([blob], getOptimizedImageFileName(file.name), {
    lastModified: Date.now(),
    type: "image/webp",
  });
}

async function uploadWishlistImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads", {
    body: formData,
    method: "POST",
  });
  const result = await readJsonResponse(
    response,
    "画像のアップロードに失敗しました。",
  );

  if (
    isRecord(result) &&
    "image_url" in result &&
    typeof result.image_url === "string" &&
    "image_path" in result &&
    typeof result.image_path === "string"
  ) {
    return {
      imagePath: result.image_path,
      imageUrl: result.image_url,
    } satisfies UploadedWishlistImage;
  }

  throw new Error("画像のアップロードに失敗しました。");
}

function createWishlistFormFromItem(item: WishlistItem): WishlistForm {
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

export default function Home() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [form, setForm] = useState<WishlistForm>(initialForm);
  const [editForm, setEditForm] = useState<WishlistForm>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState("");
  const [getStatus, setGetStatus] = useState<GetStatus>("initial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<WishlistItem["id"] | null>(null);
  const [updatingId, setUpdatingId] = useState<WishlistItem["id"] | null>(null);
  const [editingId, setEditingId] = useState<WishlistItem["id"] | null>(null);
  const [savingEditId, setSavingEditId] = useState<
    WishlistItem["id"] | null
  >(null);
  const [uploadingImageId, setUploadingImageId] = useState<
    WishlistItem["id"] | "new" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedTitle = form.title.trim();
  const trimmedEditTitle = editForm.title.trim();
  const desireLevel = form.desireLevel ?? 3;
  const editDesireLevel = editForm.desireLevel ?? 3;
  const isInitialLoading = getStatus === "initial";
  const isRefreshing = getStatus === "refreshing";
  const hasActiveEdit = editingId !== null;
  const hasItemMutation =
    deletingId !== null ||
    updatingId !== null ||
    savingEditId !== null ||
    uploadingImageId !== null;
  const canSubmit = trimmedTitle.length > 0 && !isSubmitting && !hasActiveEdit;
  const purchasedCount = useMemo(
    () => items.filter((item) => item.completed).length,
    [items],
  );
  const unpurchasedCount = items.length - purchasedCount;
  const priceTotals = useMemo(
    () =>
      items.reduce(
        (totals, item) => {
          const price = item.price ?? 0;

          if (item.completed) {
            return {
              ...totals,
              purchased: totals.purchased + price,
            };
          }

          return {
            ...totals,
            unpurchased: totals.unpurchased + price,
          };
        },
        { purchased: 0, unpurchased: 0 },
      ),
    [items],
  );

  const fetchWishlistItems = useCallback(async () => {
    setGetStatus("refreshing");
    setErrorMessage("");

    try {
      setItems(await requestWishlistItems());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "欲しいものリストの取得に失敗しました。",
      );
    } finally {
      setGetStatus("idle");
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialItems() {
      try {
        const nextItems = await requestWishlistItems();

        if (isActive) {
          setItems(nextItems);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "欲しいものリストの取得に失敗しました。",
          );
        }
      } finally {
        if (isActive) {
          setGetStatus("idle");
        }
      }
    }

    void loadInitialItems();

    return () => {
      isActive = false;
    };
  }, []);

  function updateForm<Field extends keyof WishlistForm>(
    field: Field,
    value: WishlistForm[Field],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function updateEditForm<Field extends keyof WishlistForm>(
    field: Field,
    value: WishlistForm[Field],
  ) {
    setEditForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function clearImagePreview() {
    setImageFile(null);
    setImagePreviewUrl("");
    updateForm("imagePath", "");
    updateForm("imageUrl", "");
  }

  function clearEditImagePreview() {
    setEditImageFile(null);
    setEditImagePreviewUrl("");
    updateEditForm("imagePath", "");
    updateEditForm("imageUrl", "");
  }

  async function selectImageFile(file: File, mode: "create" | "edit") {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選択してください。");
      return;
    }

    if (file.size > maxSourceImageSize) {
      setErrorMessage("画像は20MB以下にしてください。");
      return;
    }

    let optimizedFile: File;

    try {
      optimizedFile = await optimizeWishlistImage(file);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "画像の変換に失敗しました。",
      );
      return;
    }

    const previewUrl = URL.createObjectURL(optimizedFile);

    setErrorMessage("");

    if (mode === "create") {
      setImageFile(optimizedFile);
      setImagePreviewUrl(previewUrl);
      updateForm("imagePath", "");
      updateForm("imageUrl", "");
      return;
    }

    setEditImageFile(optimizedFile);
    setEditImagePreviewUrl(previewUrl);
    updateEditForm("imagePath", "");
    updateEditForm("imageUrl", "");
  }

  function handleStartEdit(item: WishlistItem) {
    if (hasItemMutation) {
      return;
    }

    setEditingId(item.id);
    setEditForm(createWishlistFormFromItem(item));
    setEditImageFile(null);
    setEditImagePreviewUrl(item.image_url ?? "");
    setErrorMessage("");
  }

  function handleCancelEdit() {
    if (savingEditId !== null) {
      return;
    }

    setEditingId(null);
    setEditForm(initialForm);
    setEditImageFile(null);
    setEditImagePreviewUrl("");
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!trimmedTitle) {
      setErrorMessage("商品名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let imageUrl = form.imageUrl;
      let imagePath = form.imagePath;

      if (imageFile) {
        setUploadingImageId("new");
        const uploadedImage = await uploadWishlistImage(imageFile);
        imagePath = uploadedImage.imagePath;
        imageUrl = uploadedImage.imageUrl;
      }

      const response = await fetch("/api/todos", {
        body: JSON.stringify({
          category: form.category.trim(),
          desire_level: desireLevel,
          image_path: imagePath,
          image_url: imageUrl,
          memo: form.memo.trim(),
          price: form.price.trim(),
          title: trimmedTitle,
          url: form.url.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      await readJsonResponse(response, "欲しいものの登録に失敗しました。");

      setForm(initialForm);
      setImageFile(null);
      setImagePreviewUrl("");
      await fetchWishlistItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "欲しいものの登録に失敗しました。",
      );
    } finally {
      setUploadingImageId(null);
      setIsSubmitting(false);
    }
  }

  async function handleTogglePurchased(item: WishlistItem) {
    if (deletingId !== null || updatingId !== null || savingEditId !== null) {
      return;
    }

    setUpdatingId(item.id);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/todos/${encodeURIComponent(String(item.id))}`,
        {
          body: JSON.stringify({ completed: !item.completed }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
        },
      );

      await readJsonResponse(response, "購入状態の更新に失敗しました。");
      await fetchWishlistItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "購入状態の更新に失敗しました。",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(itemId: WishlistItem["id"]) {
    if (deletingId !== null || updatingId !== null || savingEditId !== null) {
      return;
    }

    setDeletingId(itemId);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/todos?id=${encodeURIComponent(String(itemId))}`,
        {
          method: "DELETE",
        },
      );

      await readJsonResponse(response, "欲しいものの削除に失敗しました。");
      await fetchWishlistItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "欲しいものの削除に失敗しました。",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null || savingEditId !== null) {
      return;
    }

    if (!trimmedEditTitle) {
      setErrorMessage("商品名を入力してください。");
      return;
    }

    setSavingEditId(editingId);
    setErrorMessage("");

    try {
      let imageUrl = editForm.imageUrl;
      let imagePath = editForm.imagePath;

      if (editImageFile) {
        setUploadingImageId(editingId);
        const uploadedImage = await uploadWishlistImage(editImageFile);
        imagePath = uploadedImage.imagePath;
        imageUrl = uploadedImage.imageUrl;
      }

      const response = await fetch(
        `/api/todos/${encodeURIComponent(String(editingId))}`,
        {
          body: JSON.stringify({
            category: editForm.category.trim(),
            desire_level: editDesireLevel,
            image_path: imagePath,
            image_url: imageUrl,
            memo: editForm.memo.trim(),
            price: editForm.price.trim(),
            title: trimmedEditTitle,
            url: editForm.url.trim(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
        },
      );

      await readJsonResponse(response, "欲しいものの更新に失敗しました。");

      setEditingId(null);
      setEditForm(initialForm);
      setEditImageFile(null);
      setEditImagePreviewUrl("");
      await fetchWishlistItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "欲しいものの更新に失敗しました。",
      );
    } finally {
      setUploadingImageId(null);
      setSavingEditId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1f7,transparent_34%),linear-gradient(135deg,#fffafb_0%,#fbf7ff_48%,#ffffff_100%)] text-zinc-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
        <Card>
          <CardContent>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
            Wishlist
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="relative inline-block pb-2 text-3xl font-bold leading-tight sm:text-4xl">
                <span className="relative z-10 text-zinc-700">
                  欲しいものリスト
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-0 h-3 w-full rounded-full bg-gradient-to-r from-pink-200 via-pink-100 to-lavender-200 opacity-80"
                />
              </h1>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-600 sm:text-base">
                気になるものをまとめて管理
              </p>
            </div>
            <div className="grid w-full grid-cols-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 text-center text-xs font-bold text-zinc-700 sm:w-auto">
              <div className="px-3 py-2">
                <span className="block text-base text-zinc-950">
                  {items.length}
                </span>
                全件
              </div>
              <div className="border-x border-zinc-200 px-3 py-2">
                <span className="block text-base text-amber-700">
                  {unpurchasedCount}
                </span>
                未購入
              </div>
              <div className="px-3 py-2">
                <span className="block text-base text-pink-700">
                  {purchasedCount}
                </span>
                購入済み
              </div>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold text-zinc-500">
                未購入の合計金額
              </dt>
              <dd className="mt-1 text-xl font-bold text-amber-700">
                {formatPrice(priceTotals.unpurchased)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-zinc-500">
                購入済みの合計金額
              </dt>
              <dd className="mt-1 text-xl font-bold text-pink-700">
                {formatPrice(priceTotals.purchased)}
              </dd>
            </div>
          </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">
                商品名
              </span>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="例: ノイズキャンセリングイヤホン"
                value={form.title}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">価格</span>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                inputMode="numeric"
                min="0"
                onChange={(event) => updateForm("price", event.target.value)}
                placeholder="例: 19800"
                type="number"
                value={form.price}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">URL</span>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                onChange={(event) => updateForm("url", event.target.value)}
                placeholder="https://example.com/item"
                type="url"
                value={form.url}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                カテゴリ
              </span>
              <Select
                disabled={isSubmitting}
                onValueChange={(value) => updateForm("category", value)}
                value={form.category || undefined}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions(form.category).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div className="sm:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">
                欲しいレベル
              </span>
              <StarRating
                ariaLabel="欲しいレベル"
                disabled={isSubmitting}
                onChange={(nextLevel) => updateForm("desireLevel", nextLevel)}
                value={desireLevel}
              />
            </div>

            <ImageDropzone
              disabled={isSubmitting || uploadingImageId === "new"}
              imageUrl={imagePreviewUrl || form.imageUrl}
              isUploading={uploadingImageId === "new"}
              label="画像"
              onFileSelect={(file) => selectImageFile(file, "create")}
              onRemove={clearImagePreview}
            />

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">メモ</span>
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-pink-100 bg-white px-4 py-3 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSubmitting}
                onChange={(event) => updateForm("memo", event.target.value)}
                placeholder="サイズ、色、比較したいポイントなど"
                value={form.memo}
              />
            </label>
          </div>

          <Button
            className="mt-5 h-12 w-full rounded-2xl bg-zinc-950 text-base hover:bg-zinc-800"
            disabled={!canSubmit}
            type="submit"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={19} />
            ) : (
              <Plus size={19} />
            )}
            {isSubmitting ? "登録中" : "追加する"}
          </Button>
        </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CardTitle>欲しいもの一覧</CardTitle>
              {isRefreshing ? (
                <span className="text-xs font-bold text-zinc-500">
                  再取得中
                </span>
              ) : null}
            </div>
            <Button
              aria-label="欲しいものを再取得"
              size="icon"
              variant="outline"
              disabled={
                isInitialLoading ||
                isRefreshing ||
                isSubmitting ||
                hasItemMutation ||
                hasActiveEdit
              }
              onClick={() => void fetchWishlistItems()}
              title={isRefreshing ? "再取得中" : "再取得"}
              type="button"
            >
              <RefreshCw
                className={
                  isInitialLoading || isRefreshing ? "animate-spin" : undefined
                }
                size={18}
              />
            </Button>
          </div>
          </CardHeader>
          <CardContent>

          {errorMessage ? (
            <div
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-medium leading-6 text-rose-700"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            {isInitialLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-sm font-bold text-zinc-500">
                <Loader2 className="animate-spin" size={18} />
                読み込み中
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <WishlistCard
                  deletingId={deletingId}
                  editDesireLevel={editDesireLevel}
                  editForm={editForm}
                  editImagePreviewUrl={editImagePreviewUrl}
                  editingId={editingId}
                  item={item}
                  itemActionDisabled={
                    hasItemMutation ||
                    (editingId !== null && editingId !== item.id)
                  }
                  key={item.id}
                  onCancelEdit={handleCancelEdit}
                  onDelete={handleDelete}
                  onStartEdit={handleStartEdit}
                  onTogglePurchased={handleTogglePurchased}
                  onClearEditImage={clearEditImagePreview}
                  onSelectEditImage={(file) => selectImageFile(file, "edit")}
                  onUpdateEditForm={updateEditForm}
                  onUpdateItem={handleUpdateItem}
                  savingEditId={savingEditId}
                  uploadingImageId={uploadingImageId}
                  updatingId={updatingId}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm font-medium text-zinc-500">
                欲しいものがまだありません。
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ImageDropzone({
  disabled,
  imageUrl,
  isUploading,
  label,
  onFileSelect,
  onRemove,
}: {
  disabled: boolean;
  imageUrl: string;
  isUploading: boolean;
  label: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelect(file);
    }

    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    if (file) {
      onFileSelect(file);
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-semibold text-zinc-800">{label}</span>
      <label
        className={`mt-2 flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed px-5 py-6 text-center transition ${
          disabled
            ? "cursor-not-allowed border-pink-100 bg-zinc-50 text-zinc-400"
            : "border-pink-200 bg-white/80 text-zinc-600 hover:border-pink-300 hover:bg-pink-50/60"
        }`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={handleInputChange}
          type="file"
        />
        {imageUrl ? (
          <Image
            alt=""
            className="max-h-60 w-full rounded-[1.25rem] object-cover"
            height={1200}
            src={imageUrl}
            unoptimized
            width={1200}
          />
        ) : (
          <>
            <ImagePlus size={30} />
            <span className="text-sm font-bold">
              画像をドラッグ&ドロップ、またはタップして選択
            </span>
            <span className="text-xs font-medium text-zinc-500">
              PNG / JPG / WebP / GIF、20MBまで
            </span>
          </>
        )}
        {isUploading ? (
          <span className="inline-flex items-center gap-2 text-sm font-bold text-pink-700">
            <Loader2 className="animate-spin" size={16} />
            アップロード中
          </span>
        ) : null}
      </label>
      {imageUrl ? (
        <Button
          className="mt-3"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onRemove}
          type="button"
        >
          <X size={16} />
          画像を削除
        </Button>
      ) : null}
    </div>
  );
}

function StarRating({
  ariaLabel,
  disabled,
  onChange,
  value,
}: {
  ariaLabel: string;
  disabled: boolean;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className="mt-2 flex items-center gap-1" role="group" aria-label={ariaLabel}>
      {[1, 2, 3, 4, 5].map((level) => {
        const isSelected = level <= value;

        return (
          <Button
            aria-label={`${level}つ星`}
            className={`size-10 rounded-full p-0 ${
              isSelected
                ? "text-pink-500 hover:text-pink-600"
                : "text-pink-200 hover:text-pink-300"
            }`}
            disabled={disabled}
            key={level}
            onClick={() => onChange(level)}
            type="button"
            variant="ghost"
          >
            <Star
              className={isSelected ? "fill-current" : undefined}
              size={24}
            />
          </Button>
        );
      })}
      <span className="ml-2 text-sm font-bold text-lavender-700">
        {value} / 5
      </span>
    </div>
  );
}

function StarRatingDisplay({ value }: { value: number | null }) {
  const desireLevel = getValidDesireLevel(value);

  if (desireLevel === null) {
    return (
      <span
        aria-label="欲しい度 未設定"
        className="inline-flex items-center gap-0.5 text-zinc-300"
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <Star key={level} size={17} />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-label={formatDesireLevel(desireLevel)}
      className="inline-flex items-center gap-0.5 text-pink-500"
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <Star
          className={level <= desireLevel ? "fill-current" : "text-pink-200"}
          key={level}
          size={17}
        />
      ))}
    </span>
  );
}

function WishlistCard({
  deletingId,
  editDesireLevel,
  editForm,
  editImagePreviewUrl,
  editingId,
  item,
  itemActionDisabled,
  onCancelEdit,
  onClearEditImage,
  onDelete,
  onSelectEditImage,
  onStartEdit,
  onTogglePurchased,
  onUpdateEditForm,
  onUpdateItem,
  savingEditId,
  uploadingImageId,
  updatingId,
}: {
  deletingId: WishlistItem["id"] | null;
  editDesireLevel: number;
  editForm: WishlistForm;
  editImagePreviewUrl: string;
  editingId: WishlistItem["id"] | null;
  item: WishlistItem;
  itemActionDisabled: boolean;
  onCancelEdit: () => void;
  onClearEditImage: () => void;
  onDelete: (itemId: WishlistItem["id"]) => void;
  onSelectEditImage: (file: File) => void;
  onStartEdit: (item: WishlistItem) => void;
  onTogglePurchased: (item: WishlistItem) => void;
  onUpdateEditForm: <Field extends keyof WishlistForm>(
    field: Field,
    value: WishlistForm[Field],
  ) => void;
  onUpdateItem: (event: FormEvent<HTMLFormElement>) => void;
  savingEditId: WishlistItem["id"] | null;
  uploadingImageId: WishlistItem["id"] | "new" | null;
  updatingId: WishlistItem["id"] | null;
}) {
  const isDeleting = deletingId === item.id;
  const isEditing = editingId === item.id;
  const isSavingEdit = savingEditId === item.id;
  const isUploadingEditImage = uploadingImageId === item.id;
  const isUpdating = updatingId === item.id;
  const isBusy =
    itemActionDisabled ||
    isDeleting ||
    isUpdating ||
    isSavingEdit ||
    isUploadingEditImage;

  if (isEditing) {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) {
            onCancelEdit();
          }
        }}
      >
        <DialogContent>
          <DialogHeader className="pr-14">
            <DialogTitle>欲しいものを編集</DialogTitle>
          </DialogHeader>
        <form onSubmit={onUpdateItem}>
          <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-zinc-800">商品名</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
              disabled={isSavingEdit}
              onChange={(event) =>
                onUpdateEditForm("title", event.target.value)
              }
              value={editForm.title}
            />
          </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">価格</span>
              <div className="relative mt-2">
                <input
                  className="h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 pr-11 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                  disabled={isSavingEdit}
                  inputMode="numeric"
                  min="0"
                  onChange={(event) =>
                    onUpdateEditForm("price", event.target.value)
                  }
                  type="number"
                  value={editForm.price}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                  円
                </span>
              </div>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">URL</span>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-pink-100 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
                disabled={isSavingEdit}
                onChange={(event) =>
                  onUpdateEditForm("url", event.target.value)
                }
                type="url"
                value={editForm.url}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                カテゴリ
              </span>
              <Select
                disabled={isSavingEdit}
                onValueChange={(value) => onUpdateEditForm("category", value)}
                value={editForm.category || undefined}
              >
                <SelectTrigger className="mt-2 h-11">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions(editForm.category).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

          <div className="sm:col-span-2">
            <span className="text-sm font-semibold text-zinc-800">
              欲しいレベル
            </span>
            <StarRating
              ariaLabel={`${item.title}の欲しいレベル`}
              disabled={isSavingEdit}
              onChange={(nextLevel) =>
                onUpdateEditForm("desireLevel", nextLevel)
              }
              value={editDesireLevel}
            />
          </div>

          <ImageDropzone
            disabled={isSavingEdit || isUploadingEditImage}
            imageUrl={editImagePreviewUrl || editForm.imageUrl}
            isUploading={isUploadingEditImage}
            label="画像"
            onFileSelect={onSelectEditImage}
            onRemove={onClearEditImage}
          />

          <label className="mb-2.5 block sm:col-span-2">
            <span className="text-sm font-semibold text-zinc-800">メモ</span>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-pink-100 bg-white px-4 py-3 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
              disabled={isSavingEdit}
              onChange={(event) => onUpdateEditForm("memo", event.target.value)}
              value={editForm.memo}
            />
          </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-11 bg-zinc-950 hover:bg-zinc-800"
              disabled={
                isSavingEdit || isUploadingEditImage || !editForm.title.trim()
              }
              type="submit"
            >
              {isSavingEdit || isUploadingEditImage ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {isSavingEdit || isUploadingEditImage ? "保存中" : "保存"}
            </Button>
            <Button
              className="h-11"
              variant="outline"
              disabled={isSavingEdit || isUploadingEditImage}
              onClick={onCancelEdit}
              type="button"
            >
              <X size={17} />
              キャンセル
            </Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card
      className={
        item.completed
          ? "border-lavender-200 bg-lavender-100 shadow-[0_14px_40px_rgba(127,90,168,0.08)] transition-colors"
          : "bg-white/80 shadow-[0_14px_40px_rgba(157,120,137,0.07)] transition-colors"
      }
    >
      <CardContent className="p-4 sm:p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 w-full flex-1">
          <p className="mb-3 text-xs font-medium text-zinc-500">
            {formatCreatedAt(item.created_at)}
          </p>

          <div className="flex items-start gap-4">
            {item.image_url ? (
              <Image
                alt=""
                className="size-24 shrink-0 rounded-[1.5rem] object-cover sm:size-28"
                height={112}
                src={item.image_url}
                unoptimized
                width={112}
              />
            ) : null}

            <div className="min-w-0 pt-1">
              <h3 className="break-words text-base font-bold leading-7 text-zinc-950">
                {item.title}
              </h3>
            </div>
          </div>

          <dl className="mt-3 grid w-full gap-2 text-sm text-zinc-700">
            <div className="flex items-start gap-2">
              <dt className="w-20 shrink-0 font-bold text-zinc-500">価格</dt>
              <dd className="min-w-0 font-semibold text-zinc-900">
                {formatPrice(item.price)}
              </dd>
            </div>

            <div className="flex items-start gap-2">
              <dt className="w-20 shrink-0 font-bold text-zinc-500">
                カテゴリ
              </dt>
              <dd className="min-w-0 break-words">
                {item.category || "未設定"}
              </dd>
            </div>

            <div className="flex items-start gap-2">
              <dt className="w-20 shrink-0 font-bold text-zinc-500">
                欲しい度
              </dt>
              <dd className="min-w-0">
                <StarRatingDisplay value={item.desire_level} />
              </dd>
            </div>

            {item.url ? (
              <div className="flex items-start gap-2">
                <dt className="w-20 shrink-0 font-bold text-zinc-500">
                  商品URL
                </dt>
                <dd className="min-w-0">
                  <a
                    className="inline-flex max-w-full items-center gap-1 break-all font-semibold text-pink-700 underline-offset-4 hover:underline"
                    href={item.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LinkIcon className="shrink-0" size={15} />
                    {item.url}
                    <ExternalLink className="shrink-0" size={14} />
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:flex sm:shrink-0 sm:items-center">
          <Button
            className={
              item.completed
                ? "border-lavender-300 bg-white text-lavender-700 hover:bg-lavender-50"
                : undefined
            }
            variant={item.completed ? "outline" : "soft"}
            disabled={isBusy}
            onClick={() => onTogglePurchased(item)}
            type="button"
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Check size={17} />
            )}
            {item.completed ? "未購入に戻す" : "購入済みにする"}
          </Button>
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={() => onStartEdit(item)}
            type="button"
          >
            <Pencil size={17} />
            編集
          </Button>
          <Button
            aria-label={`${item.title}を削除`}
            size="icon"
            variant="destructive"
            disabled={isBusy}
            onClick={() => onDelete(item.id)}
            title="削除"
            type="button"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Trash2 size={17} />
            )}
          </Button>
        </div>
      </div>
      {item.memo ? (
        <div className="mt-4 grid w-full gap-1">
          <p className="text-sm font-bold text-zinc-500">メモ</p>
          <div className="min-w-0 whitespace-pre-wrap break-words rounded-2xl border border-pink-100 bg-white/80 px-4 py-3 text-sm leading-6 text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            {item.memo}
          </div>
        </div>
      ) : null}
      </CardContent>
    </Card>
  );
}
