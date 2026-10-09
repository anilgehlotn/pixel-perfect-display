import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveAddress } from "@/lib/customer/functions";
import { INDIAN_STATES } from "@/lib/customer/india";
import type { Address, FormErrors } from "@/lib/customer/types";
import { toFormValues, validateAddress, type AddressFormValues } from "@/lib/customer/validation";
import { CheckboxField, FormAlert, SelectField, TextField } from "./ui";

type Key = keyof AddressFormValues;
const ORDER: Key[] = ["fullName", "phone", "address1", "address2", "city", "zoneCode", "zip"];

/**
 * Add or edit an Indian delivery address. Validates on blur and on submit (same rules as the
 * server), keeps what was typed if saving fails, and moves focus to the first problem.
 */
export function AddressForm({
  address,
  canBeDefault,
  onSaved,
  onCancel,
}: {
  address: Address | null;
  canBeDefault: boolean;
  onSaved: (message: string) => void;
  onCancel: () => void;
}) {
  const save = useServerFn(saveAddress);
  const [values, setValues] = useState<AddressFormValues>(() => toFormValues(address));
  const [makeDefault, setMakeDefault] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const busy = useRef(false); // blocks a second submit before React re-renders
  const fields = useRef<Partial<Record<Key, HTMLInputElement | HTMLSelectElement | null>>>({});
  const alertRef = useRef<HTMLDivElement>(null);
  const prefix = address ? `edit-${address.id.split("/").pop()}` : "new";

  const set = (key: Key) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Once a field has shown an error, re-check it as the customer fixes it.
    if (errors[key])
      setErrors((e) => ({ ...e, [key]: validateAddress({ ...values, [key]: value }).errors[key] }));
  };
  const blur = (key: Key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: validateAddress(values).errors[key] }));
  };

  const focusFirst = (errs: FormErrors) => {
    const key = ORDER.find((k) => errs[k]);
    if (key) fields.current[key]?.focus();
    else if (errs.form) alertRef.current?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy.current) return;
    setTouched(Object.fromEntries(ORDER.map((k) => [k, true])));
    const check = validateAddress(values);
    if (Object.keys(check.errors).length) {
      setErrors(check.errors);
      requestAnimationFrame(() => focusFirst(check.errors));
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      const result = await save({
        data: { id: address?.id ?? null, values, makeDefault: canBeDefault && makeDefault },
      });
      if (result.ok) {
        onSaved(address ? "Address updated" : "Address added");
        return;
      }
      setErrors(result.errors);
      requestAnimationFrame(() => focusFirst(result.errors));
    } catch {
      const errs = { form: "We couldn't save this address. Check your connection and try again." };
      setErrors(errs);
      requestAnimationFrame(() => focusFirst(errs));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const err = (k: Key) => (touched[k] ? errors[k] : undefined);
  const ref = (k: Key) => (el: HTMLInputElement | HTMLSelectElement | null) => {
    fields.current[k] = el;
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5" aria-labelledby={`${prefix}-title`}>
      <h3 id={`${prefix}-title`} className="text-sm">
        {address ? "Edit address" : "New address"}
      </h3>
      {errors.form ? <FormAlert ref={alertRef} message={errors.form} /> : null}
      <p className="text-sm text-muted-foreground">
        Fields marked <span className="text-destructive">*</span> are required.
      </p>
      <TextField
        id={`${prefix}-fullName`}
        ref={ref("fullName")}
        label="Full name"
        required
        autoComplete="name"
        value={values.fullName}
        onChange={set("fullName")}
        onBlur={blur("fullName")}
        error={err("fullName")}
      />
      <TextField
        id={`${prefix}-phone`}
        ref={ref("phone")}
        label="Mobile number"
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        prefix="+91"
        maxLength={14}
        hint="10 digits, for delivery updates"
        value={values.phone}
        onChange={set("phone")}
        onBlur={blur("phone")}
        error={err("phone")}
      />
      <TextField
        id={`${prefix}-address1`}
        ref={ref("address1")}
        label="Address line 1"
        required
        autoComplete="address-line1"
        hint="House or flat number, building, street"
        value={values.address1}
        onChange={set("address1")}
        onBlur={blur("address1")}
        error={err("address1")}
      />
      <TextField
        id={`${prefix}-address2`}
        ref={ref("address2")}
        label="Address line 2"
        autoComplete="address-line2"
        hint="Area, landmark (optional)"
        value={values.address2}
        onChange={set("address2")}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={`${prefix}-city`}
          ref={ref("city")}
          label="City"
          required
          autoComplete="address-level2"
          value={values.city}
          onChange={set("city")}
          onBlur={blur("city")}
          error={err("city")}
        />
        <TextField
          id={`${prefix}-zip`}
          ref={ref("zip")}
          label="PIN code"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={values.zip}
          onChange={set("zip")}
          onBlur={blur("zip")}
          error={err("zip")}
        />
      </div>
      <SelectField
        id={`${prefix}-zoneCode`}
        ref={ref("zoneCode")}
        label="State or union territory"
        required
        autoComplete="address-level1"
        placeholder="Choose a state"
        options={INDIAN_STATES}
        value={values.zoneCode}
        onChange={set("zoneCode")}
        onBlur={blur("zoneCode")}
        error={err("zoneCode")}
      />
      {canBeDefault ? (
        <CheckboxField
          id={`${prefix}-default`}
          label="Use as my default address"
          checked={makeDefault}
          onChange={setMakeDefault}
        />
      ) : null}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button type="submit" disabled={saving} aria-disabled={saving} className="btn btn-primary">
          {saving ? "Saving" : "Save address"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
