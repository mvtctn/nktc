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
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

import { Menu, X, User } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'nktc', 'bbps', 'settings'
  const [settingsSubTab, setSettingsSubTab] = useState('project'); // 'project', 'user'
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toast Alert State
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // Data States
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  
  const [diaries, setDiaries] = useState([]);
  const [activeDiary, setActiveDiary] = useState(null);
  
  const [minutes, setMinutes] = useState([]);
  const [activeMinute, setActiveMinute] = useState(null);

  // Global shared equipment & material master lists
  const [equipmentMaster, setEquipmentMaster] = useState([]);
  const [materialMaster, setMaterialMaster] = useState([]);

  // Project detail modal
  const [viewingProject, setViewingProject] = useState(null);

  const isOffline = user && user.uid === 'offline_local_user';

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
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

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

  // 2. Data Listener (Projects, Diaries, Minutes)
  useEffect(() => {
    if (!user) return;
    
    // Load projects
    fetchProjects();

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
          setDiaries(list);
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
      setDiaries(JSON.parse(localDiaries));
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
        setDiaries(updatedDiaries);
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
      showToast('Lỗi khi lưu nhật ký thi công', true);
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
      showToast('Lỗi khi lưu biên bản hiện trường', true);
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
        setCurrentTab={setCurrentTab}
        theme={theme}
        toggleTheme={toggleTheme}
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        diaries={diaries}
        activeDiaryId={activeDiary ? activeDiary.id : null}
        onSelectDiary={(diary) => { setActiveDiary(diary); setMobileMenuOpen(false); }}
        onNewDiary={() => { setActiveDiary(null); setMobileMenuOpen(false); }}
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
            
            <div>
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

        {/* Tab switcher renderer */}
        {currentTab === 'dashboard' && (
          <Dashboard
            user={user}
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            diaries={diaries}
            minutes={minutes}
            setCurrentTab={setCurrentTab}
            setSettingsSubTab={setSettingsSubTab}
            onSelectDiary={setActiveDiary}
            onSelectMinute={setActiveMinute}
            onToast={showToast}
            onViewProject={setViewingProject}
          />
        )}

        {currentTab === 'nktc' && (
          <div className="container-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <NKTCParser 
              onParsed={(parsedData) => setActiveDiary(parsedData)} 
              onToast={showToast} 
              date={activeDiary ? activeDiary.ngay : ''}
              page={activeDiary ? activeDiary.trang : ''}
            />
            <NKTCForm
              user={user}
              project={activeProject}
              initialData={activeDiary}
              onSave={handleSaveDiary}
              onToast={showToast}
              diaries={diaries}
              equipmentMaster={equipmentMaster}
              materialMaster={materialMaster}
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
            </div>
            
            {settingsSubTab === 'project' ? (
              <ProjectSettings
                user={user}
                activeProjectId={activeProjectId}
                setActiveProjectId={setActiveProjectId}
                onToast={showToast}
                equipmentMaster={equipmentMaster}
                onSaveEquipmentMaster={saveEquipmentMaster}
                materialMaster={materialMaster}
                onSaveMaterialMaster={saveMaterialMaster}
              />
            ) : (
              <UserSettings
                user={user}
                onToast={showToast}
              />
            )}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {viewingProject && (
        <ProjectDetailModal
          project={viewingProject}
          diaries={diaries}
          minutes={minutes}
          onClose={() => setViewingProject(null)}
          onOpenDiary={(diary) => {
            setActiveDiary(diary);
            setActiveProjectId(diary.projectId);
            setCurrentTab('nktc');
          }}
          onOpenMinute={(minute) => {
            setActiveMinute(minute);
            setActiveProjectId(minute.projectId);
            setCurrentTab('bbps');
          }}
          onToast={showToast}
        />
      )}

    </div>
  );
}
