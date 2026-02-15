import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Column as ColumnType, Task } from '../../types';
import { TaskCard } from './TaskCard';
import styles from './board.module.css';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        {column.title}
        <span className={styles.columnCount}>{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className={styles.tasksList}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
