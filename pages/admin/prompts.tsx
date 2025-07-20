'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';

type Prompt = {
  id: string;
  title: string;
  description: string | null;
  visible_from: string | null;
  visible_to: string | null;
  created_at: string;
};

export default function AdminPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Prompt, 'id' | 'created_at'>>({
    title: '',
    description: '',
    visible_from: '',
    visible_to: '',
  });

  const fetchPrompts = async () => {
    const { data, error } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
    if (!error) setPrompts(data || []);
    else console.error('Error fetching prompts:', error.message);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPromptId) {
      // Update existing prompt
      const { error } = await supabase.from('prompts').update(form).eq('id', editingPromptId);
      if (error) return console.error('Update failed:', error.message);
    } else {
      // Insert new prompt
      const { error } = await supabase.from('prompts').insert([form]);
      if (error) return console.error('Insert failed:', error.message);
    }

    setForm({ title: '', description: '', visible_from: '', visible_to: '' });
    setEditingPromptId(null);
    fetchPrompts();
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPromptId(prompt.id);
    setForm({
      title: prompt.title,
      description: prompt.description || '',
      visible_from: prompt.visible_from || '',
      visible_to: prompt.visible_to || '',
    });
  };

  const handleCancel = () => {
    setEditingPromptId(null);
    setForm({ title: '', description: '', visible_from: '', visible_to: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (!error) fetchPrompts();
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Prompts</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          name="visible_from"
          type="date"
          value={form.visible_from || ''}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          name="visible_to"
          type="date"
          value={form.visible_to || ''}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <div className="flex space-x-2">
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">
            {editingPromptId ? 'Update Prompt' : 'Create Prompt'}
          </button>
          {editingPromptId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Visible From</th>
            <th className="border px-4 py-2">Visible To</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{p.title}</td>
              <td className="border px-4 py-2">{p.visible_from ? dayjs(p.visible_from).format('YYYY-MM-DD') : '—'}</td>
              <td className="border px-4 py-2">{p.visible_to ? dayjs(p.visible_to).format('YYYY-MM-DD') : '—'}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
