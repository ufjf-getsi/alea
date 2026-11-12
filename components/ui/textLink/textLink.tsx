import type { ComponentProps } from "react";
import Link from "next/link";
import clsx from "clsx";

import styles from "./textLink.module.css";

export default function TextLink({
  className,
  ...rest
}: ComponentProps<typeof Link>) {
  return <Link className={clsx(styles.link, className)} {...rest} />;
}
