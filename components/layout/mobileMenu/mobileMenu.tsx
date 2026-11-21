import Link from "next/link";
import clsx from "clsx";
import { LuMenu } from "react-icons/lu";

import menu from "@/components/layout/navMenu/navMenu.module.css";

const popoverId = "nav-menu-popover";

interface MobileMenuProps {
  links: { href: string; label: string }[];
  showSignUp: boolean;
}

export function MobileMenu({ links, showSignUp }: Readonly<MobileMenuProps>) {
  return (
    <>
      <button
        type="button"
        className={clsx(menu.trigger, menu.anchorNav, menu.mobileOnly)}
        popoverTarget={popoverId}
        aria-label="Abrir menu de navegação"
      >
        <LuMenu size={22} aria-hidden="true" />
      </button>

      <div
        id={popoverId}
        popover="auto"
        className={clsx(
          menu.popover,
          menu.popoverNav,
          menu.alignStart,
          menu.mobileOnly,
        )}
      >
        <div className={menu.content}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={menu.option}>
              {link.label}
            </Link>
          ))}
          {showSignUp && (
            <Link href="/signUp" className={clsx(menu.option, menu.onlyXs)}>
              Criar conta
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
