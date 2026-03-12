'use client';

import { useState, useEffect, useCallback } from 'react';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiError {
  error: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AddTodoForm({ onAdd }: { onAdd: (todo: Todo) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json() as ApiError;
        throw new Error(data.error || 'Failed to create todo');
      }
      const newTodo = await res.json() as Todo;
      onAdd(newTodo);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <span>✏️</span> Add New Todo
      </div>
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add more details (optional)"
            maxLength={1000}
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <><span className="spinner" />Adding...</> : '+ Add Todo'}
        </button>
      </form>
    </div>
  );
}

interface EditModalProps {
  todo: Todo;
  onClose: () => void;
  onUpdate: (todo: Todo) => void;
}

function EditModal({ todo, onClose, onUpdate }: EditModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || '' }),
      });
      if (!res.ok) {
        const data = await res.json() as ApiError;
        throw new Error(data.error || 'Failed to update todo');
      }
      const updated = await res.json() as Todo;
      onUpdate(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">✏️ Edit Todo</span>
          <button className="icon-btn" onClick={onClose} title="Close">✕</button>
        </div>
        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={1000}
              disabled={loading}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" />Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmProps {
  todo: Todo;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function DeleteConfirm({ todo, onClose, onDelete }: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json() as ApiError;
        throw new Error(data.error || 'Failed to delete todo');
      }
      onDelete(todo.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">🗑️ Delete Todo</span>
          <button className="icon-btn" onClick={onClose} title="Close">✕</button>
        </div>
        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}
        <p className="confirm-text">Are you sure you want to delete:</p>
        <p className="confirm-todo-title">&ldquo;{todo.title}&rdquo;</p>
        <p className="confirm-text" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          This action cannot be undone.
        </p>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <><span className="spinner" />Deleting...</> : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (res.ok) {
        const updated = await res.json() as Todo;
        onToggle(updated);
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`todo-item${todo.completed ? ' completed' : ''}`}>
      <button
        className={`todo-checkbox${todo.completed ? ' checked' : ''}`}
        onClick={handleToggle}
        disabled={toggling}
        title={todo.completed ? 'Mark as pending' : 'Mark as done'}
        aria-label={todo.completed ? 'Mark as pending' : 'Mark as done'}
      />
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        {todo.description && (
          <div className="todo-description">{todo.description}</div>
        )}
        <div className="todo-meta">
          <span className={`todo-badge ${todo.completed ? 'done' : 'pending'}`}>
            {todo.completed ? '✓ Done' : '⏳ Pending'}
          </span>
          <span>•</span>
          <span>{formatDate(todo.createdAt)}</span>
        </div>
      </div>
      <div className="todo-actions">
        <button
          className="icon-btn edit"
          onClick={() => onEdit(todo)}
          title="Edit todo"
          aria-label="Edit todo"
        >
          ✏️
        </button>
        <button
          className="icon-btn delete"
          onClick={() => onDelete(todo)}
          title="Delete todo"
          aria-label="Delete todo"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json() as Todo[];
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = (newTodo: Todo) => {
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggle = (updated: Todo) => {
    setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleUpdate = (updated: Todo) => {
    setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleDelete = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;

  return (
    <main className="container">
      <div className="header">
        <h1>📝 Todo App</h1>
        <p>Stay organized, stay productive.</p>
      </div>

      <AddTodoForm onAdd={handleAdd} />

      <div className="card">
        <div className="card-title">
          <span>📋</span> My Todos
          {todos.length > 0 && (
            <span style={{ marginLeft: 'auto', fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {todos.length} total
            </span>
          )}
        </div>

        {todos.length > 0 && (
          <div className="stats-bar">
            <div className="stat">✓ {completedCount} completed</div>
            <div className="stat" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>⏳ {pendingCount} pending</div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
            <button
              onClick={fetchTodos}
              style={{ marginLeft: 'auto', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 600 }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <span className="spinner" />
            Loading todos...
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🌟</div>
            <h3>No todos yet!</h3>
            <p>Add your first todo above to get started.</p>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={setEditingTodo}
                onDelete={setDeletingTodo}
              />
            ))}
          </div>
        )}
      </div>

      {editingTodo && (
        <EditModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdate={handleUpdate}
        />
      )}

      {deletingTodo && (
        <DeleteConfirm
          todo={deletingTodo}
          onClose={() => setDeletingTodo(null)}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
