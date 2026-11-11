type FieldProps = {
    label: string;
    name: string;
    type: "text" | "password" | "number";
    value?: string;
    error?: string;
    autocomplete?: string;
};

export function Field(props: FieldProps) {
    return (
        <label>
            {props.label}
            <input
                name={props.name}
                type={props.type}
                value={props.value ?? ""}
                step={props.type === "number" ? "0.1" : undefined}
                autocomplete={props.autocomplete}
                class={props.error ? "invalid" : undefined}
                required
            />
            {props.error && <span class="error">{props.error}</span>}
        </label>
    );
}

// errors not tied to a field, like wrong password
export function FormError(props: { message?: string }) {
    if (!props.message) return null;

    return <p class="form-error">{props.message}</p>;
}
