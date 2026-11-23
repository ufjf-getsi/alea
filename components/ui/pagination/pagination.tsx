import { ButtonLink } from "@/components/ui/button/button";

import styles from "./pagination.module.css";

type Props = Readonly<{
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}>;

export default function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      {page > 1 ? (
        <ButtonLink href={hrefFor(page - 1)} variant="secondary" size="sm">
          Anterior
        </ButtonLink>
      ) : (
        <span />
      )}

      <span className={styles.muted}>
        Página {page} de {totalPages}
      </span>

      {page < totalPages ? (
        <ButtonLink href={hrefFor(page + 1)} variant="secondary" size="sm">
          Próxima
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}
