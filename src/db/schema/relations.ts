import { relations } from "drizzle-orm";
import { accounts, sessions, users } from "./auth";
import { restaurants, restaurantScheduleExceptions, tables } from "./restaurants";
import { reservations } from "./reservations";
import { payments } from "./payments";
import { reviews } from "./reviews";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  restaurants: many(restaurants, { relationName: "restaurant_owner" }),
  reservations: many(reservations),
  reviews: many(reviews),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id],
    relationName: "restaurant_owner",
  }),
  reviewer: one(users, {
    fields: [restaurants.reviewerId],
    references: [users.id],
    relationName: "restaurant_reviewer",
  }),
  firstApprover: one(users, {
    fields: [restaurants.firstApproverId],
    references: [users.id],
    relationName: "restaurant_first_approver",
  }),
  tables: many(tables),
  reservations: many(reservations),
  reviews: many(reviews),
  scheduleExceptions: many(restaurantScheduleExceptions),
}));

export const restaurantScheduleExceptionsRelations = relations(
  restaurantScheduleExceptions,
  ({ one }) => ({
    restaurant: one(restaurants, {
      fields: [restaurantScheduleExceptions.restaurantId],
      references: [restaurants.id],
    }),
  }),
);

export const tablesRelations = relations(tables, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [tables.restaurantId],
    references: [restaurants.id],
  }),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  restaurant: one(restaurants, {
    fields: [reservations.restaurantId],
    references: [restaurants.id],
  }),
  table: one(tables, {
    fields: [reservations.tableId],
    references: [tables.id],
  }),
  payments: many(payments),
  review: one(reviews, {
    fields: [reservations.id],
    references: [reviews.reservationId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  reservation: one(reservations, {
    fields: [payments.reservationId],
    references: [reservations.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reviews.reservationId],
    references: [reservations.id],
  }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  restaurant: one(restaurants, {
    fields: [reviews.restaurantId],
    references: [restaurants.id],
  }),
}));
