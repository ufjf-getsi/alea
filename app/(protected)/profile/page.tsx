import { Suspense } from "react";

import { requireSession } from "@/lib/auth/session";
import { getRoleName } from "@/lib/auth/roles";
import { ChangePasswordForm } from "@/components/auth/changePasswordForm/changePasswordForm";
import { SignOutAllDevicesButton } from "@/components/auth/signOutAllDevicesButton/signOutAllDevicesButton";

import PageContainer from "@/components/layout/pageContainer/pageContainer";
import Card from "@/components/ui/card/card";
import Header from "@/components/ui/header/header";

import styles from "./page.module.css";

async function ProfileHeader() {
  const session = await requireSession();

  return (
    <div className={styles.header}>
      <Header as="h1" variant="section">
        {session.user.name}
      </Header>

      <p className={styles.role}>{getRoleName(session.user.roleLevel)}</p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <PageContainer>
      <div className={styles.page}>
        <Suspense
          fallback={
            <Header as="h1" variant="section">
              Perfil
            </Header>
          }
        >
          <ProfileHeader />
        </Suspense>

        <div className={styles.grid}>
          <Card
            title="Alterar senha"
            description="Use uma senha que você não utiliza em outros serviços."
          >
            <ChangePasswordForm />
          </Card>

          <Card
            title="Dispositivos"
            description="Encerra sua sessão em todos os dispositivos, inclusive neste."
          >
            <SignOutAllDevicesButton />
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
