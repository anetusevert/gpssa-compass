"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Briefcase,
  Building2,
  UserPlus,
  Mail,
  Pencil,
  Trash2,
  Camera,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: string;
  department: string | null;
  avatar: string | null;
  hasCompletedProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_ADD_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
  userType: "gpssa",
  department: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_ADD_FORM });
  const [submitting, setSubmitting] = useState(false);

  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
    userType: "gpssa",
    department: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploadingAvatarFor, setUploadingAvatarFor] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleAddUser() {
    if (!addForm.name || !addForm.email || !addForm.password) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ ...EMPTY_ADD_FORM });
        fetchUsers();
      }
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(user: UserRecord) {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType,
      department: user.department ?? "",
    });
  }

  async function handleSaveEdit() {
    if (!editUser) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditUser(null);
        fetchUsers();
      }
    } catch {
      /* ignore */
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchUsers();
      }
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  }

  async function handleAvatarUpload(userId: string, file: File) {
    setUploadingAvatarFor(userId);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`/api/admin/users/${userId}/avatar`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch {
      /* ignore */
    } finally {
      setUploadingAvatarFor(null);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      /* ignore */
    }
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    consultants: users.filter((u) => u.userType === "adl").length,
    gpssa: users.filter((u) => u.userType === "gpssa").length,
  };

  const typeVariant = (type: string) => {
    if (type === "adl") return "blue";
    return "green";
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="User Management" description="Manage platform users and roles" />
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="User Management"
        description="Manage platform users and roles"
        actions={
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <UserPlus size={16} />
            Add User
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total} icon={Users} />
        <StatCard label="Admins" value={stats.admins} icon={Shield} />
        <StatCard label="Consultants" value={stats.consultants} icon={Briefcase} />
        <StatCard label="GPSSA Employees" value={stats.gpssa} icon={Building2} />
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Add your first user to get started"
            action={{ label: "Add User", onClick: () => setShowAddModal(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">User</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Role</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Type</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gpssa-green/30 to-adl-blue/30 flex items-center justify-center text-cream text-xs font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-cream">{user.name}</p>
                          <p className="text-xs text-gray-muted sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <span className="text-gray-muted text-xs">{user.email}</span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs bg-transparent border border-white/10 text-cream focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      <Badge variant={typeVariant(user.userType)} size="sm">
                        {user.userType.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors"
                          title="Edit user"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Name</label>
            <input
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-gray-muted mb-1.5 uppercase tracking-wider">
              <Mail size={12} />
              Email
            </label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Role</label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">User Type</label>
              <select
                value={addForm.userType}
                onChange={(e) => setAddForm({ ...addForm, userType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              >
                <option value="gpssa">GPSSA</option>
                <option value="adl">ADL (Consultant)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Department (optional)</label>
            <input
              value={addForm.department}
              onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="e.g. IT, Finance"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              loading={submitting}
              disabled={!addForm.name || !addForm.email || !addForm.password}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        description={editUser?.email}
        size="md"
      >
        <div className="space-y-4">
          {/* Avatar upload */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && editUser) handleAvatarUpload(editUser.id, f);
                }}
              />
              {editUser?.avatar ? (
                <img
                  src={editUser.avatar}
                  alt={editUser.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gpssa-green/30 to-adl-blue/30 flex items-center justify-center text-cream text-2xl font-bold">
                  {editUser?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatarFor === editUser?.id ? (
                  <Loader2 size={20} className="text-cream animate-spin" />
                ) : (
                  <Camera size={20} className="text-cream" />
                )}
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">User Type</label>
              <select
                value={editForm.userType}
                onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              >
                <option value="gpssa">GPSSA</option>
                <option value="adl">ADL (Consultant)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Department</label>
            <input
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="e.g. IT, Finance"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} loading={savingEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-muted">
            Are you sure you want to delete <span className="text-cream font-medium">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleDelete}
              loading={deleting}
              className="!bg-red-500/20 !text-red-400 hover:!bg-red-500/30"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
