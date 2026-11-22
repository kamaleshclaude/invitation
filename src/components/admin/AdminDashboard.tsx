import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Utensils, 
  MapPin, 
  MessageSquare, 
  Download, 
  Trash2, 
  EyeOff, 
  Eye, 
  Lock, 
  Unlock, 
  Search, 
  LogOut, 
  CheckCircle,
  FileSpreadsheet,
  Camera,
  Calendar,
  Sparkles,
  Edit,
  X,
  AlertTriangle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useReunionData } from '../../context/ReunionDataContext';
import { REUNION_CONFIG } from '../../config/reunionConfig';
import { sound } from '../../utils/soundEffects';
import type { Registration } from '../../types';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { 
    registrations, 
    foodPreferences, 
    wallMessages, 
    benchClaims, 
    generatedCards,
    venueVotes,
    dateVotes,
    stats, 
    settings, 
    lockVenue, 
    lockDate,
    updateRegistration,
    deleteRegistration,
    clearAllRegistrations,
    toggleHideMessage, 
    deleteMessage, 
    toggleCardGenerator,
    updateSettings 
  } = useReunionData();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [tab, setTab] = useState<'attendees' | 'cards' | 'food' | 'wall' | 'announcement'>('attendees');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Yes' | 'Maybe' | 'No'>('All');

  // Edit Registration Modal State
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Announcement edit
  const [announcementNotes, setAnnouncementNotes] = useState(settings.announcement_notes || '');

  // Login Handler (Master PIN / Admin password fallback: "star2026", "admin123", or "reunion2026")
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'star2026' || password === 'admin123' || password === 'reunion2026') {
      sound.playCelebration();
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      sound.playPop();
      setAuthError('Invalid Admin credentials. (Hint: star2026)');
    }
  };

  // Export Attendees to CSV
  const exportAttendeesCSV = () => {
    sound.playPop();
    const headers = ["ID", "Full Name", "Phone", "Email", "Batch", "Guests", "Attendance Status", "Registration Date"];
    const rows = registrations.map(r => [
      r.id,
      `"${r.name}"`,
      `"${r.phone}"`,
      `"${r.email || ''}"`,
      `"${r.batch}"`,
      r.guests,
      r.attendance_status,
      `"${new Date(r.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Star-Matric-Registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Food Preferences to CSV
  const exportFoodCSV = () => {
    sound.playPop();
    const headers = ["ID", "Attendee Name", "Diet (Veg/Non-veg)", "Spice Level", "Guest Count", "Dietary Notes", "Created At"];
    const rows = foodPreferences.map(f => [
      f.id,
      `"${f.attendee_name}"`,
      f.diet,
      f.spice_level,
      f.guests_count,
      `"${(f.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(f.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Star-Matric-Food-Orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;
    sound.playPop();
    await updateRegistration(editingReg.id, editingReg);
    setEditingReg(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    sound.playPop();
    await deleteRegistration(deletingId);
    setDeletingId(null);
  };

  const handleClearAllRegistrations = async () => {
    if (window.confirm("⚠️ Are you sure you want to clear all test registrations to start fresh for your real batchmates? This will reset attendee registrations, food orders, and bench claims.")) {
      sound.playPop();
      await clearAllRegistrations();
    }
  };

  // Filtered Attendees
  const filteredRegistrations = registrations.filter(r => {
    const matchesQuery = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.phone.includes(searchQuery) ||
                         r.batch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.attendance_status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // ================= ADMIN LOGIN SCREEN (PHASE 13) =================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#594337]/50 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full clay-card p-8 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-full clay-surface-cream text-[#E9B95B] flex items-center justify-center mx-auto border border-[#F0E1CE]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-[#594337]">
              Reunion Organizer Portal
            </h3>
            <p className="text-xs text-[#927B6C]">
              Authorized administrator dashboard for {REUNION_CONFIG.schoolName}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#E9B8B0]/40 border border-[#E9B8B0] text-[#594337] text-xs font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-1.5">
                Admin Password / PIN
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter password (e.g. star2026)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 clay-input text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-[18px] clay-button-gold text-sm font-black text-[#413027] shadow-sm"
            >
              SIGN IN TO ADMIN CONSOLE
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="text-xs text-[#927B6C] hover:text-[#594337] font-bold underline"
            >
              &larr; Return to Public Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ================= ADMIN DASHBOARD (PHASE 14) =================
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFF5E8] text-[#594337] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full clay-pill bg-[#FFF5E8] text-xs font-extrabold text-[#594337] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E9B95B]" />
              <span>Organizer Administration Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#594337]">
              {REUNION_CONFIG.schoolName} — Admin Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={exportAttendeesCSV}
              className="px-4 py-2.5 rounded-[16px] clay-button text-xs font-bold text-[#594337] flex items-center space-x-1.5 border border-[#F0E1CE]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-[16px] clay-button text-xs font-bold text-[#927B6C] hover:text-[#594337] flex items-center space-x-1.5 border border-[#F0E1CE]"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS (With 60-Student Restriction Indicator) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="clay-card p-5 bg-[#FFFFFF] border-2 border-[#FFFFFF]">
            <span className="text-xs uppercase font-extrabold text-[#927B6C]">Registrations</span>
            <div className="text-3xl font-black text-[#594337] mt-1">{stats.totalRegistrations} / 60</div>
            <span className="text-[11px] text-[#927B6C] font-semibold">
              {stats.spotsRemaining} spots available
            </span>
          </div>

          <div className="clay-card p-5 bg-[#FFFFFF] border-2 border-[#FFFFFF]">
            <span className="text-xs uppercase font-extrabold text-[#927B6C]">Total Attending</span>
            <div className="text-3xl font-black text-[#594337] mt-1">{stats.totalAttending}</div>
            <span className="text-[11px] text-[#927B6C] font-semibold">
              {stats.yesCount} classmates + {stats.totalGuests} guests
            </span>
          </div>

          <div className="clay-card p-5 bg-[#FFFFFF] border-2 border-[#FFFFFF]">
            <span className="text-xs uppercase font-extrabold text-[#927B6C]">Reunion Schedule</span>
            <div className="text-xl sm:text-2xl font-black text-[#594337] mt-1">27 Dec 2026</div>
            <span className="text-[11px] text-[#927B6C] font-semibold">
              10:00 AM IST • Confirmed
            </span>
          </div>

          <div className="clay-card p-5 bg-[#FFFFFF] border-2 border-[#FFFFFF]">
            <span className="text-xs uppercase font-extrabold text-[#927B6C]">Memory Cards Created</span>
            <div className="text-3xl font-black text-[#E9B95B] mt-1">{stats.totalCardsGenerated}</div>
            <span className="text-[11px] text-[#927B6C] font-semibold">
              Personalized keepsakes downloaded
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-[#F0E1CE] space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'attendees', name: 'Registrations', icon: Users },
            { id: 'cards', name: 'Memory Cards', icon: Camera },
            { id: 'food', name: 'Catering Orders', icon: Utensils },
            { id: 'wall', name: 'Sticky Notes', icon: MessageSquare },
            { id: 'announcement', name: 'Announcement', icon: Sparkles },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playPop();
                setTab(t.id as any);
              }}
              className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition border-b-2 ${
                tab === t.id
                  ? 'clay-surface-cream text-[#594337] border-[#E9B95B]'
                  : 'text-[#927B6C] hover:text-[#594337] border-transparent'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: REGISTRATIONS MANAGEMENT */}
        {tab === 'attendees' && (
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="w-4 h-4 text-[#927B6C] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 clay-input text-xs font-semibold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#927B6C]">Status:</span>
                {(['All', 'Yes', 'Maybe', 'No'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      statusFilter === s
                        ? 'clay-button-gold text-[#413027] border-[#E9B95B]'
                        : 'clay-button text-[#927B6C] border-[#F0E1CE]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {registrations.length > 0 && (
                  <button
                    onClick={handleClearAllRegistrations}
                    title="Clear test data to launch live for real classmates"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold clay-button text-rose-700 border border-rose-200 hover:bg-rose-50 flex items-center space-x-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset / Go Live</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#F0E1CE]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF5E8] text-[#594337] font-black uppercase tracking-wider border-b border-[#F0E1CE]">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Batch</th>
                    <th className="p-3.5">Guests</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E1CE] font-semibold text-[#594337]">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#927B6C]">
                        No registrations match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FFFDF9] transition">
                        <td className="p-3.5 font-bold">{r.name}</td>
                        <td className="p-3.5 font-mono">{r.phone}</td>
                        <td className="p-3.5">{r.batch}</td>
                        <td className="p-3.5">+{r.guests}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            r.attendance_status === 'Yes' ? 'bg-emerald-100 text-emerald-800' :
                            r.attendance_status === 'Maybe' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {r.attendance_status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setEditingReg(r)}
                            className="p-1.5 rounded-lg clay-button text-[#594337] hover:text-[#E9B95B]"
                            title="Edit Registration"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(r.id)}
                            className="p-1.5 rounded-lg clay-button text-[#927B6C] hover:text-rose-600"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ANNOUNCEMENT MANAGEMENT */}
        {tab === 'announcement' && (
          <div className="clay-card p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#FFFFFF] max-w-2xl mx-auto space-y-5">
            <h3 className="text-lg font-black text-[#594337] pb-2 border-b border-[#F0E1CE]">
              Manage Official Announcement
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[#927B6C] mb-1">Announcement Message Note:</label>
                <textarea
                  rows={3}
                  value={announcementNotes}
                  onChange={(e) => setAnnouncementNotes(e.target.value)}
                  placeholder="e.g. Venue finalized! Bus transportation arrangements details coming soon..."
                  className="w-full px-4 py-3 clay-input text-xs font-semibold"
                />
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  updateSettings({ announcement_notes: announcementNotes });
                }}
                className="px-6 py-2.5 rounded-[16px] clay-button-gold text-xs font-black text-[#413027]"
              >
                SAVE ANNOUNCEMENT NOTE
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: MEMORY CARDS MANAGEMENT */}
        {tab === 'cards' && (
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#F0E1CE] gap-2">
              <div>
                <h3 className="text-base font-black text-[#594337]">
                  Personalized Memory Card Studio Management
                </h3>
                <p className="text-xs text-[#927B6C]">
                  Total Keepsake Downloads: <strong>{stats.totalCardsGenerated}</strong> cards rendered
                </p>
              </div>

              <button
                onClick={() => toggleCardGenerator(!settings.card_generator_enabled)}
                className="px-4 py-2 rounded-xl clay-button text-xs font-bold flex items-center space-x-2 border border-[#F0E1CE]"
              >
                {settings.card_generator_enabled ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                    <span>Generator Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-rose-600" />
                    <span>Generator Disabled</span>
                  </>
                )}
              </button>
            </div>

            {/* Recent Cards List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#927B6C]">
                Recent Generated Card Activity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {generatedCards.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl clay-surface-beige space-y-1">
                    <div className="text-xs font-black text-[#594337]">{c.studentName}</div>
                    <div className="text-[11px] text-[#927B6C]">
                      Template: <span className="font-bold text-[#594337] uppercase">{c.templateId}</span>
                    </div>
                    <div className="text-[10px] text-[#927B6C]">
                      Downloads: {c.downloadCount || 1} • {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CATERING / FOOD */}
        {tab === 'food' && (
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E1CE]">
              <h3 className="text-base font-black text-[#594337]">
                Biryani & Catering Preference Roster
              </h3>
              <button
                onClick={exportFoodCSV}
                className="px-4 py-2 rounded-xl clay-button text-xs font-bold text-[#594337] flex items-center space-x-1.5 border border-[#F0E1CE]"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Catering Orders</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#F0E1CE]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF5E8] text-[#594337] font-black uppercase tracking-wider border-b border-[#F0E1CE]">
                  <tr>
                    <th className="p-3.5">Attendee</th>
                    <th className="p-3.5">Diet</th>
                    <th className="p-3.5">Spice</th>
                    <th className="p-3.5">Guests</th>
                    <th className="p-3.5">Special Dietary Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E1CE] font-semibold text-[#594337]">
                  {foodPreferences.map((f) => (
                    <tr key={f.id} className="hover:bg-[#FFFDF9]">
                      <td className="p-3.5 font-bold">{f.attendee_name}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.diet === 'Veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {f.diet}
                        </span>
                      </td>
                      <td className="p-3.5">{f.spice_level}</td>
                      <td className="p-3.5">+{f.guests_count}</td>
                      <td className="p-3.5 italic text-[#927B6C]">{f.notes || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: WALL MESSAGES MODERATION */}
        {tab === 'wall' && (
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-6">
            <h3 className="text-base font-black text-[#594337] pb-3 border-b border-[#F0E1CE]">
              Message Wall Moderation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wallMessages.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl clay-surface-beige space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-[#594337]">
                      <span>{m.name}</span>
                      {m.hidden && <span className="text-[10px] text-rose-600 font-black">(HIDDEN)</span>}
                    </div>
                    <p className="text-xs font-kalam text-[#594337] mt-1">"{m.message}"</p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-[#F0E1CE]">
                    <button
                      onClick={() => toggleHideMessage(m.id, !m.hidden)}
                      className="p-1.5 rounded-lg clay-button text-xs"
                      title={m.hidden ? "Unhide" : "Hide"}
                    >
                      {m.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="p-1.5 rounded-lg clay-button text-xs text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EDIT REGISTRATION MODAL */}
      <AnimatePresence>
        {editingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#594337]/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#F0E1CE]">
                <h3 className="font-black text-sm text-[#594337]">Edit Student Registration</h3>
                <button onClick={() => setEditingReg(null)} className="p-1 text-[#927B6C] hover:text-[#594337]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-[#927B6C] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingReg.name}
                    onChange={(e) => setEditingReg({ ...editingReg, name: e.target.value })}
                    className="w-full px-3 py-2 clay-input text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[#927B6C] mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={editingReg.phone}
                    onChange={(e) => setEditingReg({ ...editingReg, phone: e.target.value })}
                    className="w-full px-3 py-2 clay-input text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[#927B6C] mb-1">Batch / Section</label>
                  <input
                    type="text"
                    value={editingReg.batch}
                    onChange={(e) => setEditingReg({ ...editingReg, batch: e.target.value })}
                    className="w-full px-3 py-2 clay-input text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[#927B6C] mb-1">Attendance Status</label>
                  <select
                    value={editingReg.attendance_status}
                    onChange={(e) => setEditingReg({ ...editingReg, attendance_status: e.target.value as any })}
                    className="w-full px-3 py-2 clay-input text-xs font-semibold bg-[#FFFDF9]"
                  >
                    <option value="Yes">Yes</option>
                    <option value="Maybe">Maybe</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingReg(null)}
                    className="px-4 py-2 rounded-xl clay-button text-xs font-bold text-[#927B6C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl clay-button-gold text-xs font-black text-[#413027]"
                  >
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#594337]/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#E9B8B0] text-rose-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-sm text-[#594337]">Delete Registration?</h3>
              <p className="text-xs text-[#927B6C]">
                Are you sure you want to remove this registration record? This action cannot be undone.
              </p>
              <div className="pt-2 flex justify-center space-x-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl clay-button text-xs font-bold text-[#927B6C]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl clay-surface-peach text-xs font-black text-rose-800 border border-rose-300"
                >
                  DELETE RECORD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
