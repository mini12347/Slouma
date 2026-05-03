import React, { useState } from 'react';
import { 
  Building2, Users, FileText, Settings, LogOut, CheckCircle, 
  XCircle, Clock, Search, Filter, AlertCircle, TrendingUp, MoreVertical, 
  ChevronRight, ArrowRight, UserPlus, Download, Bell, Plus, Menu, Globe, Activity, MessageSquare,
  Stethoscope, HeartPulse, Eye, EyeOff
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import SettingsModal from '../../shared/SettingsModal';
import NotificationsPanel from '../../shared/NotificationsPanel';
import MessagesSection from '../../shared/MessagesSection';
import { translations } from '../../shared/translations';

import { adminService } from '../../services/adminService';
import { notificationService } from '../../services/notificationService';

import jsPDF from "jspdf/dist/jspdf.es.min.js";

const SPECIALTY_CODES = {
  'Cardiology': 'CARD',
  'Endocrinology': 'ENDO',
  'Neurology': 'NEURO',
  'General Medicine': 'GEN'
};

const CONDITION_CODES = {
  'Heart Disease': 'HEART',
  'Hypertension': 'HYPER',
  'Diabetes': 'DIAB',
  'Alzheimer': 'ALZH',
  'General': 'GEN'
};

const CONDITION_TO_SPECIALTY = {
  'Heart Disease': 'Cardiology',
  'Hypertension': 'Cardiology',
  'Diabetes': 'Endocrinology',
  'Alzheimer': 'Neurology',
  'General': 'General Medicine'
};

const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#134e4a', '#1e293b'];
const STYLIZED_ICONS = {
  Stethoscope, HeartPulse
};



function StatCard({ icon: Icon, label, value, trend, colorClass, gradientClass }) {
  return (
    <div className={`bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-xl transition-all group overflow-hidden relative`}>
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none ${gradientClass}`}></div>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-inner ${colorClass}`}>
          <Icon className="w-7 h-7" />
        </div>
        <span className={`px-4 py-1.5 text-xs font-black rounded-xl border ${trend.startsWith('+') ? 'bg-teal-50 text-teal-700 border-teal-200' : trend.startsWith('-') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-sm font-black uppercase tracking-wider relative z-10">{label}</p>
      <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1 relative z-10">{value}</h3>
    </div>
  );
}

const TIME_AGO = {
  en: { never: 'Never', justNow: 'Just now', minsAgo: m => `${m}m ago`, hoursAgo: h => `${h}h ago` },
  fr: { never: 'Jamais', justNow: 'À l\'instant', minsAgo: m => `Il y a ${m}m`, hoursAgo: h => `Il y a ${h}h` },
  ar: { never: 'مطلقاً', justNow: 'الآن', minsAgo: m => `منذ ${m} دق`, hoursAgo: h => `منذ ${h} سا` },
  tn: { never: 'محلها', justNow: 'دحوة', minsAgo: m => `منذ ${m} دق`, hoursAgo: h => `منذ ${h} سا` },
};

function AdminUsers({ admin, language, onAddUser, users, onDeleteUser, onApproveUser, onEditUser }) {
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const isRtl = language === 'tn' || language === 'ar';
  const ta = (translations[language] || translations.en).admin;
  const tc = (translations[language] || translations.en).common;
  const timeLabels = TIME_AGO[language] || TIME_AGO.en;

  const togglePasswordVisibility = async (userId) => {
    if (!visiblePasswords[userId]) {
      const adminPassword = prompt("Please enter YOUR admin password to view this user's password:");
      if (!adminPassword) return;

      try {
        await adminService.verifyPassword(admin.id || admin._id, adminPassword);
      } catch (err) {
        alert("Invalid admin password. Access denied.");
        return;
      }
    }

    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatTimeAgo = (date) => {
    if (!date) return timeLabels.never;
    const diff = new Date() - new Date(date);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return timeLabels.justNow;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return timeLabels.minsAgo(minutes);
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return timeLabels.hoursAgo(hours);
    return new Date(date).toLocaleDateString();
  };

  const filteredUsers = (users || []).filter(u => u.name && u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          {ta.users}
        </h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'}`} />
            <input 
              type="text" 
              placeholder={tc.search || 'Search'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:border-teal-600 outline-none transition-all font-semibold`}
            />
          </div>
          <button 
            onClick={onAddUser}
            className="px-5 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-600/25 font-black rounded-2xl flex items-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">{ta.addUser}</span>
          </button>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveSubTab('all')}
          className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeSubTab === 'all' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {ta.allUsers}
        </button>
        <button 
          onClick={() => setActiveSubTab('pending')}
          className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeSubTab === 'pending' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {ta.pendingApproval}
          <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-[10px]">
            {users.filter(u => u.status === 'pending').length}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse" dir={isRtl ? 'rtl' : 'ltr'}>
            <thead className="bg-slate-50 rounded-2xl">
              <tr>
                <th className={`px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 ${isRtl ? 'text-right rounded-tr-2xl rounded-br-2xl' : 'text-left rounded-tl-2xl rounded-bl-2xl'}`}>{ta.user}</th>
                <th className={`px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>{ta.role}</th>
                <th className={`px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>{ta.status}</th>
                <th className={`px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>{ta.lastActivity}</th>
                <th className={`px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>Password</th>
                <th className={`px-6 py-5 font-black text-xs uppercase tracking-wider text-slate-500 ${isRtl ? 'text-left rounded-tl-2xl rounded-bl-2xl' : 'text-right rounded-tr-2xl rounded-bl-2xl'}`}>{ta.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.filter(u => activeSubTab === 'all' ? (u.status !== 'pending') : (u.status === 'pending')).map(user => (
                <tr key={user.id || user._id} className="hover:bg-teal-50/40 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-black flex items-center justify-center shrink-0 border border-teal-200 shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{user.name}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-700">{user.role}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{user.department}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black capitalize border shadow-sm ${
                      user.status === 'active' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {user.status === 'active' && <span className={`w-2 h-2 rounded-full bg-teal-600 ${isRtl ? 'ml-2' : 'mr-2'}`}></span>}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-500">{formatTimeAgo(user.lastActive)}</td>
                  <td className="px-6 py-5">
                    <code className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-mono text-teal-700 border border-teal-100 shadow-inner">
                      {visiblePasswords[user.id || user._id] ? (user.passwordHint || 'N/A') : '••••••••'}
                    </code>
                  </td>

                  <td className={`px-6 py-5 ${isRtl ? 'text-left' : 'text-right'}`}>
                    <div className="flex gap-2 justify-end">
                      {user.status === 'pending' && (
                      <button 
                        onClick={() => {
                          if (user.role === 'Patient') {
                            const availableDoctors = users
                              .filter(u => u.role === 'Doctor')
                              .map(d => `Dr. ${d.name} ${d.lastname && d.lastname !== 'Utilisateur' ? d.lastname : ''} (ID: ${d.id || d._id})`)
                              .join('\n');
                            const docId = prompt(`Enter Doctor ID to link this patient to:\n\nAvailable Doctors:\n${availableDoctors}`);
                            if (docId) onApproveUser(user.id || user._id, user.role, docId);
                          } else {
                            onApproveUser(user.id || user._id, user.role);
                          }
                        }}
                        className="px-4 py-2 bg-teal-600 text-white text-xs font-black rounded-xl shadow-sm hover:bg-teal-700 transition-colors"
                      >
                        {ta.approve}
                      </button>
                    )}
                    <button 
                      onClick={() => onEditUser(user)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:text-teal-700 transition-colors"
                    >
                      {ta.edit}
                    </button>
                    <button 
                      onClick={() => togglePasswordVisibility(user.id || user._id)}
                      className={`p-2 rounded-xl border transition-all ${visiblePasswords[user.id || user._id] ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-slate-400 border-slate-200 hover:text-teal-600 hover:border-teal-200'}`}
                      title={visiblePasswords[user.id || user._id] ? "Hide Password" : "Show Password"}
                    >
                      {visiblePasswords[user.id || user._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                      <button 
                        onClick={() => onDeleteUser(user.role, user.id || user._id)}
                        className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-black rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors"
                      >
                        {ta.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminReports({ language, reports, onGenerateReport, onDownloadReport }) {
  const isRtl = language === 'tn' || language === 'ar';
  const ta = (translations[language] || translations.en).admin;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{ta.systemReports}</h2>
        <button 
          onClick={onGenerateReport}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-teal-600/25 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> {ta.generateReport}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(reports || []).map(report => (
          <div key={report.id || report._id} className="bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-teal-300 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-inner group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-xs font-black px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200">{report.type || ta.noData}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{report.title}</h3>
            <div className="flex flex-col gap-1 text-sm font-semibold text-slate-500 mb-8">
              <span>{new Date(report.date).toLocaleDateString()}</span>
              <span>{ta.generatedBy}: {report.author || ta.system}</span>
            </div>
            <button 
              onClick={() => onDownloadReport(report)}
              className="w-full flex justify-center items-center gap-2 py-4 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-800 font-black rounded-2xl border border-slate-200 hover:border-teal-200 transition-colors"
            >
              <Download className="w-5 h-5" /> {ta.downloadPdf}
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAnalytics({ language, statsData }) {
  const isRtl = language === 'tn' || language === 'ar';
  const ta = (translations[language] || translations.en).admin;
  const tc = (translations[language] || translations.en).common;
  const dataPie = [
    { name: tc.roles.doctor, value: statsData?.doctorsCount || 0 }, 
    { name: tc.roles.caregiver, value: statsData?.caregiversCount || 0 }, 
    { name: tc.roles.patient, value: statsData?.patientsCount || 0 },
    { name: tc.roles.admin, value: statsData?.adminsCount || 0 }
  ].filter(d => d.value > 0);
  
  if (dataPie.length === 0) {
    dataPie.push({ name: ta.noData, value: 1 });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8">{ta.usageAnalytics}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
          <h3 className="font-black text-slate-800 mb-8 text-xl">{ta.platformGrowth}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statsData?.registrationTrends || [{name: 'Jan', val: 0}]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight:700, fill:'#94a3b8'}} dy={10}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontWeight:700, fill:'#94a3b8'}} dx={-10}/>
              <Tooltip contentStyle={{borderRadius: '16px', fontWeight: 'bold', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
              <Line type="monotone" dataKey="val" stroke="#14b8a6" strokeWidth={5} dot={{r: 6, strokeWidth: 3, fill: '#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col">
          <h3 className="font-black text-slate-800 mb-8 text-xl">{ta.roleDistribution}</h3>
          <div className="flex-1 flex justify-center items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dataPie} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', fontWeight: 'bold', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            {dataPie.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                <span className="font-bold text-slate-600 text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminInterface({ admin, onLogout, language, setLanguage, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [formError, setFormError] = useState('');

  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastType, setBroadcastType] = useState('notification');
  const [broadcastContent, setBroadcastContent] = useState('');

  const [newUserRole, setNewUserRole] = useState('Doctor');

  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('Cardiology');
  const [newDoctorCondition, setNewDoctorCondition] = useState('Heart Disease');
  const [newPatientCondition, setNewPatientCondition] = useState('Heart Disease');
  const [newPatientDoctor, setNewPatientDoctor] = useState('');
  const [newCaregiverPatient, setNewCaregiverPatient] = useState('');

  const generatedId = newUserRole === 'Doctor' 
    ? `${SPECIALTY_CODES[newDoctorSpecialty] || 'GEN'}-${CONDITION_CODES[newDoctorCondition] || 'GEN'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`
    : newUserRole === 'Patient'
    ? `PAT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`
    : `CG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;

  const isRtl = language === 'ar' || language === 'tn';
  const tr = translations[language] || translations.en;
  const ta = tr.admin;
  const tc = tr.common;


  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [rawStats, setRawStats] = useState(null);

  const dashboardStats = React.useMemo(() => [
    { label: ta.totalUsers, value: rawStats ? rawStats.totalUsers.toString() : '0', trend: '+0%', icon: Users, colorClass: 'bg-teal-100 text-teal-700 border-teal-200', gradientClass: 'bg-teal-600' },
    { label: ta.activeCases, value: rawStats ? rawStats.patientsCount.toString() : '0', trend: '+0%', icon: Activity, colorClass: 'bg-teal-50 text-teal-700 border-teal-200', gradientClass: 'bg-teal-500' },
    { label: ta.criticalAlerts, value: rawStats ? rawStats.criticalAlertsCount.toString() : '0', trend: '0%', icon: AlertCircle, colorClass: 'bg-rose-100 text-rose-700 border-rose-200', gradientClass: 'bg-rose-500' },
    { label: ta.systemHealth, value: '100%', trend: ta.optimal, icon: CheckCircle, colorClass: 'bg-teal-50 text-teal-700 border-teal-200', gradientClass: 'bg-teal-500' },
  ], [ta, rawStats]);

  const refreshDashboard = () => {
    if (admin) {
        adminService.getDashboard(admin.id || admin._id).then(data => {
        const users = data.users || [];
        if (users.length === 0) {
          setUsersList([
            { _id: 'u1', name: 'Dr. Mansour', email: 'mansour@slouma.tn', role: 'Doctor', status: 'active', department: 'Cardiology', lastActive: new Date() },
            { _id: 'u2', name: 'Ali Ben Salem', email: 'ali@gmail.com', role: 'Patient', status: 'active', department: 'General', lastActive: new Date() }
          ]);
        } else {
          setUsersList(users);
        }

        const reports = data.reports || [];
        if (reports.length === 0) {
          setReportsList([
            { _id: 'r1', title: 'Système Mensuel - Avril', date: new Date(), author: 'Admin', type: 'Performance', content: 'Le système fonctionne de manière optimale.' }
          ]);
        } else {
          setReportsList(reports);
        }

        const activity = data.activityLog || [];
        if (activity.length === 0) {
          setActivityLogs([
            { date: new Date(), msg: 'Système démarré', user: 'Système' },
            { date: new Date(), msg: 'Admin connecté', user: 'Admin' }
          ]);
        } else {
          setActivityLogs(activity);
        }
        
        setRawStats(data.stats || {
          totalUsers: 2,
          patientsCount: 1,
          doctorsCount: 1,
          caregiversCount: 0,
          adminsCount: 1,
          criticalAlertsCount: 0,
          registrationTrends: [{ name: 'Apr', val: 2 }]
        });
      }).catch(console.error);

      notificationService.getUserNotifications(admin.id || admin._id)

        .then(data => {
          setUnreadNotifications(data.filter(n => !n.read).length);
        })
        .catch(console.error);
    }
  };

  React.useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 30000);
    return () => clearInterval(interval);
  }, [admin]);

  const handleDeleteUser = async (role, id) => {
    if (window.confirm(`${ta.delete} (${role})?`)) {
      try {
        await adminService.deleteUser(role, id, admin.id || admin._id);
        refreshDashboard();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleApproveUser = async (id, role, doctorID) => {
    try {
      await adminService.approveUser(id, role, admin.id || admin._id, doctorID);
      refreshDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadReport = (report) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(20, 184, 166);
    doc.text(ta.pdfTitle, 105, 20, { align: "center" });
    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(report.title, 20, 40);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${new Date(report.date).toLocaleString()}`, 20, 50);
    doc.text(`${ta.pdfAuthor}: ${report.author || 'Admin'}`, 20, 55);
    doc.text(`${ta.pdfId}: ${report._id || 'N/A'}`, 20, 60);
    doc.setLineWidth(0.1);
    doc.line(20, 65, 190, 65);
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    const splitContent = doc.splitTextToSize(report.content || ta.noData, 170);
    doc.text(splitContent, 20, 75);
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`${ta.pdfPage} ${i} ${ta.pdfOf} ${pageCount}`, 105, 290, { align: "center" });
        doc.text(ta.pdfFooter, 105, 285, { align: "center" });
    }
    doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleGenerateReport = () => {
    setShowAddReportModal(true);
  };

  const handleSubmitAddReport = async (e) => {
    e.preventDefault();
    try {
      await adminService.generateReport(admin.id || admin._id, reportTitle, reportContent);
      setShowAddReportModal(false);
      setReportTitle('');
      setReportContent('');
      refreshDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      lastname: formData.get('lastname') || 'Utilisateur',
      email: formData.get('email'),
      phone: formData.get('phone') || '00000000',
      address: formData.get('address') || '',
      password: formData.get('password') || 'password123',
      role: newUserRole,
      status: formData.get('status') || 'active',
      id: generatedId
    };

    if (newUserRole === 'Doctor') {
      userData.specialty = newDoctorSpecialty;
    } else if (newUserRole === 'Patient') {
      userData.bloodGroup = formData.get('bloodGroup') || 'O+';
      userData.dateOfBirth = formData.get('dateOfBirth') || new Date();
      userData.gender = formData.get('gender') || 'Other';
      if (newPatientDoctor) {
        userData.doctorID = newPatientDoctor;
      }
      userData.vitalSigns = [{
        heartRate: Number(formData.get('heartRate')) || 70,
        bloodPressure: formData.get('bloodPressure') || '120/80',
        respiratoryRate: Number(formData.get('respiratoryRate')) || 16,
        temperature: Number(formData.get('temperature')) || 36.6,
        date: new Date()
      }];
    } else if (newUserRole === 'Caregiver') {
      if (newCaregiverPatient) {
        userData.patientIDs = [newCaregiverPatient];
      }
    }

    try {
      await adminService.createUser(userData, admin?.id || admin?._id);
      setShowAddUserModal(false);
      setFormError('');
      refreshDashboard();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  const handleEditUser = (user) => {
    const parts = (user.name || '').trim().split(' ');
    const rawName = parts[0] || '';
    const rawLastname = parts.slice(1).join(' ') || user.lastname || '';
    setEditingUser({ ...user, _rawName: rawName, _rawLastname: rawLastname });
    setFormError('');
    setShowEditUserModal(true);
  };

  const handleSubmitEditUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      lastname: formData.get('lastname'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      status: formData.get('status'),
    };

    if (editingUser.role === 'Doctor') {
      userData.specialty = formData.get('specialty');
    } else if (editingUser.role === 'Patient') {
      userData.bloodGroup = formData.get('bloodGroup');
      userData.dateOfBirth = formData.get('dateOfBirth');
      userData.gender = formData.get('gender');
    } else if (editingUser.role === 'Caregiver') {
      const pId = formData.get('patientIDs');
      if (pId) {
        userData.patientIDs = [pId];
      } else {
        userData.patientIDs = [];
      }
    }
    
    Object.keys(userData).forEach(key => {
      if (userData[key] === null || userData[key] === undefined || userData[key] === '') {
        delete userData[key];
      }
    });

    try {
      await adminService.updateUser(editingUser.role, editingUser._id || editingUser.id, userData, admin?.id || admin?._id);
      setShowEditUserModal(false);
      setFormError('');
      refreshDashboard();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };


  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    try {
      if (broadcastType === 'notification') {
        await adminService.broadcastNotification(broadcastTarget, broadcastContent, 'info');
      } else {
        await adminService.broadcastMessage(admin?._id || admin?.id, broadcastTarget, broadcastContent);
      }
      alert(ta.broadcastSent || 'Sent!');
      setShowBroadcastModal(false);
      setBroadcastContent('');
      setFormError('');
      refreshDashboard();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800"  dir={isRtl ? 'rtl' : 'ltr'}>
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 transition-opacity"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} top-0 bottom-0 w-100 bg-white border-slate-200 shadow-2xl z-50 sidebar-transition flex flex-col ${
        showSidebar ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
      }`}>
        <div className="h-28 flex items-center px-6 border-b border-slate-100 bg-slate-50/50 shrink-0 relative">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/25 shrink-0">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="ms-4 flex-1 min-w-0 pe-8">
            <span className="font-black text-xl tracking-tight leading-none text-slate-800 block truncate">
              Slouma <span className="text-teal-700 font-medium">{ta.adminPortal}</span>
            </span>
            <p className="text-teal-700 font-bold text-[10px] uppercase tracking-widest mt-1 truncate">{ta.adminPortal}</p>
          </div>
          <button 
            onClick={() => setShowSidebar(false)}
            className="absolute top-3 end-3 p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-8 px-6 space-y-3 overflow-y-auto">
          {[
            { id: 'dashboard', icon: Building2, label: ta.dashboard },
            { id: 'users', icon: Users, label: ta.users },
            { id: 'reports', icon: FileText, label: ta.reports },
            { id: 'messages', icon: MessageSquare, label: ta.messages },
            { id: 'analytics', icon: TrendingUp, label: ta.analytics },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setShowSidebar(false); }}
              className={`w-full flex items-center px-6 py-4 text-base font-black rounded-2xl transition-all duration-300 group gap-4 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-lg shadow-teal-700/20' 
                  : 'text-slate-500 hover:bg-teal-50 hover:text-teal-800'
              }`}
            >
              <item.icon className={`w-6 h-6 transition-transform ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-teal-600 group-hover:scale-110'}`} />
              <span className="flex-1 text-start truncate">{item.label}</span>
              {activeTab === item.id && (
                <div className="w-1.5 h-6 bg-white rounded-full shrink-0"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-3 bg-slate-50/50 shrink-0">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-center px-4 py-4 text-sm font-black text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-teal-200 hover:text-teal-700 rounded-xl transition-all shadow-sm group"
          >
            <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
            {ta.settings}
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-4 text-sm font-black text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 rounded-xl transition-all shadow-sm group"
          >
            <LogOut className="w-5 h-5 mr-3 text-rose-500 group-hover:scale-110 transition-transform" />
            {ta.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 main-content-transition lg:${isRtl ? (showSidebar ? 'mr-80' : 'mr-0') : (showSidebar ? 'ml-80' : 'ml-0')} flex flex-col min-h-screen`}>
        <header className="h-28 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 sm:px-10 shadow-sm">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setShowSidebar(!showSidebar)} 
              className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize hidden sm:block">
              {{
                dashboard: ta.dashboard,
                users: ta.users,
                reports: ta.reports,
                messages: ta.messages,
                analytics: ta.analytics
              }[activeTab]}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200"
              >
                <Globe className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-bold text-slate-700">{tc.langLabel?.[language]}</span>
              </button>
              {showLanguageMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 min-w-[180px] origin-top-right">
                  {tc.langOptions.map((l) => (
                    <button key={l.code} onClick={() => { setLanguage(l.code); setShowLanguageMenu(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        language === l.code ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}>
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-3 bg-white border border-slate-200 text-slate-500 hover:text-teal-700 rounded-xl shadow-sm hover:shadow-md transition-all group hover:border-teal-200"
            >
              <Bell className="w-6 h-6 flex-shrink-0" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[10px] text-white font-black">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
            <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-tr from-teal-700 to-teal-600 text-white font-black text-xl flex items-center justify-center rounded-xl shadow-sm">
                A
              </div>
              <div className="hidden sm:block text-left pr-2">
                <p className="text-sm font-black text-slate-800 leading-none">{admin?.name || 'System Admin'}</p>
                <p className="text-xs font-bold text-teal-700 mt-1">{ta.superUser}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dashboardStats.map((stat, i) => <StatCard key={i} {...stat} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{ta.recentActivity}</h3>
                      <button className="text-teal-700 font-bold text-sm bg-teal-50 px-4 py-2 rounded-xl">{ta.viewAll}</button>
                    </div>
                    <div className="space-y-5">
                      {(activityLogs.length > 0 ? activityLogs : [
                      { date: new Date(), msg: ta.welcomeMsg, user: ta.system }
                      ]).map((log, i) => (
                        <div key={i} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-sm shadow-inner shrink-0">
                            {log.user.charAt(0)}
                          </div>
                          <div>
                            <p className="text-slate-800 font-bold text-base">{log.msg}</p>
                            <p className="text-slate-400 text-sm font-semibold mt-0.5">{new Date(log.date).toLocaleTimeString()} • {log.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-800 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-teal-800/25 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h3 className="text-2xl font-black mb-2 relative z-10">{ta.systemStatus}</h3>
                    <p className="text-teal-100 font-bold mb-8 relative z-10 text-sm">{ta.systemOptimal}</p>
                    
                    <div className="space-y-4 relative z-10">
                      {[
                        { label: ta.mainDatabase, status: ta.optimal, load: Math.floor(Math.random() * 10 + 20) + '%' },
                        { label: ta.cloudStorage, status: ta.optimal, load: Math.floor(Math.random() * 5 + 5) + '%' },
                        { label: ta.authService, status: ta.optimal, load: Math.floor(Math.random() * 15 + 10) + '%' },
                      ].map((sys, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex justify-between items-center border border-white/20 shadow-sm">
                          <div>
                            <p className="font-bold text-lg">{sys.label}</p>
                            <p className="text-xs text-teal-200 uppercase tracking-widest mt-1 font-bold">{ta.latency}: {sys.load}</p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-lg text-xs font-black shadow-inner bg-teal-600 text-white`}>{sys.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <AdminUsers 
                admin={admin}
                language={language} 
                users={usersList} 
                onAddUser={() => setShowAddUserModal(true)} 
                onDeleteUser={handleDeleteUser}
                onApproveUser={handleApproveUser}
                onEditUser={handleEditUser}
              />
            )}
            {activeTab === 'reports' && (
              <AdminReports 
                language={language} 
                reports={reportsList} 
                onGenerateReport={handleGenerateReport}
                onDownloadReport={handleDownloadReport}
              />
            )}
            {activeTab === 'analytics' && <AdminAnalytics language={language} statsData={rawStats} />}
            {activeTab === 'messages' && (
              <MessagesSection 
                language={language} 
                userRole="admin"
                currentUser={{ id: admin?._id || admin?.id, name: admin?.name || 'Admin', role: 'admin' }} 
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals and Sidebar Toggle */}
      {!showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className={`fixed top-1/2 -translate-y-1/2 z-40 bg-white p-3 shadow-xl border-y border-${isRtl ? 'l' : 'r'} border-slate-200 text-slate-600 hover:bg-slate-100 transition-all ${isRtl ? 'right-0 rounded-l-2xl' : 'left-0 rounded-r-2xl'}`}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">{ta.addUser}</h3>
              <button onClick={() => {setShowAddUserModal(false); setFormError('');}} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            
            {formError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm">{formError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmitAddUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.firstName}</label>
                  <input name="name" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.lastName}</label>
                  <input name="lastname" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.email}</label>
                  <input name="email" type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.roleLabel}</label>
                  <select 
                    value={newUserRole} 
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner appearance-none"
                  >
                    <option value="Doctor">{tc.roles.doctor}</option>
                    <option value="Caregiver">{tc.roles.caregiver}</option>
                    <option value="Patient">{tc.roles.patient}</option>
                  </select>
                </div>
              </div>

              {newUserRole === 'Doctor' && (
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.specialty}</label>
                    <select 
                      value={newDoctorSpecialty}
                      onChange={(e) => setNewDoctorSpecialty(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner"
                    >
                      {Object.keys(SPECIALTY_CODES).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.conditionExpertise}</label>
                    <select 
                      value={newDoctorCondition}
                      onChange={(e) => setNewDoctorCondition(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner"
                    >
                      {Object.keys(CONDITION_CODES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {newUserRole === 'Patient' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.bloodGroup}</label>
                    <input name="bloodGroup" placeholder="e.g. O+" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.dateOfBirth || "Date of Birth"}</label>
                    <input name="dateOfBirth" type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold text-slate-700 [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:transition-opacity" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.gender}</label>
                    <select name="gender" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold">
                       <option value="Male">{ta.male || "Male"}</option>
                       <option value="Female">{ta.female || "Female"}</option>
                       <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Condition</label>
                    <select 
                      value={newPatientCondition}
                      onChange={(e) => {
                        setNewPatientCondition(e.target.value);
                        setNewPatientDoctor('');
                      }}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold"
                    >
                      {Object.keys(CONDITION_CODES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assign Doctor</label>
                    <select 
                      value={newPatientDoctor}
                      onChange={(e) => setNewPatientDoctor(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold"
                    >
                      <option value="">-- Select a Doctor --</option>
                      {usersList
                        .filter(u => u.role === 'Doctor' && u.specialty === CONDITION_TO_SPECIALTY[newPatientCondition])
                        .map(doc => (
                          <option key={doc.id || doc._id} value={doc.id || doc._id}>
                            Dr. {doc.name} {doc.lastname && doc.lastname !== 'Utilisateur' ? doc.lastname : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {newUserRole === 'Caregiver' && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assign Patient</label>
                    <select 
                      value={newCaregiverPatient}
                      onChange={(e) => setNewCaregiverPatient(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold"
                    >
                      <option value="">-- Select a Patient --</option>
                      {usersList
                        .filter(u => u.role === 'Patient')
                        .map(pat => (
                          <option key={pat.id || pat._id} value={pat.id || pat._id}>
                            {pat.name} {pat.lastname}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  {ta.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 hover:bg-teal-700 transition-colors"
                >
                  {ta.addUserBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">{ta.edit} - {editingUser.role}</h3>
              <button onClick={() => {setShowEditUserModal(false); setFormError('');}} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm">{formError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmitEditUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.firstName}</label>
                  <input name="name" defaultValue={editingUser._rawName || editingUser.name?.split(' ')[0]} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.lastName}</label>
                  <input name="lastname" defaultValue={editingUser._rawLastname || editingUser.name?.split(' ')[1] || ''} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.email}</label>
                  <input name="email" type="email" defaultValue={editingUser.email} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.status}</label>
                  <select 
                    name="status"
                    defaultValue={editingUser.status}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner appearance-none"
                  >
                    <option value="active">{ta.active || 'Active'}</option>
                    <option value="pending">{ta.pending || 'Pending'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.phone || 'Phone'}</label>
                  <input type="tel" name="phone" defaultValue={editingUser.phone} required pattern="^[0-9]{8}$" maxLength="8" title="Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.address || 'Address'}</label>
                  <input name="address" defaultValue={editingUser.address} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold" />
                </div>
              </div>

              {editingUser.role === 'Doctor' && (
                <div className="grid grid-cols-1 gap-6">
                   <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.specialty}</label>
                    <select 
                      name="specialty"
                      defaultValue={editingUser.department || 'General Medicine'}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner"
                    >
                      {Object.keys(SPECIALTY_CODES).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {editingUser.role === 'Patient' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.bloodGroup}</label>
                    <input name="bloodGroup" defaultValue={editingUser.bloodGroup} placeholder="e.g. O+" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.dateOfBirth || "Date of Birth"}</label>
                    <input name="dateOfBirth" type="date" defaultValue={editingUser.dateOfBirth ? new Date(editingUser.dateOfBirth).toISOString().split('T')[0] : ''} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold text-slate-700 [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:transition-opacity" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.gender}</label>
                    <select name="gender" defaultValue={editingUser.gender} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold">
                       <option value="Male">{ta.male || "Male"}</option>
                       <option value="Female">{ta.female || "Female"}</option>
                       <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {editingUser.role === 'Caregiver' && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assign Patient</label>
                    <select 
                      name="patientIDs"
                      defaultValue={editingUser.patientIDs?.[0] || ''}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold shadow-inner"
                    >
                      <option value="">-- Select a Patient --</option>
                      {usersList
                        .filter(u => u.role === 'Patient')
                        .map(pat => (
                          <option key={pat.id || pat._id} value={pat.id || pat._id}>
                            {pat.name} {pat.lastname}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditUserModal(false)}
                  className="px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  {ta.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25 hover:bg-teal-700 transition-colors"
                >
                  {ta.saveChanges || 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-800 mb-8">{ta.newReport}</h3>
            <form onSubmit={handleSubmitAddReport} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.reportTitle}</label>
                <input 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)} 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ta.reportContent}</label>
                <textarea 
                  rows={6} 
                  value={reportContent} 
                  onChange={(e) => setReportContent(e.target.value)} 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-teal-600 outline-none font-bold resize-none" 
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowAddReportModal(false)} className="px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl">{ta.cancel}</button>
                <button type="submit" className="px-8 py-4 bg-teal-600 text-white font-black rounded-2xl shadow-lg shadow-teal-600/25">{ta.generateNow}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        language={language}
        setLanguage={setLanguage}
        currentUser={admin}
        onUpdate={onUpdateUser}
      />
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        language={language} 
        userId={admin?.id || admin?._id} 
        userRole="admin"
        onUpdate={refreshDashboard}
      />
    </div>
  );
}
