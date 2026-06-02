'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const saveCart = (items) => {
    setCart(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (product, size, color, qty = 1) => {
    const key = `${product._id}-${size}-${color}`;
    const existing = cart.find((i) => i.key === key);
    if (existing) {
      saveCart(cart.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i)));
    } else {
      saveCart([
        ...cart,
        {
          key,
          product: product._id,
          name: product.name,
          image: product.images[0],
          price: product.price,
          size,
          color,
          qty,
        },
      ]);
    }
  };

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    saveCart(cart.map((i) => (i.key === key ? { ...i, qty } : i)));
  };

  const removeFromCart = (key) => saveCart(cart.filter((i) => i.key !== key));

  const clearCart = () => saveCart([]);

  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const itemCount = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
