import type { ReactNode } from "react";

export function AdminConsole({
  createForm,
  management,
}: {
  createForm: ReactNode;
  management: ReactNode;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <section className="product-card p-4">
        {createForm}
      </section>
      <section className="product-card p-4">
        {management}
      </section>
    </div>
  );
}
