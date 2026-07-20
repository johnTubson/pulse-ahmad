/**
 * Pure offline mutation queue.
 *
 * The store layer owns side effects (persistence, NetInfo, flushing to
 * Supabase); everything here is deterministic and unit-tested. The queue
 * applies **last-write-wins** coalescing so a burst of edits while offline
 * collapses into the minimum set of server operations.
 */

export type SyncEntity = 'expense' | 'mood' | 'category' | 'budget' | 'profile';
export type SyncOperation = 'create' | 'update' | 'delete';

export type QueuedMutation = {
  /** Unique id for this queue entry. */
  id: string;
  entity: SyncEntity;
  operation: SyncOperation;
  /** Local or server id of the affected record; used for coalescing. */
  targetId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
};

export type NewMutation = Omit<QueuedMutation, 'attempts'>;

/** A mutation is dropped once it fails this many times to avoid poison loops. */
export const MAX_ATTEMPTS = 5;

function sameTarget(a: QueuedMutation, b: NewMutation): boolean {
  return a.entity === b.entity && a.targetId === b.targetId;
}

/**
 * Add a mutation, collapsing redundant operations on the same record:
 * - update after a pending create → merge into the create
 * - update after a pending update → merge payloads (newest wins)
 * - delete of a record that was only created offline → drop both (net no-op)
 * - delete otherwise → discard pending updates, keep a single delete
 */
export function enqueue(queue: QueuedMutation[], mutation: NewMutation): QueuedMutation[] {
  const incoming: QueuedMutation = { ...mutation, attempts: 0 };

  if (mutation.operation === 'update') {
    const existing = queue.find(
      (m) => sameTarget(m, mutation) && (m.operation === 'create' || m.operation === 'update'),
    );
    if (existing) {
      return queue.map((m) =>
        m.id === existing.id ? { ...m, payload: { ...m.payload, ...mutation.payload } } : m,
      );
    }
  }

  if (mutation.operation === 'delete') {
    const pendingCreate = queue.find((m) => sameTarget(m, mutation) && m.operation === 'create');
    if (pendingCreate) {
      return queue.filter((m) => !sameTarget(m, mutation));
    }
    return [...queue.filter((m) => !sameTarget(m, mutation)), incoming];
  }

  return [...queue, incoming];
}

/** FIFO: the next mutation to attempt. */
export function peek(queue: QueuedMutation[]): QueuedMutation | undefined {
  return queue[0];
}

export function remove(queue: QueuedMutation[], id: string): QueuedMutation[] {
  return queue.filter((m) => m.id !== id);
}

export function incrementAttempts(queue: QueuedMutation[], id: string): QueuedMutation[] {
  return queue.map((m) => (m.id === id ? { ...m, attempts: m.attempts + 1 } : m));
}

export function hasExceededAttempts(mutation: QueuedMutation): boolean {
  return mutation.attempts >= MAX_ATTEMPTS;
}
