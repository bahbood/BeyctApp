
import { pgTable, serial, timestamp, varchar, boolean ,integer } from "drizzle-orm/pg-core";

export const slides = pgTable('slides', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 25 }).unique().notNull(),
  image_L: varchar('image_L', { length: 25 }).unique().notNull(),
  image_P: varchar('image_P', { length: 25 }).unique().notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  show_startDate: timestamp('show_startDate').notNull(),
  show_endDate: timestamp('show_endDate').notNull(),

  order:integer("order" ).default(0) ,
  isActive: boolean('isActive').default(false)
});

export type Slide = typeof slides.$inferSelect;
export type NewSlide = typeof slides.$inferInsert;