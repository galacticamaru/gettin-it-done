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
      console.log('Fetching tasks...');
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

      console.log('Fetched tasks:', formattedTasks);
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
      
      // First, get all existing tasks to update their sort orders
      const { data: existingTasks, error: fetchError } = await supabase
        .from('user_tasks')
        .select('id, sort_order')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching existing tasks:', fetchError);
        throw fetchError;
      }

      // Update all existing tasks' sort_order by incrementing by 1
      if (existingTasks && existingTasks.length > 0) {
        const updatePromises = existingTasks.map(task => 
          supabase
            .from('user_tasks')
            .update({ sort_order: (task.sort_order || 0) + 1 })
            .eq('id', task.id)
        );

        await Promise.all(updatePromises);
        console.log('Incremented all existing task sort orders');
      }

      // Now insert the new task with sort_order = 0
      const { data, error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          text: taskData.text,
          due_date: taskData.dueDate?.toISOString(),
          repeat_option: taskData.repeatOption !== 'none' ? taskData.repeatOption : null,
          reminder: taskData.reminder !== 'none' ? taskData.reminder : null,
          emoji: taskData.emoji || null,
          sort_order: 0,
        } as any)
        .select()
        .single();

      if (error) throw error;

      console.log('Added new task with sort_order 0:', data);

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

      // Update local state - add new task at beginning and increment sort orders
      const updatedTasks = [
        newTask,
        ...tasks.map(task => ({ ...task, sortOrder: (task.sortOrder || 0) + 1 }))
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
      console.log('💾 Saving order to database...');
      const updates = updatedTasks.map((task, index) => ({
        id: task.id,
        sort_order: index
      }));

      for (const update of updates) {
        console.log('📝 Updating task:', update.id, 'to sort_order:', update.sort_order);
        await supabase
          .from('user_tasks')
          .update({ sort_order: update.sort_order } as any)
          .eq('id', update.id);
      }
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
