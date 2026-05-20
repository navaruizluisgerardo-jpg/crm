import {
  pgTable, text, timestamp, boolean, pgEnum, jsonb, integer
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations, users } from "./users";

export const contactStatusEnum = pgEnum("contact_status", [
  "lead", "prospect", "customer", "churned", "partner"
]);

export const companies = pgTable("companies", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name:           text("name").notNull(),
  domain:         text("domain"),
  industry:       text("industry"),
  size:           text("size"),           // startup | smb | enterprise
  website:        text("website"),
  phone:          text("phone"),
  address:        text("address"),
  city:           text("city"),
  country:        text("country"),
  notes:          text("notes"),
  customFields:   jsonb("custom_fields").default({}),
  createdById:    text("created_by_id").references(() => users.id),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  companyId:      text("company_id").references(() => companies.id, { onDelete: "set null" }),
  ownerId:        text("owner_id").references(() => users.id),
  firstName:      text("first_name").notNull(),
  lastName:       text("last_name"),
  email:          text("email"),
  phone:          text("phone"),
  mobile:         text("mobile"),
  jobTitle:       text("job_title"),
  department:     text("department"),
  status:         contactStatusEnum("status").notNull().default("lead"),
  source:         text("source"),         // web | referral | cold | event | etc
  score:          integer("score").default(0),
  isActive:       boolean("is_active").notNull().default(true),
  notes:          text("notes"),
  customFields:   jsonb("custom_fields").default({}),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name:           text("name").notNull(),
  color:          text("color").notNull().default("#6366f1"),
});

export const contactTags = pgTable("contact_tags", {
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  tagId:     text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});
