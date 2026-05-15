import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

const database = new Database("dev.db");
const adapter = new PrismaBetterSqlite3(database);
const prisma = new PrismaClient({ adapter });

export default prisma;