import clsx from "clsx";

import styles from "./contentSection.module.css";

interface ContentSectionProps {
  className?: string;
}

const ContentSection = ({ className }: Readonly<ContentSectionProps>) => {
  return (
    <section className={clsx(styles.section, className)}>
      <p className={styles.text}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore
        consequatur commodi amet aliquam facilis recusandae ipsum, laboriosam
        earum tempore aut voluptatem fugit perferendis impedit repellendus,
        velit quam sequi unde quas.
      </p>
    </section>
  );
};

export default ContentSection;
