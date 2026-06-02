import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addToCart as apiAddToCart,
  clearCart as apiClearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  applyCoupon as apiApplyCoupon,
} from "./api/cart";
import {
  addToWishlist as apiAddWish,
  getWishlist,
  removeFromWishlist as apiRemoveWish,
} from "./api/wishlist";
import { apiErrorMessage } from "./api";
import { useAuth } from "./auth";

const CART_KEY = ["cart"] as const;
const WISH_KEY = ["wishlist"] as const;

export function useCartQuery() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: CART_KEY,
    queryFn: getCart,
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCartCount(): number {
  const token = useAuth((s) => s.token);
  const { data } = useCartQuery();
  if (!token) return 0;
  return data?.cartItems?.reduce((n, i) => n + (i.quantity ?? 0), 0) ?? 0;
}

export function useAddToCart() {
  const qc = useQueryClient();
  const token = useAuth((s) => s.token);
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!token) throw new Error("Sign in to add items to your cart.");
      return apiAddToCart(productId);
    },
    onSuccess: (data) => {
      qc.setQueryData(CART_KEY, data);
      toast.success("Added to cart");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not add to cart")),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(productId, quantity),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
    onError: (err) => toast.error(apiErrorMessage(err, "Could not update item")),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
    onError: (err) => toast.error(apiErrorMessage(err, "Could not remove item")),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useApplyCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiApplyCoupon(code),
    onSuccess: (data) => {
      qc.setQueryData(CART_KEY, data);
      toast.success("Coupon applied");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Invalid coupon")),
  });
}

export function useWishlistQuery() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: WISH_KEY,
    queryFn: getWishlist,
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useWishlistIds(): Set<string> {
  const { data } = useWishlistQuery();
  return new Set((data ?? []).map((p) => p._id));
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const token = useAuth((s) => s.token);
  return useMutation({
    mutationFn: async ({ productId, has }: { productId: string; has: boolean }) => {
      if (!token) throw new Error("Sign in to save items to your wishlist.");
      if (has) await apiRemoveWish(productId);
      else await apiAddWish(productId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: WISH_KEY }),
    onError: (err) => toast.error(apiErrorMessage(err, "Could not update wishlist")),
  });
}
