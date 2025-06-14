
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  repeatOption?: string;
  reminder?: string;
  emoji?: string;
  sortOrder?: number;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = data.map((task: any, index) => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        createdAt: task.created_at,
        dueDate: task.due_date,
        repeatOption: task.repeat_option,
        reminder: task.reminder,
        emoji: task.emoji,
        sortOrder: task.sort_order ?? index,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: {
    text: string;
    dueDate?: Date;
    repeatOption?: string;
    reminder?: string;
    emoji?: string;
  }): Promise<string | null> => {
    if (!user) return null;

    try {
      // Get the highest sort_order and add 1
      const maxSortOrder = Math.max(...tasks.map(t => t.sortOrder || 0), -1);
      
      const { data, error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          text: taskData.text,
          due_date: taskData.dueDate?.toISOString(),
          repeat_option: taskData.repeatOption !== 'none' ? taskData.repeatOption : null,
          reminder: taskData.reminder !== 'none' ? taskData.reminder : null,
          emoji: taskData.emoji || null,
          sort_order: maxSortOrder + 1,
        } as any)
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        text: data.text,
        completed: data.completed,
        createdAt: data.created_at,
        dueDate: data.due_date,
        repeatOption: data.repeat_option,
        reminder: data.reminder,
        emoji: data.emoji,
        sortOrder: data.sort_order,
      };

      setTasks([...tasks, newTask].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      return data.id;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({ completed: !task.completed })
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const reorderTasks = async (dragId: string, hoverId: string) => {
    const dragIndex = tasks.findIndex(task => task.id === dragId);
    const hoverIndex = tasks.findIndex(task => task.id === hoverId);

    if (dragIndex === -1 || hoverIndex === -1) return;

    const newTasks = [...tasks];
    const dragTask = newTasks[dragIndex];
    
    // Remove the dragged task and insert at new position
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, dragTask);
    
    // Update sort orders
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      sortOrder: index
    }));

    setTasks(updatedTasks);

    // Update sort orders in database
    try {
      const updates = updatedTasks.map((task, index) => ({
        id: task.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('user_tasks')
          .update({ sort_order: update.sort_order } as any)
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating task order:', error);
      // Revert on error
      fetchTasks();
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    refetch: fetchTasks,
  };
};
