import type { ComponentProps } from "react";
import clsx from "clsx";

import styles from "./form.module.css";

export default function Form({ className, ...rest }: ComponentProps<"form">) {
  return <form className={clsx(styles.form, className)} {...rest} />;
}
