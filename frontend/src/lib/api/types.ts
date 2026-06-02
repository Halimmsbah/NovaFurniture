// Domain types mirrored from the Express/Mongoose backend.

export type ID = string;

export type Category = {
  _id: ID;
  name: string;
  slug: string;
  image?: string;
};

export type Brand = {
  _id: ID;
  name: string;
  slug: string;
  logo?: string;
};

export type Subcategory = {
  _id: ID;
  name: string;
  slug: string;
  category?: ID | Category;
};

export type Product = {
  _id: ID;
  title: string;
  slug: string;
  description: string;
  imgCover?: string;
  images?: string[];
  price: number;
  priceAfterDiscount?: number;
  quantity?: number;
  sold?: number;
  rateAvg?: number;
  rateCount?: number;
  category?: ID | Category;
  subcategory?: ID | Subcategory;
  brand?: ID | Brand;
  createdAt?: string;
};

export type PaginatedProducts = {
  page?: number;
  results?: number;
  metadata?: unknown;
  product?: Product[]; // some controllers return `product`
  products?: Product[]; // others return `products`
  data?: Product[]; // fallback
};

export type CartItem = {
  _id?: ID;
  product: Product | ID;
  quantity: number;
  price: number;
};

export type Cart = {
  _id?: ID;
  cartItems: CartItem[];
  totalPrice?: number;
  totalPriceAfterDiscount?: number;
  discount?: number;
};

export type Address = {
  _id?: ID;
  street: string;
  city: string;
  phone: string;
};

export type Order = {
  _id: ID;
  user: ID | { _id?: ID; name?: string; email?: string; role?: "user" | "admin" };
  orderItems: { product: Product | ID; quantity: number; price: number }[];
  totalOrderPrice: number;
  shippingAddress: { street: string; city: string; phone: string };
  paymentType: "cash" | "card";
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "canceled" | "refunded";
  notes?: string;
  isDelivered: boolean;
  isPaid: boolean;
  createdAt: string;
};

export type Review = {
  _id: ID;
  text: string;
  rate: number;
  user: { _id: ID; name: string } | ID;
  product: ID;
  createdAt?: string;
};

export type AuthUser = {
  _id?: ID;
  name?: string;
  email?: string;
  role?: "user" | "admin";
};

export type AuthResponse = {
  message: string;
  token?: string;
  user?: AuthUser;
};

export type Coupon = {
  _id: ID;
  code: string;
  discount: number;
  expires: string;
};

export type AdminUser = {
  _id: ID;
  name: string;
  email: string;
  role?: "user" | "admin";
  phone?: string;
  createdAt?: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalCategories: number;
  totalBrands: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  paidOrders: number;
  unpaidOrders: number;
};
