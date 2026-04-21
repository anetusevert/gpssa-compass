"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  User,
  Lock,
  Camera,
  Check,
  X,
  Loader2,
  ChevronUp,
} from "lucide-react";

interface UserMenuProps {
  collapsed: boolean;
}

export function UserMenu({ collapsed }: UserMenuProps) {
  const { data: session, update: updateSession } = useSession();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const menuRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string; userType?: string; avatar?: string }
    | undefined;

  const isDemo = user?.userType === "demo";
  // For demo accounts the always-visible identity stays neutral so we can
  // hand the same login to multiple client viewers without leaking a name
  // or inbox. The avatar is hardwired to the GPSSA logo.
  const displayName = isDemo ? "GPSSA" : user?.name || "User";
  const displayEmail = isDemo ? "" : user?.email;
  const avatarInitial = isDemo ? "G" : (user?.name || "U").charAt(0).toUpperCase();
  const DEMO_AVATAR_SRC = "/images/gpssa-logo.png";

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleSaveProfile() {
    if (!name.trim()) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await updateSession({ name });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2000);
      }
    } catch {
      /* ignore */
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    setPasswordError("");
    setSavingPassword(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setPasswordSaved(true);
        setTimeout(() => setPasswordSaved(false), 2000);
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to change password");
      }
    } catch {
      setPasswordError("Network error");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await updateSession({});
      }
    } catch {
      /* ignore */
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (!session) return null;

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center rounded-lg text-sm text-gray-muted transition-colors duration-200 hover:bg-white/5 hover:text-cream ${
          collapsed ? "justify-center px-1 py-1.5" : "gap-2.5 px-2.5 py-1.5"
        }`}
      >
        {isDemo ? (
          <img
            src={DEMO_AVATAR_SRC}
            alt="GPSSA"
            className="w-7 h-7 rounded-full object-contain bg-white shrink-0 ring-1 ring-white/10"
          />
        ) : user?.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/10"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gpssa-green/40 to-adl-blue/40 flex items-center justify-center text-cream text-[10px] font-bold shrink-0 ring-1 ring-white/10">
            {avatarInitial}
          </div>
        )}
        {!collapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-cream truncate">
                {displayName}
              </p>
              {displayEmail && (
                <p className="text-[11px] text-gray-muted truncate">
                  {displayEmail}
                </p>
              )}
            </div>
            <ChevronUp
              size={14}
              className={`text-gray-muted transition-transform ${open ? "" : "rotate-180"}`}
            />
          </>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 glass-panel border border-[var(--border)] rounded-xl shadow-xl ${
              collapsed ? "left-full ml-2 bottom-0" : "left-0 right-0 bottom-full mb-2"
            }`}
            style={{ width: collapsed ? 280 : undefined, minWidth: 260 }}
          >
            <div className="p-4">
              {/* Avatar — demo accounts get a hardwired GPSSA logo with no
                  upload affordance, name, or email. */}
              <div className="flex flex-col items-center mb-4">
                {isDemo ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white p-1 ring-1 ring-white/10 flex items-center justify-center">
                      <img
                        src={DEMO_AVATAR_SRC}
                        alt="GPSSA"
                        className="w-full h-full rounded-full object-contain"
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-cream">
                      GPSSA
                    </p>
                    <p className="text-[11px] text-gray-muted uppercase tracking-wider">
                      General Pension &amp; Social Security Authority
                    </p>
                  </>
                ) : (
                  <label className="relative cursor-pointer group">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAvatarUpload(f);
                      }}
                    />
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gpssa-green/30 to-adl-blue/30 flex items-center justify-center text-cream text-xl font-bold">
                        {avatarInitial}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? (
                        <Loader2 size={18} className="text-cream animate-spin" />
                      ) : (
                        <Camera size={18} className="text-cream" />
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Tabs + profile/password forms — hidden for the shared demo
                  account, which only exposes a sign-out button. */}
              {!isDemo && (
              <>
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setTab("profile")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    tab === "profile"
                      ? "bg-gpssa-green/15 text-gpssa-green"
                      : "text-gray-muted hover:bg-white/5"
                  }`}
                >
                  <User size={13} />
                  Profile
                </button>
                <button
                  onClick={() => setTab("password")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    tab === "password"
                      ? "bg-gpssa-green/15 text-gpssa-green"
                      : "text-gray-muted hover:bg-white/5"
                  }`}
                >
                  <Lock size={13} />
                  Password
                </button>
              </div>

              {tab === "profile" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-gray-muted mb-1 uppercase tracking-wider">
                      Display Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-muted mb-1 uppercase tracking-wider">
                      Email
                    </label>
                    <p className="px-3 py-1.5 text-sm text-gray-muted">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || name === user?.name}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gpssa-green/20 text-gpssa-green hover:bg-gpssa-green/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingProfile ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : profileSaved ? (
                      <Check size={13} />
                    ) : null}
                    {profileSaved ? "Saved" : "Save Changes"}
                  </button>
                </div>
              )}

              {tab === "password" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-gray-muted mb-1 uppercase tracking-wider">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-muted mb-1 uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
                      placeholder="••••••"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-400">{passwordError}</p>
                  )}
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword || !currentPassword || !newPassword}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gpssa-green/20 text-gpssa-green hover:bg-gpssa-green/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingPassword ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : passwordSaved ? (
                      <Check size={13} />
                    ) : null}
                    {passwordSaved ? "Changed" : "Change Password"}
                  </button>
                </div>
              )}
              </>
              )}

              {/* Divider + Sign out */}
              <div
                className={
                  isDemo
                    ? "mt-2"
                    : "mt-4 pt-3 border-t border-[var(--border)]"
                }
              >
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
