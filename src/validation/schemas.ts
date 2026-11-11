import * as v from "valibot";

// wide range as the app has no units on purpose,
// so this has to fit both kg & lb
const MIN_WEIGHT = 20;
const MAX_WEIGHT = 1100;

function weightField(label: string) {
    return v.pipe(
        // a missing field counts as empty
        v.optional(v.string(`${label} must be a number`), ""),
        // form values come as strings, toNumber turns them into numbers first
        v.toNumber(`${label} must be a number`),
        v.minValue(MIN_WEIGHT, `${label} must be at least ${MIN_WEIGHT}`),
        v.maxValue(MAX_WEIGHT, `${label} must be at most ${MAX_WEIGHT}`),
    );
}

export const signUpSchema = v.object({
    username: v.pipe(
        v.string(),
        v.trim(),
        v.minLength(3, "Username must be at least 3 characters"),
        v.maxLength(32, "Username must be at most 32 characters"),
        v.regex(/^[A-Za-z0-9_]+$/, "Username can only use letters, numbers and underscores"),
    ),
    password: v.pipe(
        v.string(),
        v.minLength(8, "Password must be at least 8 characters"),
        v.maxLength(128, "Password must be at most 128 characters"),
    ),
});

export const logInSchema = v.object({
    username: v.pipe(v.string(), v.trim(), v.minLength(1, "Enter your username")),
    password: v.pipe(v.string(), v.minLength(1, "Enter your password")),
});

export const goalSchema = v.pipe(
    v.object({
        startWeight: weightField("Starting weight"),
        goalWeight: weightField("Goal weight"),
    }),
    // forward puts the error on goalWeight so it show under that field
    v.forward(
        v.check(
            (goal) => goal.startWeight !== goal.goalWeight,
            "Goal weight must be different from your starting weight",
        ),
        ["goalWeight"],
    ),
);

export const entrySchema = v.object({
    weight: weightField("Weight"),
});

export const entryIdSchema = v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1));

export function getFormText(form: Record<string, unknown>, field: string): string {
    const value = form[field];
    if (typeof value === "string") return value;

    return "";
}

// field name -> error message
export type FieldErrors = Record<string, string>;

// issues without a path go under "form"
export function getFieldErrors(issues: v.BaseIssue<unknown>[]): FieldErrors {
    const errors: FieldErrors = {};
    for (const issue of issues) {
        const field = v.getDotPath(issue) ?? "form";
        if (errors[field] === undefined) errors[field] = issue.message;
    }
    return errors;
}
