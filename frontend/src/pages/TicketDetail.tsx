import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Ticket, TicketStatus, TicketPriority, User, UserRole, TicketWorkLog, WorkLogStatus, TicketComment, TicketAttachment  } from '../types';
import { useAuth } from '../context/AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [devs, setDevs] = useState<User[]>([]);
  const [validators, setValidators] = useState<User[]>([]);
  const [workLogs, setWorkLogs] = useState<TicketWorkLog[]>([]);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
  const [newComment, setNewComment] = useState('');
  const [totalTime, setTotalTime] = useState<{ totalMinutes: number; attempts: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentFiles, setCommentFiles] = useState<File[]>([]);

  const [status, setStatus] = useState<TicketStatus>(TicketStatus.OPEN);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [validatorId, setValidatorId] = useState<string>('');

  const canEdit = user?.role === 'ADMIN';
  const isDev = user?.role === 'DEV';
  const isValidator = user?.role === 'VALIDATOR';
  
  const canComment = () => {
  if (!ticket) return false;
  
  const status = ticket.status;
  const role = user?.role;
  
  if (role === 'ADMIN') return true;
  
  if (role === 'CLIENT') {
    return ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status);
  }
  
  if (role === 'DEV') {
    if (status === 'OPEN' && ticket.assigned_to === user?.id) return true;
    return ['IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status);
  }
  
  if (role === 'VALIDATOR') {
    return ['IN_REVIEW', 'RESOLVED', 'REJECTED'].includes(status);
  }
  
  return false;
};
  const isAssignedDev = isDev && ticket?.assigned_to === user?.id;
  const isAssignedValidator = isValidator && ticket?.validator_id === user?.id;
  const canValidate = user?.role === 'ADMIN' || isAssignedValidator;

    const loadImagePreview = async (attachmentId: number) => {
  try {
    const response = await api.get(`/ticket-attachments/view/${attachmentId}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    setImageUrls(prev => ({ ...prev, [attachmentId]: url }));
  } catch (err) {
    console.error('Error al cargar imagen', err);
  }
};


  useEffect(() => {
    fetchTicket();
    fetchWorkLogs();
    fetchComments();
    fetchAttachments();
    if (user?.role === 'ADMIN') {
      fetchDevs();
      fetchValidators();
    }
  }, [id]);

  // Cargar vistas previas de imágenes
useEffect(() => {
  attachments.forEach(attachment => {
    if (attachment.filetype.includes('image') && !imageUrls[attachment.id]) {
      loadImagePreview(attachment.id);
    }
  });
}, [attachments]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      const data = response.data;
      setTicket(data);
      setStatus(data.status);
      setPriority(data.priority);
      setAssignedTo(data.assigned_to?.toString() || '');
      setValidatorId(data.validator_id?.toString() || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevs = async () => {
    try {
      const response = await api.get('/users');
      const devUsers = response.data.filter((u: User) => u.role === UserRole.DEV);
      setDevs(devUsers);
    } catch (err) {
      console.error('Error al cargar devs', err);
    }
  };

  const fetchValidators = async () => {
    try {
      const response = await api.get('/users');
      const validatorUsers = response.data.filter((u: User) => u.role === UserRole.VALIDATOR);
      setValidators(validatorUsers);
    } catch (err) {
      console.error('Error al cargar validators', err);
    }
  };

  const fetchWorkLogs = async () => {
    try {
      const [logsResponse, timeResponse] = await Promise.all([
        api.get(`/ticket-work-logs/ticket/${id}`),
        api.get(`/ticket-work-logs/ticket/${id}/total-time`),
      ]);
      setWorkLogs(logsResponse.data);
      setTotalTime(timeResponse.data);
    } catch (err) {
      console.error('Error al cargar work logs', err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/ticket-comments/ticket/${id}`);
      setComments(response.data);
    } catch (err) {
      console.error('Error al cargar comentarios', err);
    }
  };

  const fetchAttachments = async () => {
  try {
    const response = await api.get(`/ticket-attachments/ticket/${id}`);
    setAttachments(response.data);
  } catch (err) {
    console.error('Error al cargar archivos', err);
  }
};


const handleDownloadFile = async (attachmentId: number, filename: string) => {
  try {
    const response = await api.get(`/ticket-attachments/download/${attachmentId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error al descargar archivo');
  }
};


const handleAddComment = async () => {
  if (!newComment.trim() && commentFiles.length === 0) return;

  try {
    // Crear comentario
    const response = await api.post('/ticket-comments', {
      ticket_id: Number(id),
      comment: newComment || '(archivo adjunto)',
    });

    const commentId = response.data.id;

    // Subir archivos del comentario
    for (const file of commentFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticket_id', id!);
      formData.append('comment_id', commentId.toString());

      await api.post('/ticket-attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    setNewComment('');
    setCommentFiles([]);
    fetchComments();
    fetchAttachments();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error al agregar comentario');
  }
};

const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    setCommentFiles([...commentFiles, ...Array.from(files)]);
  }
  e.target.value = '';
};

const removeCommentFile = (index: number) => {
  setCommentFiles(commentFiles.filter((_, i) => i !== index));
};

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      await api.delete(`/ticket-comments/${commentId}`);
      fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar comentario');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/tickets/${id}`, {
        status,
        priority,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        validator_id: validatorId ? Number(validatorId) : null,
      });
      setEditing(false);
      await fetchTicket();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar ticket');
    }
  };

  const handleStart = async () => {
    try {
      await api.patch(`/tickets/${id}/start`);
      fetchTicket();
      fetchWorkLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar ticket');
    }
  };

  const handleFinish = async () => {
    try {
      await api.patch(`/tickets/${id}/finish`);
      fetchTicket();
      fetchWorkLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al finalizar ticket');
    }
  };

  const handleApprove = async () => {
    try {
      await api.patch(`/tickets/${id}/approve`);
      fetchTicket();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar ticket');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Debe indicar el motivo del rechazo');
      return;
    }
    try {
      await api.patch(`/tickets/${id}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
      fetchTicket();
      fetchWorkLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar ticket');
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      IN_REVIEW: 'bg-purple-100 text-purple-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: TicketPriority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  const getWorkLogStatusColor = (status: WorkLogStatus) => {
    const colors = {
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateLogTime = (log: TicketWorkLog) => {
    if (!log.started_at || !log.finished_at) return '-';
    const start = new Date(log.started_at).getTime();
    const end = new Date(log.finished_at).getTime();
    const minutes = Math.floor((end - start) / (1000 * 60));
    return formatTime(minutes);
  };

  if (loading) {
    return <Layout><p>Cargando...</p></Layout>;
  }

  if (!ticket) {
    return <Layout><p>Ticket no encontrado</p></Layout>;
  }





  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
  <h2 className="text-xl md:text-2xl font-bold">Ticket #{ticket.id}</h2>
  <button
    onClick={() => navigate('/tickets')}
    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
  >
    Volver
  </button>
</div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
<div className="mb-6">
  <h3 className="text-xl font-semibold mb-2">{ticket.title}</h3>
  <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
  
{/* Archivos originales del ticket */}
{attachments.filter(a => {
  const ticketDate = new Date(ticket.created_at).getTime();
  const attachDate = new Date(a.created_at).getTime();
  return Math.abs(attachDate - ticketDate) < 60000;
}).length > 0 && (
  <div className="mt-4 p-3 bg-gray-50 rounded">
    <p className="text-sm text-gray-500 mb-2">Archivos adjuntos:</p>
    <div className="flex flex-wrap gap-3">
      {attachments
        .filter(a => {
          const ticketDate = new Date(ticket.created_at).getTime();
          const attachDate = new Date(a.created_at).getTime();
          return Math.abs(attachDate - ticketDate) < 60000;
        })
        .map((attachment) => (
          <div key={attachment.id} className="border rounded p-2 bg-white">
            {attachment.filetype.includes('image') ? (
  imageUrls[attachment.id] ? (
    <img
      src={imageUrls[attachment.id]}
      alt={attachment.filename}
      className="max-w-full sm:max-w-xs max-h-48 object-contain cursor-pointer rounded"
      onClick={() => window.open(imageUrls[attachment.id], '_blank')}
    />
  ) : (
    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
      <span className="text-gray-500 text-sm">Cargando...</span>
    </div>
  )
) : (
              <button
                onClick={() => handleDownloadFile(attachment.id, attachment.filename)}
                className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-gray-100"
              >
                <span>
                  {attachment.filetype.includes('pdf') ? '📄' : '📎'}
                </span>
                {attachment.filename}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-1 text-center">{attachment.filename}</p>
          </div>
        ))}
    </div>
  </div>
)}
</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <p className="text-gray-500 text-sm">Estado</p>
              {editing && canEdit ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="border rounded px-3 py-1"
                >
                  <option value="OPEN">Abierto</option>
                  <option value="RESOLVED">Resuelto</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-sm">Prioridad</p>
              {editing && canEdit ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="border rounded px-3 py-1"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-sm">Asignado a (DEV)</p>
              {editing && canEdit ? (
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="">Sin asignar</option>
                  {devs.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-medium">{ticket.assignee?.name || 'Sin asignar'}</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-sm">Validador</p>
              {editing && canEdit ? (
                <select
                  value={validatorId}
                  onChange={(e) => setValidatorId(e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="">Sin asignar</option>
                  {validators.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-medium">{ticket.validator?.name || 'Sin asignar'}</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-sm">Web</p>
              <p className="font-medium">{ticket.web?.name} - {ticket.web?.domain}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Creado por</p>
              <p className="font-medium">{ticket.creator?.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Fecha creación</p>
              <p className="font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>

            {totalTime && totalTime.attempts > 0 && (
              <>
                <div>
                  <p className="text-gray-500 text-sm">Tiempo total</p>
                  <p className="font-medium text-blue-600">{formatTime(totalTime.totalMinutes)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Intentos</p>
                  <p className="font-medium">{totalTime.attempts}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 md:gap-4 flex-wrap">
            {isAssignedDev && (ticket.status === 'OPEN' || ticket.status === 'REJECTED') && (
              <button
                onClick={handleStart}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Iniciar Ticket
              </button>
            )}

            {isAssignedDev && ticket.status === 'IN_PROGRESS' && (
              <button
                onClick={handleFinish}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Enviar a Revisión
              </button>
            )}

            {canValidate && ticket.status === 'IN_REVIEW' && (
              <>
                <button
                  onClick={handleApprove}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Rechazar
                </button>
              </>
            )}

            {canEdit && (
              <>
                {editing ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sección de Comentarios */}
{/* Sección de Comentarios */}
<div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
  <div 
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setShowComments(!showComments)}
  >
    <h3 className="text-lg font-semibold">
      Comentarios ({comments.length})
    </h3>
    <span className="text-gray-500">
      {showComments ? '▲' : '▼'}
    </span>
  </div>
  
  {showComments && (
    <div className="mt-4">
{/* Formulario para agregar comentario */}
{canComment() ? (
  <div className="mb-6">
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg mb-2"
      rows={3}
      placeholder="Escribe un comentario..."
    />
    
    {commentFiles.length > 0 && (
      <div className="mb-2 space-y-1">
        {commentFiles.map((file, index) => (
          <div key={index} className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
            <span>📎 {file.name}</span>
            <button
              onClick={() => removeCommentFile(index)}
              className="text-red-500 hover:underline"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    )}
    
    <div className="flex gap-2">
      <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer">
        📎 Adjuntar
        <input
          type="file"
          onChange={handleCommentFileChange}
          className="hidden"
          multiple
        />
      </label>
      <button
        onClick={handleAddComment}
        disabled={!newComment.trim() && commentFiles.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        Agregar Comentario
      </button>
    </div>
  </div>
) : (
  <p className="text-gray-500 mb-4 text-sm italic">
    No puedes comentar en este momento.
  </p>
)}

{/* Lista de comentarios */}
{comments.length === 0 ? (
  <p className="text-gray-500">No hay comentarios</p>
) : (
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {[...comments].reverse().map((comment) => {
      const commentAttachments = attachments.filter(a => a.comment_id === comment.id);
      return (
        <div key={comment.id} className="border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium">{comment.user?.name}</span>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            {comment.user_id === user?.id && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Eliminar
              </button>
            )}
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
          
          {/* Archivos del comentario */}
          {commentAttachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {commentAttachments.map((attachment) => (
                <div key={attachment.id} className="border rounded p-2 bg-gray-50">
                  {attachment.filetype.includes('image') ? (
                    imageUrls[attachment.id] ? (
                      <img
                        src={imageUrls[attachment.id]}
                        alt={attachment.filename}
                        className="max-w-24 sm:max-w-32 max-h-24 sm:max-h-32 object-contain cursor-pointer rounded"
                        onClick={() => window.open(imageUrls[attachment.id], '_blank')}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-500 text-xs">Cargando...</span>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => handleDownloadFile(attachment.id, attachment.filename)}
                      className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                      📎 {attachment.filename}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
      )}
    </div>
  )}
</div>

{workLogs.length > 0 && user?.role !== 'CLIENT' && (
  <div className="bg-white rounded-lg shadow p-4 md:p-6">
    <h3 className="text-lg font-semibold mb-4">Historial de Trabajo</h3>
    
    {/* Vista móvil - Cards */}
    <div className="md:hidden space-y-4">
      {workLogs.map((log, index) => (
        <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium">Intento #{index + 1}</span>
            <span className={`px-2 py-1 rounded text-xs ${getWorkLogStatusColor(log.status)}`}>
              {log.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Dev:</span>
              <span>{log.dev?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Inicio:</span>
              <span>{new Date(log.started_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fin:</span>
              <span>{log.finished_at ? new Date(log.finished_at).toLocaleString() : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tiempo:</span>
              <span className="font-medium">{calculateLogTime(log)}</span>
            </div>
            {log.rejection_reason && (
              <div className="mt-2 p-2 bg-red-50 rounded">
                <span className="text-gray-500 text-xs">Motivo rechazo:</span>
                <p className="text-red-600 text-sm">{log.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Vista desktop - Tabla */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dev</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inicio</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiempo</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo Rechazo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {workLogs.map((log, index) => (
            <tr key={log.id}>
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{log.dev?.name}</td>
              <td className="px-4 py-2">{new Date(log.started_at).toLocaleString()}</td>
              <td className="px-4 py-2">{log.finished_at ? new Date(log.finished_at).toLocaleString() : '-'}</td>
              <td className="px-4 py-2">{calculateLogTime(log)}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-xs ${getWorkLogStatusColor(log.status)}`}>
                  {log.status}
                </span>
              </td>
              <td className="px-4 py-2 text-red-600">{log.rejection_reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

        {showRejectModal && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
  <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Rechazar Ticket</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Motivo del rechazo</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleReject}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}