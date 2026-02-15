import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import styles from './board.module.css';
import { useTaskStore } from '../../store/useTaskStore';
import { GripVertical, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { deleteTask } = useTaskStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir inicio de arrastre al hacer clic en eliminar
    // Diálogo de confirmación simple (en una app real, usar un modal)
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      deleteTask(task.id);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${styles.taskCard} ${styles.dragging}`}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.taskCard}
    >
      <div className={styles.taskHeader}>
        <span className={styles.taskTitle}>{task.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Botón de eliminar solo visible en tareas completadas */}
          {task.status === 'done' && (
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              onPointerDown={(e) => e.stopPropagation()} /* Crucial for dnd-kit */
            >
              <Trash2 size={16} />
            </button>
          )}
          <GripVertical size={16} className={styles.dragHandle} />
        </div>
      </div>
      {task.description && (
        <p className={styles.taskDescription}>{task.description}</p>
      )}
    </div>
  );
};
