import type { ChangeEventHandler } from "react";

interface FieldProps {
  id: string;
  label: string;
  inputProps: {
    value?: string | number;
    name?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    type?: "number" | "text" | "password" | "email";
    required?: boolean;
  };
  error?: string;
}

export default function Field({ label, inputProps, error, id }: FieldProps) {
  return (
    <div className="form-control w-full mb-3">
      <label className="label" htmlFor={id}>
        <span className="label-text">{label}</span>
      </label>
      <input
        {...inputProps}
        id={id}
        className={`input input-bordered w-full ${error ? "input-error" : ""}`}
      />
      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </div>
  );
}
