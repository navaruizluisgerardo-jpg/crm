import {
  pgTable, text, timestamp, numeric, integer, pgEnum
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations, users } from "./users";
import { contacts, companies } from "./contacts";

export const dealStatusEnum = pgEnum("deal_status", [
  "open", "won", "lost", "on_hold"
]);

export const pipelines = pgTable("pipelines", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name:           text("name").notNull(),
  isDefault:      text("is_default").default("false"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

export const pipelineStages = pgTable("pipeline_stages", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  pipelineId:  text("pipeline_id").notNull().references(() => pipelines.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  order:       integer("order").notNull(),
  probability: integer("probability").default(0), // 0-100
  color:       text("color").default("#6366f1"),
});

export const deals = pgTable("deals", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  pipelineId:     text("pipeline_id").references(() => pipelines.id),
  stageId:        text("stage_id").references(() => pipelineStages.id),
  contactId:      text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  companyId:      text("company_id").references(() => companies.id, { onDelete: "set null" }),
  ownerId:        text("owner_id").references(() => users.id),
  title:          text("title").notNull(),
  value:          numeric("value", { precision: 12, scale: 2 }).default("0"),
  currency:       text("currency").default("USD"),
  status:         dealStatusEnum("status").notNull().default("open"),
  probability:    integer("probability").default(0),
  expectedClose:  timestamp("expected_close"),
  closedAt:       timestamp("closed_at"),
  lostReason:     text("lost_reason"),
  notes:          text("notes"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});
