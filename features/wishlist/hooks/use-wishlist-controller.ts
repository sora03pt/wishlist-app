import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createWishlistItem,
  deleteWishlistItem,
  getWishlistItems,
  updateWishlistItem,
  updateWishlistItemCompleted,
} from "@/features/wishlist/api/wishlist-api";
import { uploadWishlistImage } from "@/features/wishlist/api/wishlist-image-api";
import { useWishlistForm } from "@/features/wishlist/hooks/use-wishlist-form";
import {
  createWishlistFormFromItem,
  createWishlistInput,
} from "@/features/wishlist/model/wishlist-form";
import type {
  WishlistGetStatus,
  WishlistItem,
  WishlistItemId,
} from "@/features/wishlist/types";

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function useWishlistController() {
  const createForm = useWishlistForm();
  const editForm = useWishlistForm();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [getStatus, setGetStatus] =
    useState<WishlistGetStatus>("initial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<WishlistItemId | null>(null);
  const [updatingId, setUpdatingId] = useState<WishlistItemId | null>(null);
  const [editingId, setEditingId] = useState<WishlistItemId | null>(null);
  const [savingEditId, setSavingEditId] =
    useState<WishlistItemId | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<
    WishlistItemId | "new" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadInitialItems() {
      try {
        const nextItems = await getWishlistItems();

        if (isActive) {
          setItems(nextItems);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getErrorMessage(
              error,
              "欲しいものリストの取得に失敗しました。",
            ),
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

  const refreshItems = useCallback(async () => {
    setGetStatus("refreshing");
    setErrorMessage("");

    try {
      setItems(await getWishlistItems());
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "欲しいものリストの取得に失敗しました。"),
      );
    } finally {
      setGetStatus("idle");
    }
  }, []);

  const purchasedCount = useMemo(
    () => items.filter((item) => item.completed).length,
    [items],
  );
  const priceTotals = useMemo(
    () =>
      items.reduce(
        (totals, item) => {
          const price = item.price ?? 0;

          return item.completed
            ? { ...totals, purchased: totals.purchased + price }
            : { ...totals, unpurchased: totals.unpurchased + price };
        },
        { purchased: 0, unpurchased: 0 },
      ),
    [items],
  );

  const isInitialLoading = getStatus === "initial";
  const isRefreshing = getStatus === "refreshing";
  const hasActiveEdit = editingId !== null;
  const hasItemMutation =
    deletingId !== null ||
    updatingId !== null ||
    savingEditId !== null ||
    uploadingImageId !== null;
  const canSubmit =
    createForm.values.title.trim().length > 0 &&
    !isSubmitting &&
    !hasActiveEdit;
  const editingItem =
    editingId === null
      ? null
      : (items.find((item) => item.id === editingId) ?? null);

  async function selectCreateImage(file: File) {
    setErrorMessage("");

    try {
      await createForm.selectImage(file);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "画像の変換に失敗しました。"));
    }
  }

  async function selectEditImage(file: File) {
    setErrorMessage("");

    try {
      await editForm.selectImage(file);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "画像の変換に失敗しました。"));
    }
  }

  function startEdit(item: WishlistItem) {
    if (hasItemMutation) {
      return;
    }

    setEditingId(item.id);
    editForm.reset(createWishlistFormFromItem(item), item.image_url ?? "");
    setErrorMessage("");
  }

  function cancelEdit() {
    if (savingEditId !== null) {
      return;
    }

    setEditingId(null);
    editForm.reset();
    setErrorMessage("");
  }

  async function submitCreate() {
    if (isSubmitting) {
      return;
    }

    if (!createForm.values.title.trim()) {
      setErrorMessage("商品名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let imagePath = createForm.values.imagePath;

      if (createForm.imageFile) {
        setUploadingImageId("new");
        const uploadedImage = await uploadWishlistImage(createForm.imageFile);
        imagePath = uploadedImage.imagePath;
      }

      await createWishlistItem(
        createWishlistInput(createForm.values, imagePath),
      );
      createForm.reset();
      await refreshItems();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "欲しいものの登録に失敗しました。"),
      );
    } finally {
      setUploadingImageId(null);
      setIsSubmitting(false);
    }
  }

  async function togglePurchased(item: WishlistItem) {
    if (deletingId !== null || updatingId !== null || savingEditId !== null) {
      return;
    }

    setUpdatingId(item.id);
    setErrorMessage("");

    try {
      await updateWishlistItemCompleted(item.id, !item.completed);
      await refreshItems();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "購入状態の更新に失敗しました。"),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: WishlistItemId) {
    if (deletingId !== null || updatingId !== null || savingEditId !== null) {
      return;
    }

    setDeletingId(itemId);
    setErrorMessage("");

    try {
      await deleteWishlistItem(itemId);
      await refreshItems();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "欲しいものの削除に失敗しました。"),
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function saveEdit() {
    if (editingId === null || savingEditId !== null) {
      return;
    }

    if (!editForm.values.title.trim()) {
      setErrorMessage("商品名を入力してください。");
      return;
    }

    setSavingEditId(editingId);
    setErrorMessage("");

    try {
      let imagePath = editForm.values.imagePath;

      if (editForm.imageFile) {
        setUploadingImageId(editingId);
        const uploadedImage = await uploadWishlistImage(editForm.imageFile);
        imagePath = uploadedImage.imagePath;
      }

      await updateWishlistItem(
        editingId,
        createWishlistInput(editForm.values, imagePath),
      );
      setEditingId(null);
      editForm.reset();
      await refreshItems();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "欲しいものの更新に失敗しました。"),
      );
    } finally {
      setUploadingImageId(null);
      setSavingEditId(null);
    }
  }

  return {
    canSubmit,
    cancelEdit,
    createForm,
    deletingId,
    editForm,
    editingId,
    editingItem,
    errorMessage,
    hasActiveEdit,
    hasItemMutation,
    isInitialLoading,
    isRefreshing,
    isSubmitting,
    items,
    priceTotals,
    purchasedCount,
    refreshItems,
    removeItem,
    saveEdit,
    savingEditId,
    selectCreateImage,
    selectEditImage,
    startEdit,
    submitCreate,
    togglePurchased,
    unpurchasedCount: items.length - purchasedCount,
    uploadingImageId,
    updatingId,
  };
}
