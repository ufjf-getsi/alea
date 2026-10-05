import Link from "next/link";
import { logoutAction } from "@/actions/auth/logoutAction";
import { LuCircleUserRound } from "react-icons/lu";
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
        className={styles.trigger}
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

      <div id={popoverId} popover="auto" className={styles.popover}>
        <div className={styles.content}>
          <Link href="/profile" className={styles.option}>
            Minha conta
          </Link>

          <form action={logoutAction}>
            <button type="submit" className={styles.option}>
              Sair
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
