import clsx from "clsx";
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";

import ThemeSwitcher from "@/components/ui/themeSwitcher/themeSwitcher";
import menu from "@/components/layout/navMenu/navMenu.module.css";

import styles from "./themeMenu.module.css";

const popoverId = "theme-menu-popover";

export function ThemeMenu() {
  return (
    <>
      <button
        type="button"
        className={clsx(menu.trigger, menu.anchorTheme)}
        popoverTarget={popoverId}
        aria-label="Alterar tema"
      >
        <LuSun
          className={`${styles.icon} ${styles.iconLight}`}
          size={20}
          aria-hidden="true"
        />
        <LuMoon
          className={`${styles.icon} ${styles.iconDark}`}
          size={20}
          aria-hidden="true"
        />
        <LuMonitor
          className={`${styles.icon} ${styles.iconSystem}`}
          size={20}
          aria-hidden="true"
        />
      </button>

      <div
        id={popoverId}
        popover="auto"
        className={clsx(menu.popover, menu.popoverTheme)}
      >
        <div className={menu.content}>
          <ThemeSwitcher variant="list" />
        </div>
      </div>
    </>
  );
}
