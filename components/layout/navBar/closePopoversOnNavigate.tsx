"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Fecha popovers abertos (menus da navbar) quando a rota muda. */
export function ClosePopoversOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    document
      .querySelectorAll<HTMLElement>(":popover-open")
      .forEach((el) => el.hidePopover());
  }, [pathname]);

  return null;
}
