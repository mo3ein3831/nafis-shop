"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: number;
  slug: string;
  namePersian: string;
  nameEnglish: string;
  price: number;
  originalPrice: number | null;
  image: string;
  size?: string;
  color?: { name: string; hex: string };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, size?: string, color?: { name: string; hex: string }, quantity?: number) => void;
  removeFromCart: (productId: number, size?: string, color?: { name: string; hex: string }) => void;
  updateQuantity: (productId: number, quantity: number, size?: string, color?: { name: string; hex: string }) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
  toast: { message: string; type?: "success" | "info" | "error" } | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" | "error" } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("nafis_cart_items");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem("nafis_wishlist_items");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (err) {
      console.error("Error loading cart from localStorage", err);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("nafis_cart_items", JSON.stringify(items));
    } catch (err) {
      console.error("Error saving cart to localStorage", err);
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("nafis_wishlist_items", JSON.stringify(wishlist));
    } catch (err) {
      console.error("Error saving wishlist to localStorage", err);
    }
  }, [wishlist, isInitialized]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const dismissToast = () => setToast(null);

  const addToCart = (
    product: any,
    size?: string,
    color?: { name: string; hex: string },
    quantity = 1
  ) => {
    const defaultSize = size || (product.availableSizes && product.availableSizes[0]) || "استاندارد";
    const defaultColor = color || (product.availableColors && product.availableColors[0]) || undefined;
    const firstImage = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : typeof product.images === "string" ? product.images : "";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.productId === product.id &&
          item.size === defaultSize &&
          item.color?.name === defaultColor?.name
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            slug: product.slug,
            namePersian: product.namePersian,
            nameEnglish: product.nameEnglish,
            price: product.price,
            originalPrice: product.originalPrice,
            image: firstImage,
            size: defaultSize,
            color: defaultColor,
            quantity,
          },
        ];
      }
    });

    showToast(`«${product.namePersian}» به سبد خرید افزوده شد.`, "success");
    setIsCartOpen(true);
  };

  const removeFromCart = (
    productId: number,
    size?: string,
    color?: { name: string; hex: string }
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.size === size &&
            item.color?.name === color?.name
          )
      )
    );
    showToast("کالا از سبد خرید حذف شد.", "info");
  };

  const updateQuantity = (
    productId: number,
    newQty: number,
    size?: string,
    color?: { name: string; hex: string }
  ) => {
    if (newQty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId &&
        item.size === size &&
        item.color?.name === color?.name
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("nafis_cart_items");
    } catch (e) {}
  };

  const toggleWishlist = (slug: string) => {
    setWishlist((prev) => {
      if (prev.includes(slug)) {
        showToast("از لیست علاقه‌مندی‌ها حذف شد.", "info");
        return prev.filter((s) => s !== slug);
      } else {
        showToast("به لیست علاقه‌مندی‌ها اضافه شد.", "success");
        return [...prev, slug];
      }
    });
  };

  const isInWishlist = (slug: string) => wishlist.includes(slug);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        totalItems,
        subtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
