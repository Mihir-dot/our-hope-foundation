type Option = { value: string; label: string };

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: Option[];
  id?: string;
  rows?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>;

export function Field({ label, name, hint, error, as = 'input', options = [], id, rows, ...rest }: FieldProps) {
  const fieldId = id || name;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  const shared = {
    id: fieldId,
    name,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  };

  return (
    <div className={`field ${rest.className ?? ''}`.trim()}>
      <label htmlFor={fieldId}>{label}</label>
      {as === 'textarea' ? (
        <textarea rows={rows} {...shared} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : as === 'select' ? (
        <select {...shared} {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...shared} {...rest} />
      )}
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
