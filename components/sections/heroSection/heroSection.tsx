import Image from "next/image";
import clsx from "clsx";

import placeholder from "@/assets/images/placeholders/landscape.svg";
import Header from "@/components/ui/header/header";

import styles from "./heroSection.module.css";

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: Readonly<HeroSectionProps>) {
  return (
    <section
      aria-labelledby="hero-title"
      className={clsx(styles.hero, className)}
    >
      <div className={styles.imageContainer}>
        <Image
          src={placeholder}
          alt="Placeholder Image"
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <Header variant="main" id="hero-title">
            Lorem ipsum
          </Header>
        </div>

        <div className={styles.text}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore
            consequatur commodi amet aliquam facilis recusandae ipsum,
            laboriosam earum tempore aut voluptatem fugit perferendis impedit
            repellendus, velit quam sequi unde quas.
          </p>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore
            consequatur commodi amet aliquam facilis recusandae ipsum,
            laboriosam earum tempore aut voluptatem fugit perferendis impedit
            repellendus, velit quam sequi unde quas.
          </p>
        </div>
      </div>
    </section>
  );
}
