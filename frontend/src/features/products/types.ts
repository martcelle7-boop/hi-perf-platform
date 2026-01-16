export interface Price {
  amount: number;
  currency: string;
}

export interface NetworkSummary {
  id: number;
  code: string;
  name: string;
  type: 'NORMAL' | 'PARTNER';
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  networks: NetworkSummary[];
  price?: Price;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}
