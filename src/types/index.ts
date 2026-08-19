export interface ProductType {
  id: number;
  name: string;
  color: string;
  size: string;
  brandId: number;
  brand: BrandType;
  imageUrl: string;
  price: number;
  retailerPrice: number;
  dealerPrice: number;
  distributorPrice: number;
  bulkPrice: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  description: string | null;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  weight?: number | null;
  hsnCode?: string | null;
  gstRate?: number | null;
  images?: ProductImageType[];
}

export interface ProductImageType {
  id: number;
  productId: number;
  imageUrl: string;
  color: string | null;
  sortOrder: number;
  createdAt: Date;
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

export interface ReviewType {
  id: number;
  productId: number;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBrands: number;
  recentOrders: OrderType[];
  topProducts: { product: ProductType; count: number }[];
}
