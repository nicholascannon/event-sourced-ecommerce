/**
 * This function should never get run at runtime because TypeScript
 * should not allow valid values to be passed as `_arg` which is typed
 * as `never`.
 */
export function assertNever(_arg: never) {
    throw new Error('Never value reached');
}
