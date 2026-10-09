import type { ReactNode, Ref } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import type { BadgeTone } from "@/lib/customer/format";

// Shared building blocks for the account pages, styled with the site tokens: square corners,
// Jost uppercase labels, cream/blush surfaces, one coral accent.

const inputClass =
  "min-h-12 w-full border border-input bg-background px-4 text-base outline-none transition-colors focus:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive";

type FieldBase = {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
};

function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  children,
}: FieldBase & { children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="label-caps text-[0.7rem]">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-destructive">
          <WarningCircle size={16} weight="light" className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) =>
  [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

type TextFieldProps = FieldBase & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "tel" | "email";
  inputMode?: "text" | "numeric" | "tel";
  autoComplete?: string;
  maxLength?: number;
  prefix?: string;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export function TextField(props: TextFieldProps) {
  const { id, error, hint, required, value, onChange, onBlur, prefix, readOnly, ref } = props;
  const input = (
    <input
      ref={ref}
      id={id}
      name={id}
      type={props.type ?? "text"}
      inputMode={props.inputMode}
      autoComplete={props.autoComplete}
      maxLength={props.maxLength}
      value={value}
      readOnly={readOnly}
      required={required}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${inputClass} ${prefix ? "border-l-0" : ""} ${readOnly ? "cursor-default border-dashed bg-beige/60 text-muted-foreground" : ""}`}
    />
  );
  return (
    <FieldShell {...props}>
      {prefix ? (
        <div className="flex">
          <span
            aria-hidden="true"
            className="grid min-h-12 shrink-0 place-items-center border border-input bg-beige px-3 text-base text-muted-foreground"
          >
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}

type SelectFieldProps = FieldBase & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: readonly { code: string; name: string }[];
  placeholder: string;
  autoComplete?: string;
  ref?: Ref<HTMLSelectElement>;
};

export function SelectField(props: SelectFieldProps) {
  const { id, error, hint, required, value, onChange, onBlur, options, placeholder, ref } = props;
  return (
    <FieldShell {...props}>
      <select
        ref={ref}
        id={id}
        name={id}
        value={value}
        required={required}
        autoComplete={props.autoComplete}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`${inputClass} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%231f1f1f' stroke-width='1.2'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="h-5 w-5 shrink-0 accent-primary"
        />
        <span>{label}</span>
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="pl-8 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Form-level error, announced when it appears. */
export function FormAlert({ message, ref }: { message: string; ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-2 border border-destructive/40 bg-background px-4 py-3 text-sm text-destructive outline-none"
    >
      <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

const tones: Record<BadgeTone, string> = {
  done: "bg-pastel-green",
  progress: "bg-pastel-peach",
  attention: "bg-pastel-yellow",
  neutral: "bg-beige",
};

/** Square status badge. Text, not colour alone, carries the meaning. */
export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={`label-caps inline-flex items-center px-2.5 py-1 text-[0.62rem] text-foreground ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border bg-background p-6 md:p-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm md:text-base">{title}</h2>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Grey block in the shape of the content it stands in for. */
export function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-beige ${className}`} />;
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: ReactNode;
}) {
  return (
    <div className="border border-dashed bg-background px-6 py-14 text-center">
      <h2 className="text-base">{title}</h2>
      <p className="mx-auto mt-3 max-w-[40ch] text-muted-foreground">{text}</p>
      <div className="mt-8">{action}</div>
    </div>
  );
}
