"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  MotionHighlight,
  MotionHighlightItem,
} from "@/components/animate-ui/effects/motion-highlight";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon?: LucideIcon;
    requiresRole?: string;
    requiresWhitelistPermissions?: boolean;
  }[];
  userRoles?: string[];
}

export function SidebarNav({
  className,
  items,
  userRoles = [],
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();

  // Items jsou už filtrovány v layout, takže je použijeme přímo
  const filteredItems = items;
  return (
    <nav
      className={cn(
        "flex flex-col gap-2",
        className
      )}
      {...props}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Navigace
        </h3>
      </div>
      
      <MotionHighlight
        hover
        controlledItems
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        className="rounded-xl"
      >
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <MotionHighlightItem
              key={item.href}
              activeClassName="bg-[#b90505]/20 border-[#b90505]/40"
              value={item.href}
            >
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border",
                  isActive 
                    ? "text-[#b90505] bg-[#b90505]/20 border-[#b90505]/40 shadow-lg shadow-[#b90505]/10" 
                    : "text-gray-300 hover:text-foreground dark:text-white bg-transparent border-transparent"
                )}
                data-value={item.href}
                tabIndex={0}
              >
                {Icon && (
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive 
                        ? "text-[#b90505] drop-shadow-[0_0_5px_#b90505]" 
                        : "text-gray-400 group-hover:text-gray-300"
                    )} 
                  />
                )}
                <span className="flex-1">{item.title}</span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-[#b90505] shadow-[0_0_8px_#b90505]" />
                )}
              </Link>
            </MotionHighlightItem>
          );
        })}
      </MotionHighlight>
    </nav>
  );
}