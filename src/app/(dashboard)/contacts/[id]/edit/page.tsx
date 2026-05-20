import { auth }               from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getContactById }     from "@/lib/db/queries/contacts";
import { ContactForm }        from "@/components/contacts/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button }             from "@/components/ui/button";
import Link                   from "next/link";
import { ArrowLeft }          from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const result  = await getContactById(id, session.user.organizationId);

  if (!result) notFound();

  const { contact } = result;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/contacts/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Editar contacto</h1>
          <p className="text-muted-foreground text-sm">
            {contact.firstName} {contact.lastName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            contact={{
              id:         contact.id,
              firstName:  contact.firstName,
              lastName:   contact.lastName  ?? undefined,
              email:      contact.email     ?? undefined,
              phone:      contact.phone     ?? undefined,
              mobile:     contact.mobile    ?? undefined,
              jobTitle:   contact.jobTitle  ?? undefined,
              department: contact.department?? undefined,
              status:     contact.status    as any,
              source:     contact.source    ?? undefined,
              notes:      contact.notes     ?? undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
