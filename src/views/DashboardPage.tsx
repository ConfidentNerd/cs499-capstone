import { formatDateTime, formatWeight } from "../lib/format";
import type { Goal, User, WeightEntry } from "../types";
import type { FieldErrors } from "../validation/schemas";
import { Field } from "./components";
import Layout from "./Layout";

type DashboardPageProps = {
    user: User;
    goal: Goal;
    entries: WeightEntry[];
    currentWeight: number;
    progressPercent: number;
    goalReached: boolean;
    errors?: FieldErrors;
};

export default function DashboardPage(props: DashboardPageProps) {
    const { goal, entries } = props;
    const errors = props.errors ?? {};

    return (
        <Layout title="Dashboard" user={props.user}>
            {props.goalReached && (
                <div class="banner">
                    You reached your goal of {formatWeight(goal.goalWeight)}! <a href="/goal">Set a new goal</a>
                </div>
            )}

            <section class="progress">
                <h2>Progress</h2>
                <p class="progress-numbers">
                    {formatWeight(props.currentWeight)} / {formatWeight(goal.goalWeight)}
                </p>
                <progress value={props.progressPercent} max="100" />
                <p class="muted">
                    {props.progressPercent}% of the way from {formatWeight(goal.startWeight)} ·{" "}
                    <a href="/goal">Edit goal</a>
                </p>
            </section>

            <hr />

            <form class="add-entry" method="post" action="/entries">
                <Field label="Current weight" name="weight" type="number" error={errors.weight} />
                <button type="submit">Add Entry</button>
            </form>
            <p class="muted small">The date and time are saved automatically.</p>

            <hr />

            <h2>Recent Entries</h2>
            {entries.length === 0 ? <p class="muted">No entries yet.</p> : <EntriesTable entries={entries} />}
        </Layout>
    );
}

function EntriesTable(props: { entries: WeightEntry[] }) {
    return (
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Weight</th>
                        <th class="actions-column">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {props.entries.map((entry) => (
                        <tr>
                            <td>{formatDateTime(entry.recordedAt)}</td>
                            <td>{formatWeight(entry.weight)}</td>
                            <td class="actions-column">
                                <a class="small-button" href={`/entries/${entry.id}/edit`}>
                                    Edit
                                </a>
                                <form method="post" action={`/entries/${entry.id}/delete`}>
                                    <button class="small-button delete" type="submit">
                                        Delete
                                    </button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
