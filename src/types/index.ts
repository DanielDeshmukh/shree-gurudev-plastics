export interface ProductType {
  id: number;
  name: string;
  color: string;
  size: string;
  brandId: number;
  brand: BrandType;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandType {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  products?: ProductType[];
  _count?: { products: number };
}

export interface OrderType {
  id: number;
  customer: string;
  phone: string;
  address: string | null;
  total: number;
  status: string;
  notes: string | null;
  items: OrderItemType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemType {
  id: number;
  orderId: number;
  productId: number;
  product?: ProductType;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBrands: number;
  recentOrders: OrderType[];
  topProducts: { product: ProductType; count: number }[];
}
