import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
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

      const formattedTasks: Task[] = data.map((task: Tables<'user_tasks'>, index) => ({
        id: task.id,
        text: task.text,
        completed: task.completed ?? false,
        createdAt: task.created_at ?? new Date().toISOString(),
        updatedAt: task.updated_at ?? new Date().toISOString(),
        dueDate: task.due_date || undefined,
        repeatOption: task.repeat_option || undefined,
        reminder: task.reminder || undefined,
        emoji: task.emoji || undefined,
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
      console.log('Adding new task at the top of the list');
      
      // Calculate new sort_order based on existing tasks without fetching and updating them all.
      // We just need the minimum sort_order currently in use.
      let newSortOrder = 0;

      const { data: minTaskData, error: minTaskError } = await supabase
        .from('user_tasks')
        .select('sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (minTaskError) {
        console.error('Error fetching minimum sort_order:', minTaskError);
      } else if (minTaskData && typeof minTaskData.sort_order === 'number') {
        newSortOrder = minTaskData.sort_order - 1;
      } else if (tasks.length > 0 && typeof tasks[0].sortOrder === 'number') {
        // Fallback to local state if db query somehow didn't return a number
        newSortOrder = tasks[0].sortOrder - 1;
      }

      // Now insert the new task with the new sort_order
      const newTaskData: TablesInsert<'user_tasks'> = {
        user_id: user.id,
        text: taskData.text,
        due_date: taskData.dueDate?.toISOString(),
        repeat_option: taskData.repeatOption !== 'none' ? taskData.repeatOption : null,
        reminder: taskData.reminder !== 'none' ? taskData.reminder : null,
        emoji: taskData.emoji || null,
        sort_order: newSortOrder,
      };

      const { data, error } = await supabase
        .from('user_tasks')
        .insert(newTaskData)
        .select()
        .single();

      if (error) throw error;

      console.log(`Added new task with sort_order ${newSortOrder}:`, data);

      const newTask: Task = {
        id: data.id,
        text: data.text,
        completed: data.completed ?? false,
        createdAt: data.created_at ?? new Date().toISOString(),
        updatedAt: data.updated_at ?? new Date().toISOString(),
        dueDate: data.due_date || undefined,
        repeatOption: data.repeat_option || undefined,
        reminder: data.reminder || undefined,
        emoji: data.emoji || undefined,
        sortOrder: data.sort_order ?? newSortOrder,
      };

      // Update local state - add new task at beginning, keeping existing tasks untouched
      const updatedTasks = [
        newTask,
        ...tasks
      ];

      console.log('Updated local task list:', updatedTasks);
      setTasks(updatedTasks);
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
    console.log('🔄 reorderTasks called with:', { dragId, hoverId });
    
    const dragIndex = tasks.findIndex(task => task.id === dragId);
    const hoverIndex = tasks.findIndex(task => task.id === hoverId);

    console.log('📍 Found indices:', { dragIndex, hoverIndex });

    if (dragIndex === -1 || hoverIndex === -1) {
      console.error('❌ Could not find task indices');
      return;
    }

    const newTasks = [...tasks];
    const dragTask = newTasks[dragIndex];
    
    console.log('📦 Moving task:', dragTask.text, 'from position', dragIndex, 'to', hoverIndex);
    
    // Remove the dragged task and insert at new position
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, dragTask);
    
    // Update sort orders
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      sortOrder: index
    }));

    console.log('✅ Updated task order:', updatedTasks.map(t => ({ id: t.id, text: t.text, sortOrder: t.sortOrder })));

    setTasks(updatedTasks);

    // Update sort orders in database
    try {
      if (!user) return;
      console.log('💾 Saving order to database...');
      const updates: TablesInsert<'user_tasks'>[] = updatedTasks.map((task, index) => ({
        id: task.id,
        user_id: user.id,
        sort_order: index,
        text: task.text
      }));

      console.log('📝 Batch updating task orders');
      const { error } = await supabase
        .from('user_tasks')
        .upsert(updates);

      if (error) throw error;
      console.log('✅ Successfully saved order to database');
    } catch (error) {
      console.error('❌ Error updating task order:', error);
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
