import type { FieldErrors } from "../validation/schemas";
import { Field, FormError } from "./components";
import Layout from "./Layout";

type AuthPageProps = {
    mode: "login" | "signup";
    username?: string;
    errors?: FieldErrors;
};

export default function AuthPage(props: AuthPageProps) {
    const isLogin = props.mode === "login";
    const errors = props.errors ?? {};

    return (
        <Layout title={isLogin ? "Log in" : "Sign up"} user={null}>
            <div class="narrow">
                <img class="auth-logo" src="/logo.png" alt="" width="72" height="72" />
                <h1>{isLogin ? "Log in" : "Create an account"}</h1>
                <form method="post" action={isLogin ? "/login" : "/signup"}>
                    <FormError message={errors.form} />
                    <Field
                        label="Username"
                        name="username"
                        type="text"
                        value={props.username}
                        error={errors.username}
                        autocomplete="username"
                    />
                    <Field
                        label={isLogin ? "Password" : "Password (8+ characters)"}
                        name="password"
                        type="password"
                        error={errors.password}
                        autocomplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button class="wide" type="submit">
                        {isLogin ? "Log in" : "Sign up"}
                    </button>
                </form>
                {isLogin ? (
                    <a class="button outline wide" href="/signup">
                        Sign up
                    </a>
                ) : (
                    <p class="center muted">
                        Already have an account? <a href="/login">Log in</a>
                    </p>
                )}
            </div>
        </Layout>
    );
}
