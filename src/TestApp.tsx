import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { MobileTaskItem } from "./components/MobileTaskItem";

// Simplified Task List for verifying drag and drop
export default function TestApp() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Task 1', is_completed: false, order_index: 0 },
    { id: '2', title: 'Task 2', is_completed: false, order_index: 1 },
    { id: '3', title: 'Task 3', is_completed: false, order_index: 2 },
  ]);

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    console.log(`Reorder from ${dragIndex} to ${hoverIndex}`);
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const draggedTask = newTasks[dragIndex];
      newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, draggedTask);

      // Update order indexes
      return newTasks.map((t, idx) => ({...t, order_index: idx}));
    });
  };

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return (
    <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
      <div className="max-w-md mx-auto p-4 pb-24">
        <h1 className="text-xl font-bold mb-4">Task Reorder Test App</h1>

        <div className="space-y-4" id="task-list">
          {tasks.map((task, index) => (
            <MobileTaskItem
              key={task.id}
              task={task as any}
              index={index}
              moveTask={handleReorder}
              onToggle={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}