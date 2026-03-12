"use client";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  farmerName: string;
  unit: string;
}

const CART_KEY = "paniers-fermiers-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((i) => i.productId !== productId);
  } else {
    const item = cart.find((i) => i.productId === productId);
    if (item) item.quantity = quantity;
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
