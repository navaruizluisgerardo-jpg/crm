"use client";

import Link                      from "next/link";
import { useRouter }             from "next/navigation";
import { useState }              from "react";
import { ContactStatusBadge }    from "./contact-status-badge";
import { deleteContactAction }   from "@/lib/actions/contacts";
import { Button }                from "@/components/ui/button";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

type Contact = {
  contact: {
    id:        string;
    firstName: string;
    lastName:  string | null;
    email:     string | null;
    phone:     string | null;
    status:    string;
    source:    string | null;
    createdAt: Date;
  };
  company: { id: string; name: string } | null;
  owner:   { id: string; name: string | null } | null;
};

interface ContactsTableProps {
  contacts:   Contact[];
  page:       number;
  totalPages: number;
}

export function ContactsTable({ contacts, page, totalPages }: ContactsTableProps) {
  const router                      = useRouter();
  const [deleteId,  setDeleteId]    = useState<string | null>(null);
  const [deleting,  setDeleting]    = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    const result = await deleteContactAction(deleteId);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Contacto eliminado");
    }

    setDeleteId(null);
    setDeleting(false);
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-card">
        <p className="text-muted-foreground">No se encontraron contactos</p>
        <Button asChild className="mt-4">
          <Link href="/contacts/new">Crear primer contacto</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map(({ contact, company, owner }) => (
              <TableRow
                key={contact.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => router.push(`/contacts/${contact.id}`)}
              >
                <TableCell className="font-medium">
                  {contact.firstName} {contact.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {company?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <ContactStatusBadge status={contact.status} />
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {contact.source ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {owner?.name ?? "—"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/contacts/${contact.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/contacts/${contact.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(contact.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1
                ? <Link href={`?page=${page - 1}`}>Anterior</Link>
                : <span>Anterior</span>
              }
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={page >= totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages
                ? <Link href={`?page=${page + 1}`}>Siguiente</Link>
                : <span>Siguiente</span>
              }
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de borrado */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el contacto
              y todas sus actividades asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
