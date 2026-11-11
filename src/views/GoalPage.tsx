import type { User } from "../types";
import type { FieldErrors } from "../validation/schemas";
import { Field } from "./components";
import Layout from "./Layout";

type GoalPageProps = {
    user: User;
    isFirstGoal: boolean;
    startWeight?: string;
    goalWeight?: string;
    errors?: FieldErrors;
};

export default function GoalPage(props: GoalPageProps) {
    const errors = props.errors ?? {};

    return (
        <Layout title="Goal" user={props.user}>
            <div class="narrow">
                {props.isFirstGoal ? <h1>Welcome! Set your goal</h1> : <h1>Edit your goal</h1>}
                <p class="center muted">Progress is measured from your starting weight to your goal.</p>
                <form method="post" action="/goal">
                    <Field
                        label="Starting weight"
                        name="startWeight"
                        type="number"
                        value={props.startWeight}
                        error={errors.startWeight}
                    />
                    <Field
                        label="Goal weight"
                        name="goalWeight"
                        type="number"
                        value={props.goalWeight}
                        error={errors.goalWeight}
                    />
                    <button class="wide" type="submit">
                        {props.isFirstGoal ? "Save and continue" : "Save goal"}
                    </button>
                </form>
                {/* new users don't have a dashboard to go back to yet */}
                {!props.isFirstGoal && (
                    <p class="center">
                        <a href="/">Cancel</a>
                    </p>
                )}
            </div>
        </Layout>
    );
}
