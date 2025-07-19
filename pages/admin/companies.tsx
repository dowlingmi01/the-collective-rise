// pages/admin/companies.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

type Company = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const router = useRouter();

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching companies:', error.message);
    } else {
      setCompanies(data || []);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingCompany) {
      const { error } = await supabase
        .from('companies')
        .update({ name, description })
        .eq('id', editingCompany.id);
      if (!error) {
        setEditingCompany(null);
        setName('');
        setDescription('');
        fetchCompanies();
      }
    } else {
      const { error } = await supabase.from('companies').insert([{ name, description }]);
      if (!error) {
        setName('');
        setDescription('');
        fetchCompanies();
      }
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setName(company.name);
    setDescription(company.description);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this company?');
    if (!confirm) return;
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (!error) {
      fetchCompanies();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Companies</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">
          {editingCompany ? 'Update Company' : 'Add Company'}
        </button>
        {editingCompany && (
          <button
            type="button"
            onClick={() => {
              setEditingCompany(null);
              setName('');
              setDescription('');
            }}
            className="ml-4 text-sm underline text-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <ul className="space-y-4">
        {companies.map((company) => (
          <li key={company.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.description}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(company)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(company.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
