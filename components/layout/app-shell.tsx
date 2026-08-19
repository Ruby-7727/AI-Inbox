import { Brand } from "@/components/layout/brand";
import { Sidebar } from "@/components/layout/sidebar";
import { ActionProvider } from "@/components/actions/action-provider";
import { UploadProvider } from "@/components/actions/upload-provider";
import { AnonymousAuthProvider } from "@/components/auth/anonymous-auth-provider";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AnonymousAuthProvider>
    <UploadProvider>
    <ActionProvider>
      <div className="min-h-screen md:grid md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">
          <header className="flex h-16 items-center border-b border-[#e5d2bf] bg-[#fffaf3]/90 px-5 backdrop-blur md:hidden">
            <Brand compact />
          </header>
          <main className="mx-auto w-full max-w-[var(--content-max)] px-5 py-6 sm:px-8 md:px-9 md:py-8 lg:px-10 xl:px-12">
            {children}
          </main>
        </div>
      </div>
    </ActionProvider>
    </UploadProvider>
    </AnonymousAuthProvider>
  );
}
