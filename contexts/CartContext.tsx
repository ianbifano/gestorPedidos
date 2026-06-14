import { CartItem, CartSummary, Product } from '@/types/product';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

const TAX_RATE = 0.21; // IVA 21%

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, cantidad?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  getSummary: () => CartSummary;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, cantidad: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      
      return [...prevItems, { product, cantidad }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, cantidad } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartTotal = useCallback((): number => {
    return items.reduce((total, item) => total + item.product.precio * item.cantidad, 0);
  }, [items]);

  const getSummary = useCallback((): CartSummary => {
    const subtotal = getCartTotal();
    const impuestos = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + impuestos;

    return {
      items,
      totalItems: items.reduce((sum, item) => sum + item.cantidad, 0),
      subtotal,
      impuestos,
      total,
    };
  }, [getCartTotal, items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSummary,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
