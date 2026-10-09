import { useRef, useState, type FormEvent } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { fetchCustomer, saveDetails } from "@/lib/customer/functions";
import type { FormErrors } from "@/lib/customer/types";
import { validateDetails } from "@/lib/customer/validation";
import { useNotify } from "@/lib/notify-context";
import { CheckboxField, FormAlert, SkeletonBlock, TextField } from "@/components/account/ui";

export const Route = createFileRoute("/account/_dashboard/details")({
  loader: () => fetchCustomer(),
  head: () => ({
    meta: [{ title: "Account details | SkinFusion" }, { name: "robots", content: "noindex" }],
  }),
  pendingMs: 150,
  pendingMinMs: 300,
  pendingComponent: DetailsSkeleton,
  component: Details,
});

function Details() {
  const customer = Route.useLoaderData();
  const router = useRouter();
  const { notify } = useNotify();
  const save = useServerFn(saveDetails);
  const [firstName, setFirstName] = useState(customer.firstName);
  const [lastName, setLastName] = useState(customer.lastName);
  const [marketing, setMarketing] = useState(customer.marketingSubscribed);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy.current) return;
    const check = validateDetails({ firstName, lastName });
    if (Object.keys(check.errors).length) {
      setErrors(check.errors);
      firstRef.current?.focus();
      return;
    }
    busy.current = true;
    setSaving(true);
    setErrors({});
    try {
      const result = await save({ data: { firstName, lastName, marketing } });
      if (!result.ok) {
        setErrors(result.errors);
        requestAnimationFrame(() =>
          result.errors["firstName"] ? firstRef.current?.focus() : alertRef.current?.focus(),
        );
        return;
      }
      await router.invalidate(); // refreshes the greeting and the header badge
      notify("Details saved");
    } catch {
      setErrors({ form: "We couldn't save your details. Check your connection and try again." });
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="details-title" className="max-w-xl">
      <h2 id="details-title" className="text-sm md:text-base">
        Account details
      </h2>
      <form
        onSubmit={submit}
        noValidate
        className="mt-6 grid gap-5 border bg-background p-6 md:p-8"
      >
        {errors.form ? <FormAlert ref={alertRef} message={errors.form} /> : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            ref={firstRef}
            label="First name"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={setFirstName}
            error={errors["firstName"]}
          />
          <TextField
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            value={lastName}
            onChange={setLastName}
            error={errors["lastName"]}
          />
        </div>
        <TextField
          id="email"
          label="Email"
          type="email"
          readOnly
          value={customer.email}
          onChange={() => {}}
          hint="This is the email you sign in with. It can't be changed here."
        />
        <CheckboxField
          id="marketing"
          label="Email me about new blends and member offers"
          checked={marketing}
          onChange={setMarketing}
          hint="About twice a month. Unsubscribe any time."
        />
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            aria-disabled={saving}
            className="btn btn-primary"
          >
            {saving ? "Saving" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function DetailsSkeleton() {
  return (
    <div className="max-w-xl" aria-busy="true" aria-label="Loading account details">
      <SkeletonBlock className="h-5 w-40" />
      <div className="mt-6 grid gap-5 border bg-background p-6 md:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
        </div>
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-12" />
        <SkeletonBlock className="h-12 w-44" />
      </div>
    </div>
  );
}
