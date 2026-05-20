"use server";

import { revalidatePath }        from "next/cache";
import { auth }                  from "@/lib/auth";
import { db }                    from "@/lib/db";
import { contacts, auditLogs }   from "@/lib/db/schema";
import { eq, and }               from "drizzle-orm";
import { createContactSchema, updateContactSchema } from "@/lib/validations/contacts";

// Helper para obtener sesión o lanzar error
async function requireSession() {
  const session = await auth();
  if (!session?.user?.organizationId) throw new Error("No autorizado");
  return session.user;
}

// Helper para registrar cambios en audit log
async function logAudit(
  organizationId: string,
  userId:         string,
  action:         string,
  entity:         string,
  entityId:       string,
  changes?:       object
) {
  await db.insert(auditLogs).values({
    organizationId,
    userId,
    action,
    entity,
    entityId,
    changes: changes ? JSON.stringify(changes) : null,
  });
}

export async function createContactAction(data: unknown) {
  const user = await requireSession();

  const parsed = createContactSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { email, ...rest } = parsed.data;

  const [contact] = await db
    .insert(contacts)
    .values({
      ...rest,
      email:          email || null,
      organizationId: user.organizationId,
      ownerId:        user.id,
    })
    .returning();

  if (!contact) return { error: "Error al crear el contacto" };

  await logAudit(user.organizationId, user.id, "created", "contact", contact.id);

  revalidatePath("/contacts");
  return { success: true, data: contact };
}

export async function updateContactAction(id: string, data: unknown) {
  const user = await requireSession();

  const parsed = updateContactSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { email, ...rest } = parsed.data;

  const [updated] = await db
    .update(contacts)
    .set({
      ...rest,
      ...(email !== undefined ? { email: email || null } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contacts.id,             id),
        eq(contacts.organizationId, user.organizationId)
      )
    )
    .returning();

  if (!updated) return { error: "Contacto no encontrado" };

  await logAudit(user.organizationId, user.id, "updated", "contact", id, rest);

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  return { success: true, data: updated };
}

export async function deleteContactAction(id: string) {
  const user = await requireSession();

  const [deleted] = await db
    .delete(contacts)
    .where(
      and(
        eq(contacts.id,             id),
        eq(contacts.organizationId, user.organizationId)
      )
    )
    .returning();

  if (!deleted) return { error: "Contacto no encontrado" };

  await logAudit(user.organizationId, user.id, "deleted", "contact", id);

  revalidatePath("/contacts");
  return { success: true };
}
