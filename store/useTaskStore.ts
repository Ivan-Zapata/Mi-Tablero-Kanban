import { create } from 'zustand';
import { Task, Status } from '../types';

interface TaskStore {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'inserted_at'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  moveTask: (id: number, newStatus: Status, newPosition: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  fetchTasks: async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ tasks: data });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  },
  addTask: async (task) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      // Refresh to get the ID back properly
      await get().fetchTasks();
    } catch (err) {
      console.error(err);
    }
  },
  updateTask: async (id, updates) => {
    // Optimistic
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));

    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
  },
  moveTask: async (id, newStatus, newPosition) => {
    // Optimistic
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus, position: newPosition } : task
      ),
    }));

    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, position: newPosition }),
    });
  },
  deleteTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));

    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
  },
}));
