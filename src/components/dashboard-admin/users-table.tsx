"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateUserRoleAction } from "@/actions/users/update-user-role";
import { deactivateUserAction } from "@/actions/users/deactivate-user";
import { reactivateUserAction } from "@/actions/users/reactivate-user";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "cliente" | "restaurante" | "admin";
  deletedAt: Date | null;
};

export function UsersTable({ users, currentUserId }: { users: AdminUserRow[]; currentUserId: string }) {
  const router = useRouter();

  const { execute: updateRole } = useAction(updateUserRoleAction, {
    onSuccess: () => router.refresh(),
    onError: ({ error }) => toast.error(error.serverError ?? "No se pudo actualizar el rol."),
  });
  const { execute: deactivate } = useAction(deactivateUserAction, {
    onSuccess: () => {
      toast.success("Usuario desactivado.");
      router.refresh();
    },
    onError: ({ error }) => toast.error(error.serverError ?? "No se pudo desactivar."),
  });
  const { execute: reactivate } = useAction(reactivateUserAction, {
    onSuccess: () => {
      toast.success("Usuario reactivado.");
      router.refresh();
    },
    onError: ({ error }) => toast.error(error.serverError ?? "No se pudo reactivar."),
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link href={`/admin/usuarios/${user.id}`} className="hover:underline">
                  <p className="font-medium text-foreground">{user.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </Link>
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(role) =>
                    updateRole({ userId: user.id, role: role as AdminUserRow["role"] })
                  }
                  disabled={user.id === currentUserId}
                >
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {user.deletedAt ? (
                  <Badge variant="outline" className="border-destructive/40 text-destructive">
                    Desactivado
                  </Badge>
                ) : (
                  <Badge variant="outline">Activo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {user.id === currentUserId ? null : user.deletedAt ? (
                  <Button size="sm" variant="outline" onClick={() => reactivate({ userId: user.id })}>
                    Reactivar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deactivate({ userId: user.id })}
                  >
                    Desactivar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
