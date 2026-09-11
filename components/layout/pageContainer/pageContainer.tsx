import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./pageContainer.module.css";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className,
}: Readonly<PageContainerProps>) {
  return <div className={clsx(styles.container, className)}>{children}</div>;
}
