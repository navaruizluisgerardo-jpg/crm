import { auth }                from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getContactById }      from "@/lib/db/queries/contacts";
import { ContactStatusBadge }  from "@/components/contacts/contact-status-badge";
import { Button }              from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator }           from "@/components/ui/separator";
import Link                    from "next/link";
import { ArrowLeft, Pencil, Mail, Phone, Building2, Briefcase } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const result  = await getContactById(id, session.user.organizationId);

  if (!result) notFound();

  const { contact, company, owner } = result;
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/contacts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{fullName}</h1>
              <ContactStatusBadge status={contact.status} />
            </div>
            {contact.jobTitle && (
              <p className="text-muted-foreground text-sm mt-1">
                {contact.jobTitle}{company ? ` en ${company.name}` : ""}
              </p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/contacts/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Info principal */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              {company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Link href={`/companies/${company.id}`} className="text-sm hover:underline">
                    {company.name}
                  </Link>
                </div>
              )}
              {contact.department && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{contact.department}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actividades — se conecta en Fase 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Las actividades de este contacto aparecerán aquí
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                  Responsable
                </p>
                <p>{owner?.name ?? "Sin asignar"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                  Fuente
                </p>
                <p className="capitalize">{contact.source ?? "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                  Creado el
                </p>
                <p>
                  {new Intl.DateTimeFormat("es-MX", {
                    day:   "numeric",
                    month: "long",
                    year:  "numeric",
                  }).format(new Date(contact.createdAt))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
