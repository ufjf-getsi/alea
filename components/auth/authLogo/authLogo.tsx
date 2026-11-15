import Image from "next/image";

import logo from "@/assets/images/logo/logo.svg";

import styles from "./authLogo.module.css";

export default function AuthLogo() {
  return (
    <div className={styles.container}>
      <Image
        src={logo}
        alt="Alea"
        width={60}
        height={60}
        priority
        className={styles.logo}
      />
    </div>
  );
}
