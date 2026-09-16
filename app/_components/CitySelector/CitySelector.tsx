'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveRecentCity } from './actions';

/**
 * Submit button with pending state from useFormStatus
 * Must be a separate component because useFormStatus only works inside a <form>
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Loading...' : 'Search'}
    </button>
  );
}

export function CitySelector() {
  // useActionState returns [state, formAction, isPending]
  // state = return value from Server Action
  // formAction = wrapped action to pass to form's action prop
  const [state, formAction] = useActionState(saveRecentCity, null);

  return (
    <div className="w-full max-w-md">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            name="city"
            placeholder="Enter city name..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <SubmitButton />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </form>
    </div>
  );
}
