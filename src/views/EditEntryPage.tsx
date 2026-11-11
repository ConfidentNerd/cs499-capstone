import { formatDateTime } from "../lib/format";
import type { User, WeightEntry } from "../types";
import type { FieldErrors } from "../validation/schemas";
import { Field } from "./components";
import Layout from "./Layout";

type EditEntryPageProps = {
    user: User;
    entry: WeightEntry;
    weight: string;
    errors?: FieldErrors;
};

export default function EditEntryPage(props: EditEntryPageProps) {
    const errors = props.errors ?? {};

    return (
        <Layout title="Edit entry" user={props.user}>
            <div class="narrow">
                <h1>Edit entry</h1>
                <p class="center muted">Logged {formatDateTime(props.entry.recordedAt)}</p>
                <form method="post" action={`/entries/${props.entry.id}`}>
                    <Field label="Weight" name="weight" type="number" value={props.weight} error={errors.weight} />
                    <button class="wide" type="submit">
                        Save
                    </button>
                </form>
                <p class="center">
                    <a href="/">Cancel</a>
                </p>
            </div>
        </Layout>
    );
}
