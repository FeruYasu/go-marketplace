import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadedProducts = await AsyncStorage.getItem('products');

      if (loadedProducts) {
        setProducts(JSON.parse(loadedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async ({ id, title, image_url, price }) => {
      if (products) {
        const productIndex = products.findIndex(product => product.id === id);
        if (productIndex < 0) {
          setProducts([
            ...products,
            { id, title, image_url, price, quantity: 1 },
          ]);
        }
      } else {
        setProducts([
          ...products,
          { id, title, image_url, price, quantity: 1 },
        ]);
      }

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newStateProduct = [...products];

      const productIndex = newStateProduct.findIndex(
        product => product.id === id,
      );

      if (productIndex >= 0) {
        newStateProduct[productIndex].quantity += 1;
        setProducts(newStateProduct);
      }

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newStateProduct = [...products];
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex >= 0) {
        newStateProduct[productIndex].quantity -= 1;
        setProducts(newStateProduct);
      }

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
