'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column as ColumnComponent } from './Column';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../../store/useTaskStore';
import { Column, Status } from '../../types';
import styles from './board.module.css';

const COLUMNS: Column[] = [
  { id: 'todo', title: 'Por Hacer' },
  { id: 'in-progress', title: 'En Progreso' },
  { id: 'done', title: 'Completado' },
];

export default function KanbanBoard() {
  const { tasks, fetchTasks, moveTask, addTask } = useTaskStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await addTask({
      title: newTaskTitle,
      status: 'todo',
      position: 0, // Store/Backend should handle auto-positioning, or we default to 0
    });
    setNewTaskTitle('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Polling logic
  useEffect(() => {
    fetchTasks(); // Initial fetch

    // Simple short polling every 3 seconds to update state from server
    // (Simulating Realtime)
    const interval = setInterval(() => {
      // Only fetch if not dragging to avoid glitches
      if (!activeId) {
        fetchTasks();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchTasks, activeId]);


  const columns = useMemo(() => {
    const cols = {
      todo: tasks.filter((t) => t.status === 'todo').sort((a, b) => a.position - b.position),
      'in-progress': tasks.filter((t) => t.status === 'in-progress').sort((a, b) => a.position - b.position),
      done: tasks.filter((t) => t.status === 'done').sort((a, b) => a.position - b.position),
    };
    return cols;
  }, [tasks]);

  const findContainer = (id: number | Status): Status | undefined => {
    if (id in columns) return id as Status;
    const task = tasks.find((t) => t.id === id);
    return task?.status;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as number;
    setActiveId(id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as number);
    const overContainer = findContainer(overId as number | Status) || (overId as Status);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as number;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(activeId);
    const overContainer = (overId in columns ? overId : findContainer(overId as number)) as Status;

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Calculate new position
    const overItems = columns[overContainer];
    const overIndex = overItems.findIndex((t) => t.id === overId);

    let newIndex;
    if (overId in columns) {
      // Dropped on the column container (append to end)
      newIndex = overItems.length;
    } else {
      // Dropped on a task
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    // Position Calculation Logic
    let newPosition;
    if (overItems.length === 0) {
      newPosition = 1000;
    } else if (newIndex === 0) {
      newPosition = overItems[0].position / 2;
    } else if (newIndex >= overItems.length) {
      newPosition = overItems[overItems.length - 1].position + 1000;
    } else {
      const prev = overItems[newIndex - 1];
      const next = overItems[newIndex];
      newPosition = (prev.position + next.position) / 2;
    }

    // Optimistic update
    moveTask(activeId, overContainer, newPosition);

    setActiveId(null);
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <div className={styles.boardContainer} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <form onSubmit={handleAddTask} className={styles.newTaskForm}>
        <input
          type="text"
          placeholder="Título de la nueva tarea..."
          className={styles.input}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit" className={styles.addButton}>
          Agregar Tarea
        </button>
      </form>
      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', width: '100%', height: '100%' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((col) => (
            <ColumnComponent
              key={col.id}
              column={col}
              tasks={columns[col.id as Status]}
            />
          ))}
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
