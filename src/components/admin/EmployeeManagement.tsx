import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export function EmployeeManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'employee' as 'admin' | 'employee'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data as AdminUser[]);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // Don't show toast on first load if table doesn't exist yet to avoid spamming
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.name || (!editingUser && !formData.password)) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos necessários.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: formData.name,
          role: formData.role
        };
        
        // Only update password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        const { error } = await supabase
          .from('admin_users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({ title: "Usuário atualizado com sucesso!" });
      } else {
        // Create new user
        const { error } = await supabase
          .from('admin_users')
          .insert([{
            username: formData.username,
            password: formData.password, // Note: In production, hash this!
            name: formData.name,
            role: formData.role
          }]);

        if (error) throw error;

        toast({ title: "Funcionário criado com sucesso!" });
      }

      setShowAddModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este funcionário?')) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Funcionário removido com sucesso!" });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "Erro ao remover",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't show current password
      name: user.name,
      role: user.role
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'employee'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Equipe</h2>
          <p className="text-slate-600">Adicione e gerencie administradores e funcionários.</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário (Login)</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Carregando equipe...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum funcionário cadastrado além do admin principal.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Funcionário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Adição/Edição */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usuário de Login
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ex: joao.silva"
                  required
                  disabled={!!editingUser} // Prevent username change on edit
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="input-field w-full"
                  placeholder="******"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Função / Permissão
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'employee' })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                      formData.role === 'employee'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Funcionário</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                      formData.role === 'admin'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.role === 'admin' 
                    ? 'Acesso total ao sistema, incluindo gerenciamento de equipe.' 
                    : 'Acesso às operações do dia a dia, sem gerenciar outros usuários.'}
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
