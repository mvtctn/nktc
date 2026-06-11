import React, { useState, useEffect } from 'react';
import { db, auth, isValidConfig } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';

// Component Imports
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ProjectSettings from './components/ProjectSettings';
import UserSettings from './components/UserSettings';
import NKTCForm from './components/NKTCForm';
import NKTCParser from './components/NKTCParser';
import BBPSForm from './components/BBPSForm';
import Dashboard from './components/Dashboard';
import ProjectDetailModal from './components/ProjectDetailModal';
import AdminPanel from './components/AdminPanel';

import { Menu, X, User } from 'lucide-react';

// Helper to parse date "DD/MM/YYYY" to Date object
const parseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date(0);
  return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
};

const processDiaries = (diariesList) => {
  if (!diariesList || diariesList.length === 0) return [];

  // Group diaries by projectId to calculate page numbers
  const groups = {};
  diariesList.forEach(d => {
    const pId = d.projectId || 'unknown';
    if (!groups[pId]) {
      groups[pId] = [];
    }
    groups[pId].push(d);
  });

  // For each project, sort diaries by date ascending to assign chronological page numbers
  Object.keys(groups).forEach(pId => {
    groups[pId].sort((a, b) => {
      const dateA = parseDate(a.ngay);
      const dateB = parseDate(b.ngay);
      if (dateA.getTime() === dateB.getTime()) {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB || (a.id || '').localeCompare(b.id || '');
      }
      return dateA - dateB;
    });

    // Assign trang = index + 1
    groups[pId].forEach((d, idx) => {
      d.trang = (idx + 1).toString();
    });
  });

  // Sort the global list by date descending (newest diary date first)
  const sortedGlobalList = [...diariesList].sort((a, b) => {
    const dateA = parseDate(a.ngay);
    const dateB = parseDate(b.ngay);
    if (dateA.getTime() === dateB.getTime()) {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA || (b.id || '').localeCompare(a.id || '');
    }
    return dateB - dateA;
  });

  return sortedGlobalList;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'nktc', 'bbps', 'settings'
  const [settingsSubTab, setSettingsSubTab] = useState('project'); // 'project', 'user'
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // PWA Install Prompt States
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // Read-only state for diaries opened from ProjectDetailModal
  const [diaryReadOnly, setDiaryReadOnly] = useState(false);

  // Toast Alert State
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // Data States
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  
  const [diaries, setDiaries] = useState([]);
  const [activeDiary, setActiveDiary] = useState(null);
  
  const [minutes, setMinutes] = useState([]);
  const [activeMinute, setActiveMinute] = useState(null);

  // Keep activeDiary synchronized with the list of processed diaries
  useEffect(() => {
    if (activeDiary && activeDiary.id) {
      const updated = diaries.find(d => d.id === activeDiary.id);
      if (updated && (updated.trang !== activeDiary.trang || updated.ngay !== activeDiary.ngay)) {
        setActiveDiary(updated);
      }
    }
  }, [diaries, activeDiary]);

  // Global shared equipment & material master lists
  const [equipmentMaster, setEquipmentMaster] = useState([]);
  const [materialMaster, setMaterialMaster] = useState([]);

  // Registered members list
  const [members, setMembers] = useState([]);

  // Project detail modal
  const [viewingProject, setViewingProject] = useState(null);

  const isOffline = user && user.uid === 'offline_local_user';
  const isSuperAdmin = user && user.email === 'maivantiem@gmail.com';

  // 1. Auth Listener
  useEffect(() => {
    // Apply default theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Check local storage for offline login session
    const localUserStr = localStorage.getItem('hydrotech_offline_user');
    if (localUserStr) {
      setUser(JSON.parse(localUserStr));
      setAuthLoading(false);
      return;
    }

    if (isValidConfig) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          // Check & apply pending password change set by admin
          try {
            const { getDocs: _getDocs, collection: _col, query: _q, where: _w, updateDoc: _upd, doc: _doc } = await import('firebase/firestore');
            const snap = await _getDocs(_q(_col(db, 'users'), _w('uid', '==', currentUser.uid)));
            if (!snap.empty) {
              const userDocSnap = snap.docs[0];
              const data = userDocSnap.data();
              if (data.pendingPassword) {
                try {
                  await updatePassword(currentUser, data.pendingPassword);
                  await _upd(_doc(db, 'users', userDocSnap.id), { pendingPassword: null });
                } catch (pwErr) {
                  console.warn('Could not apply pendingPassword (re-auth required):', pwErr);
                }
              }
            }
          } catch (e) {
            console.warn('pendingPassword check failed:', e);
          }
        }
        setUser(currentUser);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  // PWA Installation Prompt Handler
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOSDevice(ios);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const dismissed = localStorage.getItem('hydrotech_pwa_dismissed');

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (ios && !isStandalone && !dismissed) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissPWA = () => {
    setShowInstallBanner(false);
    localStorage.setItem('hydrotech_pwa_dismissed', 'true');
  };

  // Load global master lists when user logs in
  useEffect(() => {
    if (!user) return;
    const eq = localStorage.getItem('hydrotech_equipment_master');
    const mat = localStorage.getItem('hydrotech_material_master');
    if (eq) setEquipmentMaster(JSON.parse(eq));
    if (mat) setMaterialMaster(JSON.parse(mat));
  }, [user]);

  const saveEquipmentMaster = (list) => {
    setEquipmentMaster(list);
    localStorage.setItem('hydrotech_equipment_master', JSON.stringify(list));
  };

  const saveMaterialMaster = (list) => {
    setMaterialMaster(list);
    localStorage.setItem('hydrotech_material_master', JSON.stringify(list));
  };

  const fetchMembers = async () => {
    try {
      if (isOffline || !isValidConfig) {
        const localMembers = localStorage.getItem('hydrotech_members');
        if (localMembers) {
          setMembers(JSON.parse(localMembers));
        } else {
          const seed = [{
            uid: 'admin_uid',
            email: 'maivantiem@gmail.com',
            displayName: 'Mai Văn Tiệm',
            position: 'Chỉ huy trưởng / Super Admin',
            role: 'Super Admin',
            created_at: new Date().toISOString()
          }];
          localStorage.setItem('hydrotech_members', JSON.stringify(seed));
          setMembers(seed);
        }
      } else {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        if (list.length === 0 && user) {
          const defaultAdmin = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Mai Văn Tiệm',
            position: 'Chỉ huy trưởng / Super Admin',
            role: user.email === 'maivantiem@gmail.com' ? 'Super Admin' : 'Kỹ sư hiện trường',
            created_at: new Date().toISOString()
          };
          const docRef = await addDoc(collection(db, 'users'), defaultAdmin);
          list.push({ id: docRef.id, ...defaultAdmin });
        }
        setMembers(list);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách thành viên:', e);
    }
  };

  const handleCreateMember = async (email, password, displayName, position) => {
    try {
      if (isOffline || !isValidConfig) {
        let updated = [...members];
        if (updated.some(m => m.email === email)) {
          showToast('Email này đã tồn tại trong danh sách thành viên cục bộ', true);
          return false;
        }
        const newMem = {
          uid: 'mem_' + Date.now(),
          email,
          displayName,
          position,
          role: email === 'maivantiem@gmail.com' ? 'Super Admin' : 'Kỹ sư hiện trường',
          created_at: new Date().toISOString()
        };
        updated.push(newMem);
        localStorage.setItem('hydrotech_members', JSON.stringify(updated));
        setMembers(updated);
        showToast('Tạo thành viên mới ngoại tuyến thành công!');
        return true;
      } else {
        const { initializeApp, deleteApp } = await import('firebase/app');
        const { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } = await import('firebase/auth');
        const { getFirebaseConfig } = await import('./firebase');
        
        const config = getFirebaseConfig();
        const appName = 'Secondary_' + Date.now();
        const secondaryApp = initializeApp(config, appName);
        const secondaryAuth = getAuth(secondaryApp);
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        await updateProfile(userCredential.user, { displayName });
        await signOut(secondaryAuth);
        await deleteApp(secondaryApp);
        
        const newMemDoc = {
          uid: userCredential.user.uid,
          email,
          displayName,
          position,
          role: email === 'maivantiem@gmail.com' ? 'Super Admin' : 'Kỹ sư hiện trường',
          created_at: new Date().toISOString()
        };
        
        await addDoc(collection(db, 'users'), newMemDoc);
        await fetchMembers();
        showToast('Đã tạo thành công tài khoản kỹ sư trên Firebase!');
        return true;
      }
    } catch (err) {
      console.error(err);
      showToast(`Lỗi khi tạo thành viên mới: ${err.message || err}`, true);
      return false;
    }
  };

  const handleUpdateMember = async (memberId, updatedFields) => {
    try {
      if (isOffline || !isValidConfig) {
        let updated = members.map(m => m.id === memberId || m.uid === memberId ? { ...m, ...updatedFields } : m);
        localStorage.setItem('hydrotech_members', JSON.stringify(updated));
        setMembers(updated);
        showToast('Cập nhật thông tin thành viên cục bộ thành công!');
        return true;
      } else {
        const ref = doc(db, 'users', memberId);
        await updateDoc(ref, updatedFields);
        await fetchMembers();
        showToast('Cập nhật thành viên trên Firestore thành công!');
        return true;
      }
    } catch (e) {
      console.error(e);
      showToast(`Lỗi khi cập nhật thành viên: ${e.message || e}`, true);
      return false;
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      if (isOffline || !isValidConfig) {
        let updated = members.filter(m => m.id !== memberId && m.uid !== memberId);
        localStorage.setItem('hydrotech_members', JSON.stringify(updated));
        setMembers(updated);
        showToast('Đã xóa thành viên khỏi danh sách cục bộ!');
        return true;
      } else {
        const ref = doc(db, 'users', memberId);
        await deleteDoc(ref);
        await fetchMembers();
        showToast('Đã xóa thành viên trên Firestore!');
        return true;
      }
    } catch (e) {
      console.error(e);
      showToast(`Lỗi khi xóa thành viên: ${e.message || e}`, true);
      return false;
    }
  };

  const handleChangePassword = async (memberId, newPassword) => {
    if (!newPassword || newPassword.trim().length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', true);
      return false;
    }
    if (isOffline || !isValidConfig) {
      showToast('Không thể đổi mật khẩu ở chế độ ngoại tuyến', true);
      return false;
    }
    try {
      // Save pendingPassword to Firestore user doc.
      // It will be applied automatically when the user next logs in (auth listener above).
      const ref = doc(db, 'users', memberId);
      await updateDoc(ref, { pendingPassword: newPassword.trim() });
      showToast('Dầu mật khẩu mới đã được lưu. Khả dụng sau khi kỹ sư đăng nhập lại.');
      return true;
    } catch (err) {
      console.error(err);
      showToast(`Lỗi: ${err.message}`, true);
      return false;
    }
  };

  // 2. Data Listener (Projects, Diaries, Minutes)
  useEffect(() => {
    if (!user) return;
    
    // Load projects
    fetchProjects();

    // Load members
    fetchMembers();

    // Setup listener/fetcher for diaries and minutes
    let unsubscribeDiaries = () => {};
    let unsubscribeMinutes = () => {};

    if (isOffline || !isValidConfig) {
      // LocalStorage data load
      loadLocalData();
    } else {
      // Real-time Firestore Sync
      try {
        // Diaries Listener
        const diariesQuery = query(
          collection(db, 'diaries'),
          orderBy('created_at', 'desc')
        );
        unsubscribeDiaries = onSnapshot(diariesQuery, (snapshot) => {
          const list = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setDiaries(processDiaries(list));
        });

        // Minutes Listener
        const minutesQuery = query(
          collection(db, 'minutes'),
          orderBy('created_at', 'desc')
        );
        unsubscribeMinutes = onSnapshot(minutesQuery, (snapshot) => {
          const list = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setMinutes(list);
        });
      } catch (err) {
        console.error('Lỗi khi thiết lập Firestore listener:', err);
        loadLocalData(); // Fallback to local
      }
    }

    return () => {
      unsubscribeDiaries();
      unsubscribeMinutes();
    };
  }, [user, activeProjectId]);

  const fetchProjects = async () => {
    try {
      if (isOffline || !isValidConfig) {
        const localProjs = localStorage.getItem('hydrotech_projects');
        if (localProjs) {
          const list = JSON.parse(localProjs);
          setProjects(list);
          if (list.length > 0 && !activeProjectId) {
            setActiveProjectId(list[0].id);
          }
        }
      } else {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProjects(list);
        if (list.length > 0 && !activeProjectId) {
          setActiveProjectId(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadLocalData = () => {
    // Diaries
    const localDiaries = localStorage.getItem('hydrotech_diaries');
    if (localDiaries) {
      setDiaries(processDiaries(JSON.parse(localDiaries)));
    } else {
      setDiaries([]);
    }

    // Minutes
    const localMinutes = localStorage.getItem('hydrotech_minutes');
    if (localMinutes) {
      setMinutes(JSON.parse(localMinutes));
    } else {
      setMinutes([]);
    }
  };

  // 3. User actions
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser.uid === 'offline_local_user') {
      localStorage.setItem('hydrotech_offline_user', JSON.stringify(loggedInUser));
    }
    showToast(`Chào mừng Kỹ sư ${loggedInUser.displayName || loggedInUser.email.split('@')[0]}!`);
  };

  const handleLogout = async () => {
    try {
      if (isOffline) {
        localStorage.removeItem('hydrotech_offline_user');
      } else {
        await signOut(auth);
      }
      setUser(null);
      setActiveDiary(null);
      setActiveMinute(null);
      setDiaries([]);
      setMinutes([]);
      showToast('Đăng xuất thành công.');
    } catch (e) {
      console.error(e);
      showToast('Không thể đăng xuất', true);
    }
  };

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // DIARY CRUD ACTIONS
  const handleSaveDiary = async (diaryData) => {
    if (!activeProjectId) {
      showToast('Vui lòng chọn hoặc tạo dự án trước khi lưu nhật ký', true);
      return;
    }

    const fullData = {
      projectId: activeProjectId,
      ...diaryData,
      updated_at: new Date().toISOString(),
      user_id: user.uid
    };

    try {
      if (isOffline || !isValidConfig) {
        // Save to localStorage
        let updatedDiaries = [...diaries];
        if (activeDiary && activeDiary.id) {
          updatedDiaries = updatedDiaries.map(d => d.id === activeDiary.id ? { ...d, ...fullData } : d);
          showToast('Cập nhật Nhật ký thi công thành công!');
        } else {
          const newDiary = { id: 'diary_' + Date.now(), created_at: new Date().toISOString(), ...fullData };
          updatedDiaries.unshift(newDiary);
          setActiveDiary(newDiary);
          showToast('Lưu mới Nhật ký thi công thành công!');
        }
        localStorage.setItem('hydrotech_diaries', JSON.stringify(updatedDiaries));
        setDiaries(processDiaries(updatedDiaries));
      } else {
        // Save to Firestore
        if (activeDiary && activeDiary.id) {
          const ref = doc(db, 'diaries', activeDiary.id);
          await updateDoc(ref, fullData);
          showToast('Cập nhật Nhật ký thi công trực tuyến thành công!');
        } else {
          const newDoc = { created_at: new Date().toISOString(), ...fullData };
          const docRef = await addDoc(collection(db, 'diaries'), newDoc);
          setActiveDiary({ id: docRef.id, ...newDoc });
          showToast('Đã đẩy Nhật ký lên Firestore đám mây thành công!');
        }
      }
    } catch (e) {
      console.error(e);
      showToast(`Lỗi khi lưu nhật ký thi công: ${e.message || e}`, true);
    }
  };

  // MINUTES CRUD ACTIONS
  const handleSaveMinute = async (minuteData) => {
    if (!activeProjectId) {
      showToast('Vui lòng chọn hoặc tạo dự án trước khi lưu biên bản', true);
      return;
    }

    const fullData = {
      projectId: activeProjectId,
      ...minuteData,
      updated_at: new Date().toISOString(),
      user_id: user.uid
    };

    try {
      if (isOffline || !isValidConfig) {
        // Save to localStorage
        let updatedMinutes = [...minutes];
        if (activeMinute && activeMinute.id) {
          updatedMinutes = updatedMinutes.map(m => m.id === activeMinute.id ? { ...m, ...fullData } : m);
          showToast('Cập nhật Biên bản hiện trường thành công!');
        } else {
          const newMinute = { id: 'minute_' + Date.now(), created_at: new Date().toISOString(), ...fullData };
          updatedMinutes.unshift(newMinute);
          setActiveMinute(newMinute);
          showToast('Lưu mới Biên bản hiện trường thành công!');
        }
        localStorage.setItem('hydrotech_minutes', JSON.stringify(updatedMinutes));
        setMinutes(updatedMinutes);
      } else {
        // Save to Firestore
        if (activeMinute && activeMinute.id) {
          const ref = doc(db, 'minutes', activeMinute.id);
          await updateDoc(ref, fullData);
          showToast('Cập nhật Biên bản hiện trường trực tuyến thành công!');
        } else {
          const newDoc = { created_at: new Date().toISOString(), ...fullData };
          const docRef = await addDoc(collection(db, 'minutes'), newDoc);
          setActiveMinute({ id: docRef.id, ...newDoc });
          showToast('Đã đẩy Biên bản phát sinh lên Firestore thành công!');
        }
      }
    } catch (e) {
      console.error(e);
      showToast(`Lỗi khi lưu biên bản hiện trường: ${e.message || e}`, true);
    }
  };

  const handleSetTab = (tab) => {
    setCurrentTab(tab);
    if (tab !== 'nktc') {
      setDiaryReadOnly(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a192f' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: '#00e5ff', borderWidth: '3px' }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`toast ${toast.isError ? 'toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        theme={theme}
        toggleTheme={toggleTheme}
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        diaries={diaries}
        activeDiaryId={activeDiary ? activeDiary.id : null}
        onSelectDiary={(diary) => { setActiveDiary(diary); setDiaryReadOnly(false); setMobileMenuOpen(false); }}
        onNewDiary={() => { setActiveDiary(null); setDiaryReadOnly(false); setMobileMenuOpen(false); }}
        minutes={minutes}
        activeMinuteId={activeMinute ? activeMinute.id : null}
        onSelectMinute={(minute) => { setActiveMinute(minute); setMobileMenuOpen(false); }}
        onNewMinute={() => { setActiveMinute(null); setMobileMenuOpen(false); }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Panel Area */}
      <div className="main-content">
        {/* Mobile Navbar */}
        <header className="app-header" style={{ display: 'flex' }}>
          <div className="header-title-container">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="btn btn-secondary" 
              style={{ padding: '6px', border: 'none', background: 'transparent', color: 'white', display: 'block' }}
              id="mobile-menu-trigger"
            >
              <Menu size={24} />
            </button>
            
            <div 
              onClick={() => handleSetTab('dashboard')} 
              style={{ cursor: 'pointer' }}
              title="Về trang chủ Dashboard"
            >
              <span className="header-title">Project Construction diary</span>
            </div>
          </div>

          <button 
            type="button"
            className="user-profile-badge" 
            onClick={() => {
              setCurrentTab('settings');
              setSettingsSubTab('user');
            }}
            title="Xem hồ sơ & cấu hình AI"
          >
            <div className="avatar-circle">
              <User size={15} />
            </div>
            <div className="user-info">
              <span className="user-name">{user.displayName || 'Kỹ sư'}</span>
              <span className={`status-tag ${isOffline ? 'offline' : 'online'}`}>
                {isOffline ? 'Ngoại tuyến' : 'Trực tuyến'}
              </span>
            </div>
          </button>
        </header>

        {currentTab === 'dashboard' && (
          <Dashboard
            user={user}
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            diaries={diaries}
            minutes={minutes}
            setCurrentTab={handleSetTab}
            setSettingsSubTab={setSettingsSubTab}
            onSelectDiary={setActiveDiary}
            onSelectMinute={setActiveMinute}
            onToast={showToast}
            onViewProject={(proj) => {
              setViewingProject(proj);
              handleSetTab('project-detail');
            }}
            onNewDiary={() => {
              setActiveDiary(null);
              setDiaryReadOnly(false);
              setCurrentTab('nktc');
            }}
          />
        )}

        {currentTab === 'project-detail' && viewingProject && (
          <ProjectDetailModal
            project={viewingProject}
            diaries={diaries}
            minutes={minutes}
            onClose={() => {
              setViewingProject(null);
              handleSetTab('dashboard');
            }}
            onOpenDiary={(diary) => {
              setActiveDiary(diary);
              setActiveProjectId(diary.projectId);
              setDiaryReadOnly(true);
              setViewingProject(null);
              setCurrentTab('nktc');
            }}
            onOpenMinute={(minute) => {
              setActiveMinute(minute);
              setActiveProjectId(minute.projectId);
              setViewingProject(null);
              handleSetTab('bbps');
            }}
            onToast={showToast}
          />
        )}

        {currentTab === 'nktc' && (
          <div className="container-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!diaryReadOnly && (!activeDiary || !activeDiary.id || isSuperAdmin) && (
              <NKTCParser 
                onParsed={(parsedData) => setActiveDiary(parsedData)} 
                onToast={showToast} 
                date={activeDiary ? activeDiary.ngay : ''}
                page={activeDiary ? activeDiary.trang : ''}
              />
            )}
            <NKTCForm
              user={user}
              project={activeProject}
              initialData={activeDiary}
              onSave={handleSaveDiary}
              onToast={showToast}
              diaries={diaries}
              equipmentMaster={equipmentMaster}
              materialMaster={materialMaster}
              readOnly={!isSuperAdmin && activeDiary && activeDiary.id ? true : diaryReadOnly}
              onEnableEdit={() => setDiaryReadOnly(false)}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
        )}

        {currentTab === 'bbps' && (
          <BBPSForm
            user={user}
            project={activeProject}
            initialData={activeMinute}
            onSave={handleSaveMinute}
            onToast={showToast}
            readOnly={!isSuperAdmin && activeMinute && activeMinute.id ? true : diaryReadOnly}
            onEnableEdit={() => setDiaryReadOnly(false)}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {currentTab === 'settings' && (
          <div className="container-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="tabs" style={{ marginBottom: '10px' }}>
              <div 
                className={`tab ${settingsSubTab === 'project' ? 'active' : ''}`}
                onClick={() => setSettingsSubTab('project')}
              >
                Cấu hình Dự án
              </div>
              <div 
                className={`tab ${settingsSubTab === 'user' ? 'active' : ''}`}
                onClick={() => setSettingsSubTab('user')}
              >
                Hồ sơ Kỹ sư & Cấu hình AI
              </div>
              {isSuperAdmin && (
                <div 
                  className={`tab ${settingsSubTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('admin')}
                >
                  Quản trị Admin
                </div>
              )}
            </div>
            
            {settingsSubTab === 'project' && (
              <ProjectSettings
                user={user}
                activeProjectId={activeProjectId}
                setActiveProjectId={setActiveProjectId}
                onToast={showToast}
                equipmentMaster={equipmentMaster}
                onSaveEquipmentMaster={saveEquipmentMaster}
                materialMaster={materialMaster}
                onSaveMaterialMaster={saveMaterialMaster}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            
            {settingsSubTab === 'user' && (
              <UserSettings
                user={user}
                onToast={showToast}
              />
            )}

            {settingsSubTab === 'admin' && isSuperAdmin && (
              <AdminPanel
                user={user}
                projects={projects}
                diaries={diaries}
                minutes={minutes}
                members={members}
                onCreateMember={handleCreateMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                onChangePassword={handleChangePassword}
              />
            )}
          </div>
        )}
      </div>

      {/* PWA Installation Banner */}
      {showInstallBanner && (
        <div className="pwa-install-banner glass-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>📲</span>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Cài đặt Ứng dụng Nhật ký thi công
                </h4>
                <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
                  {isIOSDevice ? (
                    <span>Bấm vào biểu tượng <strong>Chia sẻ (Share)</strong> trên Safari và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong> để sử dụng ngoài công trường.</span>
                  ) : (
                    <span>Cài đặt ứng dụng lên màn hình chính để truy cập nhanh và làm việc ngoại tuyến ổn định.</span>
                  )}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
              {!isIOSDevice && (
                <button 
                  onClick={handleInstallPWA} 
                  className="btn btn-accent btn-sm"
                  style={{ minHeight: '34px', fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  Cài đặt
                </button>
              )}
              <button 
                onClick={handleDismissPWA} 
                className="btn btn-secondary btn-sm"
                style={{ 
                  minHeight: '34px', 
                  fontSize: '0.78rem', 
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                {isIOSDevice ? 'Đã hiểu' : 'Để sau'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
