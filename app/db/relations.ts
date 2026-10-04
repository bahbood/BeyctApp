// app/db/relations.ts
import { relations } from "drizzle-orm";
import { stores, users ,products, productImages } from "./schema";


// روابط بین جداول
export const usersRelations = relations(users, ({ one }) => ({
    store: one(stores),
}));

// تعریف روابط

export const storesRelations = relations(stores, ({ many, one }) => ({
    products: many(products),

    user: one(users, {
        fields: [stores.user_id],
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
