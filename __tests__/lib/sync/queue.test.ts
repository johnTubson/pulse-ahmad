import {
  enqueue,
  hasExceededAttempts,
  incrementAttempts,
  MAX_ATTEMPTS,
  peek,
  remove,
  type NewMutation,
  type QueuedMutation,
} from '@/lib/sync/queue';

function make(overrides: Partial<NewMutation> = {}): NewMutation {
  return {
    id: overrides.id ?? 'q1',
    entity: overrides.entity ?? 'expense',
    operation: overrides.operation ?? 'create',
    targetId: overrides.targetId ?? 'e1',
    payload: overrides.payload ?? {},
    createdAt: overrides.createdAt ?? '2026-07-08T10:00:00Z',
  };
}

describe('enqueue', () => {
  it('appends a create with zeroed attempts', () => {
    const q = enqueue([], make());
    expect(q).toHaveLength(1);
    expect(q[0].attempts).toBe(0);
    expect(q[0].operation).toBe('create');
  });

  it('merges an update into a pending create for the same target', () => {
    let q = enqueue([], make({ id: 'q1', operation: 'create', payload: { amount: 10 } }));
    q = enqueue(q, make({ id: 'q2', operation: 'update', payload: { amount: 25, note: 'hi' } }));

    expect(q).toHaveLength(1);
    expect(q[0].operation).toBe('create');
    expect(q[0].payload).toEqual({ amount: 25, note: 'hi' });
  });

  it('merges consecutive updates (newest wins)', () => {
    let q = enqueue([], make({ id: 'q1', operation: 'update', payload: { amount: 10 } }));
    q = enqueue(q, make({ id: 'q2', operation: 'update', payload: { amount: 30 } }));

    expect(q).toHaveLength(1);
    expect(q[0].payload).toEqual({ amount: 30 });
  });

  it('drops both when deleting a record only created offline', () => {
    let q = enqueue([], make({ id: 'q1', operation: 'create' }));
    q = enqueue(q, make({ id: 'q2', operation: 'delete', payload: {} }));

    expect(q).toHaveLength(0);
  });

  it('replaces pending updates with a single delete for existing records', () => {
    let q = enqueue([], make({ id: 'q1', operation: 'update', payload: { amount: 5 } }));
    q = enqueue(q, make({ id: 'q2', operation: 'delete' }));

    expect(q).toHaveLength(1);
    expect(q[0].operation).toBe('delete');
  });

  it('keeps operations on different targets independent', () => {
    let q = enqueue([], make({ id: 'q1', targetId: 'e1', operation: 'create' }));
    q = enqueue(q, make({ id: 'q2', targetId: 'e2', operation: 'update', payload: { a: 1 } }));

    expect(q).toHaveLength(2);
  });

  it('does not coalesce across entities with the same target id', () => {
    let q = enqueue([], make({ id: 'q1', entity: 'expense', targetId: 'x', operation: 'create' }));
    q = enqueue(q, make({ id: 'q2', entity: 'mood', targetId: 'x', operation: 'update' }));

    expect(q).toHaveLength(2);
  });
});

describe('peek / remove / attempts', () => {
  it('peek returns the first (FIFO) mutation', () => {
    let q = enqueue([], make({ id: 'q1', targetId: 'e1' }));
    q = enqueue(q, make({ id: 'q2', targetId: 'e2' }));
    expect(peek(q)?.id).toBe('q1');
  });

  it('peek returns undefined for an empty queue', () => {
    expect(peek([])).toBeUndefined();
  });

  it('remove deletes by id', () => {
    let q = enqueue([], make({ id: 'q1', targetId: 'e1' }));
    q = enqueue(q, make({ id: 'q2', targetId: 'e2' }));
    expect(remove(q, 'q1').map((m) => m.id)).toEqual(['q2']);
  });

  it('incrementAttempts bumps only the matching mutation', () => {
    let q = enqueue([], make({ id: 'q1', targetId: 'e1' }));
    q = enqueue(q, make({ id: 'q2', targetId: 'e2' }));
    const bumped = incrementAttempts(q, 'q1');
    expect(bumped.find((m) => m.id === 'q1')?.attempts).toBe(1);
    expect(bumped.find((m) => m.id === 'q2')?.attempts).toBe(0);
  });

  it('hasExceededAttempts is true at the max threshold', () => {
    const m: QueuedMutation = { ...make(), attempts: MAX_ATTEMPTS };
    expect(hasExceededAttempts(m)).toBe(true);
    expect(hasExceededAttempts({ ...m, attempts: MAX_ATTEMPTS - 1 })).toBe(false);
  });
});
