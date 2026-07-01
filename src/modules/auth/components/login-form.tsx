"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction, type LoginActionState } from "../actions";

const initialState: LoginActionState = {
  ok: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      <LogIn aria-hidden="true" size={16} />
      {pending ? "Entrando" : "Entrar"}
    </Button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="text-xs text-red-700">{messages[0]}</p>;
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <input name="next" type="hidden" value={nextPath} />
      <div>
        <h1 className="text-2xl font-semibold">Acceso interno</h1>
        <p className="mt-2 text-sm text-muted-foreground">Entra con tu usuario autorizado de ConstructionOS.</p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input autoComplete="email" id="email" name="email" placeholder="admin@empresa.com" type="email" />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="password">
          Contrasena
        </label>
        <Input autoComplete="current-password" id="password" name="password" type="password" />
        <FieldError messages={state.fieldErrors?.password} />
      </div>
      <SubmitButton />
      {state.message ? <p className="text-sm text-red-700">{state.message}</p> : null}
    </form>
  );
}
