"use client";

import Link                from "next/link";
import { usePathname }     from "next/navigation";
import { navigation }      from "@/lib/navigation";
import { cn }              from "@/lib/utils";
import { Button }          from "@/components/ui/button";
import { ScrollArea }      from "@/components/ui/scroll-area";
import { Badge }           from "@/components/ui/badge";

// Instala ScrollArea si no la tienes:
// npx shadcn@latest add scroll-area

interface SidebarProps {
  organizationName?: string | null;
  userName?:         string | null;
  userRole?:         string | null;
}

export function Sidebar({ organizationName, userName, userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo / Org name */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          {organizationName?.[0]?.toUpperCase() ?? "C"}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none truncate max-w-[140px]">
            {organizationName ?? "Mi CRM"}
          </span>
          <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon    = item.icon;
                  const active  = pathname === item.href ||
                                  pathname.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3",
                          active && "font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Usuario en el fondo */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <Badge variant="outline" className="text-xs capitalize mt-0.5">
              {userRole}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}
