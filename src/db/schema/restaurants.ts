import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";
import { restaurantCategoryEnum, restaurantStatusEnum } from "./enums";
import { users } from "./auth";

export const restaurants = pgTable("restaurants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  address: text("address"),
  district: text("district").notNull(),
  category: restaurantCategoryEnum("category").notNull(),
  coverBlobUrl: text("cover_blob_url"),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: restaurantStatusEnum("status").notNull().default("pendiente"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const tables = pgTable("tables", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  restaurantId: text("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  seats: integer("seats").notNull(),
  zone: text("zone").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});
