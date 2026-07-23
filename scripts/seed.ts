import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import {
  payments,
  reservations,
  restaurants,
  reviews,
  tables,
  users,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "owner@example.com";
const CLIENT_EMAIL = process.env.SEED_CLIENT_EMAIL ?? "client@example.com";

async function upsertUser(input: {
  email: string;
  name: string;
  role: "cliente" | "restaurante" | "admin";
  phone: string;
}) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existing) return existing;
  const [user] = await db.insert(users).values(input).returning();
  return user;
}

async function upsertRestaurant(input: typeof restaurants.$inferInsert) {
  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, input.slug),
  });
  if (existing) return existing;
  const [restaurant] = await db.insert(restaurants).values(input).returning();
  return restaurant;
}

function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log("Sembrando usuarios demo...");
  const admin = await upsertUser({
    email: ADMIN_EMAIL,
    name: "Admin LlamaEats",
    role: "admin",
    phone: "+51 951 000 001",
  });
  const owner = await upsertUser({
    email: OWNER_EMAIL,
    name: "Dueño Uros Lounge",
    role: "restaurante",
    phone: "+51 951 000 002",
  });
  const client = await upsertUser({
    email: CLIENT_EMAIL,
    name: "Cliente Demo",
    role: "cliente",
    phone: "+51 951 000 003",
  });
  const fillerOwner2 = await upsertUser({
    email: "owner2.demo@llamaeats.pe",
    name: "Dueño Peña Kantuta",
    role: "restaurante",
    phone: "+51 951 000 004",
  });
  const fillerOwner3 = await upsertUser({
    email: "owner3.demo@llamaeats.pe",
    name: "Dueño La Chacra Puneña",
    role: "restaurante",
    phone: "+51 951 000 005",
  });
  const fillerOwner4 = await upsertUser({
    email: "owner4.demo@llamaeats.pe",
    name: "Dueño Sabores del Altiplano",
    role: "restaurante",
    phone: "+51 951 000 006",
  });

  console.log("Sembrando restaurantes de Puno...");
  const urosLounge = await upsertRestaurant({
    name: "Uros Lounge",
    slug: "uros-lounge",
    description:
      "Terraza con vista directa al lago Titicaca y a las Islas de los Uros. Comida fusión andina.",
    address: "Jr. Titicaca 450",
    district: "Chulluni",
    category: "vista_al_lago",
    openTime: "12:00",
    closeTime: "22:00",
    ownerId: owner.id,
    status: "aprobado",
  });
  const penaKantuta = await upsertRestaurant({
    name: "Peña Kantuta",
    slug: "pena-kantuta",
    description: "Show folclórico en vivo con danzas típicas de Puno todas las noches.",
    address: "Jr. Lima 320",
    district: "Puno",
    category: "peña_con_show",
    openTime: "19:00",
    closeTime: "23:30",
    ownerId: fillerOwner2.id,
    status: "aprobado",
  });
  const chacraPunena = await upsertRestaurant({
    name: "La Chacra Puneña",
    slug: "la-chacra-punena",
    description: "Comida típica puneña: chairo, pesque de quinua y trucha del lago.",
    address: "Av. Simón Bolívar 812",
    district: "Salcedo",
    category: "comida_tipica",
    openTime: "12:00",
    closeTime: "22:00",
    ownerId: fillerOwner3.id,
    status: "aprobado",
  });
  const saboresAltiplano = await upsertRestaurant({
    name: "Sabores del Altiplano",
    slug: "sabores-del-altiplano",
    description: "Cocina puneña de autor con productos de la región.",
    address: "Av. El Sol 210",
    district: "Puno",
    category: "comida_tipica",
    openTime: "12:00",
    closeTime: "21:00",
    ownerId: fillerOwner4.id,
    status: "pendiente",
  });

  console.log("Sembrando mesas...");
  async function seedTables(
    restaurantId: string,
    zones: { zone: string; count: number; seats: number }[],
  ) {
    const existing = await db.query.tables.findMany({ where: eq(tables.restaurantId, restaurantId) });
    if (existing.length > 0) return existing;

    let number = 1;
    const rows: (typeof tables.$inferInsert)[] = [];
    for (const z of zones) {
      for (let i = 0; i < z.count; i++) {
        rows.push({ restaurantId, number: number++, seats: z.seats, zone: z.zone });
      }
    }
    return db.insert(tables).values(rows).returning();
  }

  const urosTables = await seedTables(urosLounge.id, [
    { zone: "Terraza / Vista al lago", count: 4, seats: 4 },
    { zone: "Salón Principal", count: 4, seats: 2 },
  ]);
  await seedTables(penaKantuta.id, [
    { zone: "Salón Principal", count: 5, seats: 4 },
    { zone: "Mesas VIP", count: 3, seats: 6 },
  ]);
  await seedTables(chacraPunena.id, [
    { zone: "Salón Principal", count: 6, seats: 4 },
    { zone: "Patio", count: 2, seats: 8 },
  ]);
  await seedTables(saboresAltiplano.id, [{ zone: "Salón Principal", count: 6, seats: 4 }]);

  console.log("Sembrando reservas de ejemplo...");
  const existingReservations = await db.query.reservations.findMany({
    where: eq(reservations.userId, client.id),
  });

  if (existingReservations.length === 0 && urosTables.length >= 3) {
    // Reserva pasada, completada, con reseña.
    const [pastReservation] = await db
      .insert(reservations)
      .values({
        code: "LE-DEMO1",
        userId: client.id,
        restaurantId: urosLounge.id,
        tableId: urosTables[0].id,
        date: daysFromToday(-10),
        timeSlot: "19:30",
        guests: 2,
        serviceFee: "4.00",
        status: "completada",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      })
      .returning();

    await db.insert(payments).values({
      reservationId: pastReservation.id,
      amount: "4.00",
      provider: "fake",
      status: "completado",
      reference: `FAKE-${pastReservation.code}-seed`,
    });

    await db.insert(reviews).values({
      reservationId: pastReservation.id,
      userId: client.id,
      restaurantId: urosLounge.id,
      rating: 5,
      comment: "Vista increíble al atardecer y el pescado frito espectacular.",
    });

    // Reserva confirmada, futura.
    const [futureReservation] = await db
      .insert(reservations)
      .values({
        code: "LE-DEMO2",
        userId: client.id,
        restaurantId: penaKantuta.id,
        tableId: (
          await db.query.tables.findFirst({ where: eq(tables.restaurantId, penaKantuta.id) })
        )!.id,
        date: daysFromToday(5),
        timeSlot: "20:00",
        guests: 4,
        serviceFee: "5.00",
        status: "confirmada",
        paidAt: new Date(),
      })
      .returning();

    await db.insert(payments).values({
      reservationId: futureReservation.id,
      amount: "5.00",
      provider: "fake",
      status: "completado",
      reference: `FAKE-${futureReservation.code}-seed`,
    });

    // Reserva pendiente hoy (para la bandeja del restaurante).
    await db.insert(reservations).values({
      code: "LE-DEMO3",
      userId: client.id,
      restaurantId: urosLounge.id,
      tableId: urosTables[1].id,
      date: daysFromToday(0),
      timeSlot: "13:30",
      guests: 2,
      serviceFee: "4.00",
      status: "pendiente",
    });

    // Reserva cancelada.
    await db.insert(reservations).values({
      code: "LE-DEMO4",
      userId: client.id,
      restaurantId: chacraPunena.id,
      tableId: (
        await db.query.tables.findFirst({ where: eq(tables.restaurantId, chacraPunena.id) })
      )!.id,
      date: daysFromToday(-2),
      timeSlot: "14:00",
      guests: 3,
      serviceFee: "3.00",
      status: "cancelada",
    });
  }

  console.log("\nListo. Usuarios demo:");
  console.log(`  admin:       ${admin.email}`);
  console.log(`  restaurante: ${owner.email} (dueño de Uros Lounge)`);
  console.log(`  cliente:     ${client.email}`);
  console.log(
    "\nInicia sesión con Google o magic link usando exactamente esos correos para entrar a cada rol.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
