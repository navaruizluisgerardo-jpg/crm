import { ContactForm } from "@/components/contacts/contact-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button }      from "@/components/ui/button";
import Link            from "next/link";
import { ArrowLeft }   from "lucide-react";

export default function NewContactPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Nuevo contacto</h1>
          <p className="text-muted-foreground text-sm">
            Completa la información del contacto
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del contacto</CardTitle>
          <CardDescription>
            Los campos marcados con * son obligatorios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
