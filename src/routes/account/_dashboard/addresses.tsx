import { useRef, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "@phosphor-icons/react";
import { deleteAddress, fetchAddresses, setDefaultAddress } from "@/lib/customer/functions";
import type { Address } from "@/lib/customer/types";
import { useNotify } from "@/lib/notify-context";
import { AddressBlock } from "@/components/account/AddressBlock";
import { AddressForm } from "@/components/account/AddressForm";
import { EmptyState, FormAlert, SkeletonBlock, StatusBadge } from "@/components/account/ui";

export const Route = createFileRoute("/account/_dashboard/addresses")({
  loader: () => fetchAddresses(),
  head: () => ({
    meta: [{ title: "Addresses | SkinFusion" }, { name: "robots", content: "noindex" }],
  }),
  pendingMs: 150,
  pendingMinMs: 300,
  pendingComponent: AddressesSkeleton,
  component: Addresses,
});

type Editing = { kind: "new" } | { kind: "edit"; id: string } | null;

function Addresses() {
  const addresses = Route.useLoaderData();
  const router = useRouter();
  const { notify } = useNotify();
  const [editing, setEditing] = useState<Editing>(null);
  const addButton = useRef<HTMLButtonElement>(null);

  const saved = async (message: string) => {
    await router.invalidate();
    setEditing(null);
    notify(message);
    requestAnimationFrame(() => addButton.current?.focus());
  };

  const addForm = (
    <div className="border bg-background p-6 md:p-8">
      <AddressForm
        address={null}
        canBeDefault={addresses.length > 0}
        onSaved={saved}
        onCancel={() => setEditing(null)}
      />
    </div>
  );

  if (!addresses.length && editing?.kind !== "new")
    return (
      <EmptyState
        title="No saved addresses"
        text="Save a delivery address and checkout fills it in for you."
        action={
          <button onClick={() => setEditing({ kind: "new" })} className="btn btn-primary">
            Add address
          </button>
        }
      />
    );

  return (
    <section aria-labelledby="addresses-title" className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="addresses-title" className="text-sm md:text-base">
          Saved addresses
        </h2>
        {editing?.kind === "new" ? null : (
          <button
            ref={addButton}
            onClick={() => setEditing({ kind: "new" })}
            className="btn btn-outline gap-2"
          >
            <Plus size={16} weight="light" aria-hidden="true" />
            Add address
          </button>
        )}
      </div>
      {editing?.kind === "new" ? addForm : null}
      <ul data-anim="cards" className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) =>
          editing?.kind === "edit" && editing.id === a.id ? (
            <li key={a.id} className="border bg-background p-6 md:col-span-2 md:p-8">
              <AddressForm
                address={a}
                canBeDefault={!a.isDefault}
                onSaved={saved}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => setEditing({ kind: "edit", id: a.id })}
            />
          ),
        )}
      </ul>
    </section>
  );
}

function AddressCard({ address, onEdit }: { address: Address; onEdit: () => void }) {
  const router = useRouter();
  const { notify } = useNotify();
  const remove = useServerFn(deleteAddress);
  const makeDefault = useServerFn(setDefaultAddress);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState<"delete" | "default" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  const act = async (kind: "delete" | "default") => {
    if (pending) return;
    setPending(kind);
    setError(null);
    try {
      const result = await (kind === "delete" ? remove : makeDefault)({ data: { id: address.id } });
      if (!result.ok) {
        setError(result.errors.form ?? "That didn't work. Please try again.");
        return;
      }
      await router.invalidate();
      notify(kind === "delete" ? "Address deleted" : "Default address updated");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setPending(null);
    }
  };

  const name = `${address.firstName} ${address.lastName}`.trim();
  return (
    <li className="flex flex-col border bg-background p-6">
      {address.isDefault ? (
        <div className="mb-4">
          <StatusBadge label="Default" tone="done" />
        </div>
      ) : null}
      <AddressBlock address={address} />
      {error ? (
        <div className="mt-4">
          <FormAlert message={error} />
        </div>
      ) : null}
      {confirming ? (
        <div
          role="group"
          aria-label={`Delete the address for ${name}?`}
          className="mt-6 border-t pt-5"
        >
          <p>Delete this address?</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => void act("delete")}
              disabled={pending !== null}
              className="btn bg-destructive text-destructive-foreground hover:opacity-90"
            >
              {pending === "delete" ? "Deleting" : "Delete"}
            </button>
            <button
              ref={cancelRef}
              onClick={() => {
                setConfirming(false);
                requestAnimationFrame(() => deleteRef.current?.focus());
              }}
              disabled={pending !== null}
              className="btn btn-outline"
            >
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-6">
          <button
            onClick={onEdit}
            className="label-caps min-h-11 text-[0.65rem] underline underline-offset-4"
          >
            Edit<span className="sr-only"> address for {name}</span>
          </button>
          {address.isDefault ? null : (
            <button
              onClick={() => void act("default")}
              disabled={pending !== null}
              className="label-caps min-h-11 text-[0.65rem] underline underline-offset-4 disabled:opacity-50"
            >
              {pending === "default" ? "Saving" : "Set as default"}
            </button>
          )}
          <button
            ref={deleteRef}
            onClick={() => {
              setConfirming(true);
              requestAnimationFrame(() => cancelRef.current?.focus());
            }}
            className="label-caps min-h-11 text-[0.65rem] text-destructive underline underline-offset-4"
          >
            Delete<span className="sr-only"> address for {name}</span>
          </button>
        </div>
      )}
    </li>
  );
}

function AddressesSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading addresses">
      <div className="flex justify-between">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-12 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-52" />
        <SkeletonBlock className="h-52" />
      </div>
    </div>
  );
}
