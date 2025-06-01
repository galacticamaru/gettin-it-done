
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TaskItem } from './TaskItem';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  repeatOption?: string;
  reminder?: string;
  emoji?: string;
}

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export const DraggableTaskItem = ({ 
  task, 
  index, 
  onToggle, 
  onDelete, 
  onReorder 
}: DraggableTaskItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'task',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: () => {
      return { id: task.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-handler-id={handlerId}
      className="cursor-move"
    >
      <TaskItem
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </div>
  );
};
