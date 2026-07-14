import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  namePersian: text("name_persian").notNull(),
  nameEnglish: text("name_english").notNull(),
  category: text("category").notNull(),
  categorySlug: text("category_slug").notNull(),
  price: integer("price").notNull(), // in Toman
  originalPrice: integer("original_price"), // in Toman
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  specifications: jsonb("specifications").$type<Record<string, string>>().notNull().default({}),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  availableSizes: jsonb("available_sizes").$type<string[]>().notNull().default([]),
  availableColors: jsonb("available_colors").$type<{ name: string; hex: string }[]>().notNull().default([]),
  rating: real("rating").notNull().default(5.0),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isAmazingOffer: boolean("is_amazing_offer").notNull().default(false),
  amazingOfferEnd: text("amazing_offer_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorCity: text("author_city").notNull(),
  rating: integer("rating").notNull(),
  date: text("date").notNull(),
  comment: text("comment").notNull(),
  verifiedPurchase: boolean("verified_purchase").notNull().default(true),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerCity: text("customer_city").notNull(),
  customerPostalCode: text("customer_postal_code").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'online_gateway', 'card_transfer', 'cash_on_delivery'
  shippingMethod: text("shipping_method").notNull(), // 'express_courier', 'tipax', 'post'
  items: jsonb("items")
    .$type<
      {
        productId: number;
        slug: string;
        namePersian: string;
        price: number;
        quantity: number;
        size?: string;
        color?: { name: string; hex: string };
        image: string;
      }[]
    >()
    .notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingCost: integer("shipping_cost").notNull(),
  discountAmount: integer("discount_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending_payment"), // pending_payment, processing, shipped, delivered
  note: text("note"),
  isGift: boolean("is_gift").notNull().default(false),
  giftRecipient: text("gift_recipient"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titlePersian: text("title_persian").notNull(),
  subtitlePersian: text("subtitle_persian").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  isFeatured: boolean("is_featured").notNull().default(true),
});

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull().default(""),
  city: text("city").notNull().default(""),
  address: text("address").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type Customer = typeof customers.$inferSelect;
