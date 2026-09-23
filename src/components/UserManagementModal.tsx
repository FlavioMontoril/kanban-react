import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRequest, UserResponse } from "@/types/user";
import {
  UserPlus,
  Edit2,
  Users,
  X,
  Shield,
  Mail,
  Lock,
  User as UserIcon,
  Camera,
  Trash2,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/getAvatarUrl";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, roles, createUser, loading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Formulário Local
  const [formData, setFormData] = useState<UserRequest>({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      roleId: roles[0]?.id || "",
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (user: UserResponse) => {
    const defaultRoleId =
      roles.length > 0
        ? roles.find((option) => option.name === "GUEST")?.id
        : "";

    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      roleId: defaultRoleId!,
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar || null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // TODO: Atualizar quando a rota de edição aceitar FormData
        console.log("Atualizar usuário (pendente rota no backend):", formData);
      } else {
        // Monta o FormData para enviar o arquivo junto com as propriedades
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("email", formData.email);
        payload.append("password", formData.password);
        payload.append("roleId", formData.roleId);

        if (avatarFile) {
          payload.append("avatar", avatarFile);
        }

        await createUser(payload);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Erro na operação:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl dark:bg-slate-900 bg-white shadow-2xl transition-all">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b dark:border-black border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">
              Gerenciamento de Usuários
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {isEditing ? (
            /* Form de Criação/Edição */
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-md font-semibold text-gray-700">
                {selectedUser ? "Editar Usuário" : "Criar Novo Usuário"}
              </h3>

              {/* Seletor de Avatar */}
              <div className="flex items-center gap-4 py-2">
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-purple-100 border border-purple-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-purple-600" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="modal-avatar-upload"
                  />
                  <label
                    htmlFor="modal-avatar-upload"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4 text-purple-600" />
                    Escolher Imagem
                  </label>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> Remover imagem
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Flavio Montoril"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="exemplo@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    {selectedUser ? "Nova Senha (opcional)" : "Senha"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      required={!selectedUser}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role Select */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Nível de Acesso (Role)
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.roleId}
                      onChange={(e) =>
                        setFormData({ ...formData, roleId: e.target.value })
                      }
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-purple-600 focus:outline-none"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar Usuário"}
                </button>
              </div>
            </form>
          ) : (
            /* Lista de Usuários */
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  Total: {users.length} usuário(s)
                </span>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-purple-700"
                >
                  <UserPlus className="h-4 w-4" /> Novo Usuário
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {users.map((user) => {
                  const rolesName = roles.find(
                    (role) => role.id === user.roleId,
                  )?.name;
                  const avatarUrl = getAvatarUrl(user.avatar);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-black dark:bg-slate-800 dark:hover:bg-slate-700 bg-gray-50/50 p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-purple-700 font-bold">
                          {user.avatar ? (
                            <img
                              src={avatarUrl!}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold dark:text-white text-gray-800">
                            {user.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-300 dark:hover:text-gray-400">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-bold tracking-wider text-purple-700 uppercase">
                          {rolesName || ""}
                        </span>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-purple-600 hover:shadow-sm"
                          title="Editar Usuário"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
