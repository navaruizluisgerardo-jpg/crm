import {
  pgTable, text, timestamp, boolean, pgEnum
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations, users } from "./users";
import { contacts } from "./contacts";
import { deals } from "./deals";

export const activityTypeEnum = pgEnum("activity_type", [
  "note", "call", "email", "meeting", "task", "whatsapp"
]);

export const activities = pgTable("activities", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId:         text("user_id").references(() => users.id),
  contactId:      text("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
  dealId:         text("deal_id").references(() => deals.id, { onDelete: "set null" }),
  type:           activityTypeEnum("type").notNull(),
  title:          text("title").notNull(),
  description:    text("description"),
  isDone:         boolean("is_done").notNull().default(false),
  dueDate:        timestamp("due_date"),
  doneAt:         timestamp("done_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId:         text("user_id").references(() => users.id),
  action:         text("action").notNull(),    // created | updated | deleted
  entity:         text("entity").notNull(),    // contact | deal | etc
  entityId:       text("entity_id").notNull(),
  changes:        text("changes"),             // JSON stringified diff
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});
