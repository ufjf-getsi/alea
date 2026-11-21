import Link from "next/link";
import clsx from "clsx";
import { logoutAction } from "@/actions/auth/logoutAction";
import { LuCircleUserRound } from "react-icons/lu";
import menu from "@/components/layout/navMenu/navMenu.module.css";
import styles from "./userMenu.module.css";

interface UserMenuProps {
  image?: string | null;
}

const popoverId = "user-menu-popover";

export function UserMenu({ image }: UserMenuProps) {
  return (
    <>
      <button
        type="button"
        className={clsx(menu.trigger, menu.anchorUser)}
        popoverTarget={popoverId}
        aria-label="Abrir menu do usuário"
      >
        {image ? (
          <img src={image} alt="Foto do usuário" className={styles.avatar} />
        ) : (
          <LuCircleUserRound
            className={styles.avatar}
            strokeWidth={1}
            aria-hidden="true"
          />
        )}
      </button>

      <div
        id={popoverId}
        popover="auto"
        className={clsx(menu.popover, menu.popoverUser)}
      >
        <div className={menu.content}>
          <Link href="/profile" className={menu.option}>
            Minha conta
          </Link>

          <form action={logoutAction}>
            <button type="submit" className={menu.option}>
              Sair
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
