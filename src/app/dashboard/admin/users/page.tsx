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
  Calendar,
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
  hasCompletedProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    userType: "gpssa",
  });
  const [submitting, setSubmitting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch {
      // silently fail
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
        setAddForm({ name: "", email: "", password: "", role: "user", userType: "gpssa" });
        fetchUsers();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingRole(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingRole(null);
    }
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    consultants: users.filter((u) => u.userType === "adl").length,
    gpssa: users.filter((u) => u.userType === "gpssa").length,
  };

  const roleVariant = (role: string) => (role === "admin" ? "gold" : "blue");
  const typeVariant = (type: string) => {
    if (type === "admin") return "gold";
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total} icon={Users} />
        <StatCard label="Admins" value={stats.admins} icon={Shield} />
        <StatCard label="Consultants" value={stats.consultants} icon={Briefcase} />
        <StatCard label="GPSSA Employees" value={stats.gpssa} icon={Building2} />
      </div>

      {/* User Table */}
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gpssa-green/30 to-adl-blue/30 flex items-center justify-center text-cream text-xs font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
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
                        disabled={updatingRole === user.id}
                        className="px-2 py-1 rounded-lg text-xs bg-transparent border border-white/10 text-cream focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 cursor-pointer disabled:opacity-50"
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
                <option value="admin">Admin</option>
              </select>
            </div>
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
    </div>
  );
}
