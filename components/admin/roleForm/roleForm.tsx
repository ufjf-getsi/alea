"use client";

import { useActionState } from "react";

import { updateUserRoleAction } from "@/actions/admin/updateUserRoleAction";
import { initialAuthState } from "@/actions/auth/authState";
import Alert from "@/components/ui/alert/alert";
import SubmitButton from "@/components/ui/submitButton/submitButton";

import styles from "./roleForm.module.css";

interface RoleFormProps {
  userId: string;
  currentLevel: number;
  options: { level: number; label: string }[];
}

export default function RoleForm({
  userId,
  currentLevel,
  options,
}: Readonly<RoleFormProps>) {
  const [state, formAction] = useActionState(
    updateUserRoleAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="userId" value={userId} />

      <div className={styles.row}>
        <select
          name="roleLevel"
          defaultValue={currentLevel}
          aria-label="Cargo"
          className={styles.select}
        >
          {options.map((o) => (
            <option key={o.level} value={o.level}>
              {o.label}
            </option>
          ))}
        </select>

        <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
          Salvar
        </SubmitButton>
      </div>

      {state.error && <Alert variant="error">{state.error}</Alert>}
    </form>
  );
}
