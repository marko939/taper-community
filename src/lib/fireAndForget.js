/**
 * Runs an async function without blocking the caller.
 * All errors are logged but never thrown — side effects
 * must never be able to crash or block core actions.
 */
export function fireAndForget(context, fn) {
  Promise.resolve().then(fn).catch((err) => {
    console.error(`[side-effect-error][${context}]`, err?.message || err);
  });
}
