import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Web, TicketPriority } from '../types';
import { useAuth } from '../context/AuthContext';

export default function TicketNew() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [webId, setWebId] = useState('');
  const [webs, setWebs] = useState<Web[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchWebs();
  }, []);

  const fetchWebs = async () => {
    try {
      const response = await api.get('/webs');
      setWebs(response.data);
    } catch (err) {
      console.error('Error al cargar webs', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles([...files, ...Array.from(selectedFiles)]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Crear el ticket
      const ticketResponse = await api.post('/tickets', {
        title,
        description,
        priority,
        web_id: Number(webId),
        created_by: user?.id,
      });

      const ticketId = ticketResponse.data.id;

      // Subir archivos si hay
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ticket_id', ticketId.toString());

        await api.post('/ticket-attachments/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/tickets');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Nuevo Ticket</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Web</label>
            <select
              value={webId}
              onChange={(e) => setWebId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar web</option>
              {webs.map((web) => (
                <option key={web.id} value={web.id}>
                  {web.name} - {web.domain}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Archivos Adjuntos (opcional)</label>
            <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer inline-block">
              📎 Seleccionar Archivos
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span>
                        {file.type.includes('image') ? '🖼️' : 
                         file.type.includes('pdf') ? '📄' : 
                         file.type.includes('video') ? '🎬' : '📎'}
                      </span>
                      <span className="text-sm">{file.name}</span>
                      <span className="text-gray-500 text-xs">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Creando...' : 'Crear Ticket'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}