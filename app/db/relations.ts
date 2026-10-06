// app/db/relations.ts
import { relations } from "drizzle-orm";
import {
  stores,
  users,
  products,
  productImages,
  newsAgencies,
  news,
  newsImages,
  newsLikes,
} from "./schema";


// روابط بین جداول
export const usersRelations = relations(users, ({ one, many }) => ({
    store: one(stores),
    newsAgency: one(newsAgencies),
    newsLikes: many(newsLikes),
}));

// تعریف روابط

export const storesRelations = relations(stores, ({ many, one }) => ({
    products: many(products),

    user: one(users, {
        fields: [stores.user_id],
        references: [users.id],
    }),
}));


export const newsAgenciesRelations = relations(newsAgencies, ({ many, one }) => ({
  news: many(news),

  user: one(users, {
    fields: [newsAgencies.user_id],
    references: [users.id],
  }),
}));


export const newsRelations = relations(news, ({ many, one }) => ({
  images: many(newsImages),
  likes: many(newsLikes),

  newsAgency: one(newsAgencies, {
    fields: [news.news_agency_id],
    references: [newsAgencies.id],
  }),
}));


export const newsImagesRelations = relations(newsImages, ({ one }) => ({
  news: one(news, {
    fields: [newsImages.news_id],
    references: [news.id],
  }),
}));


export const newsLikesRelations = relations(newsLikes, ({ one }) => ({
  news: one(news, {
    fields: [newsLikes.news_id],
    references: [news.id],
  }),

  user: one(users, {
    fields: [newsLikes.user_id],
    references: [users.id],
  }),
}));


export const productsRelations = relations(products, ({ many, one }) => ({
  store: one(stores, {
    fields: [products.store_id],
    references: [stores.id],
  }),

  images: many(productImages),
}));


export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.product_id],
    references: [products.id],
  }),
}));