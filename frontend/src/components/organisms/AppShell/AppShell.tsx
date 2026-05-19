import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth';
import styles from './AppShell.module.css';

const AppShell = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>LIMS</div>
        <ul className={styles.nav}>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/samples" className={({ isActive }) => isActive ? styles.active : ''}>
              Samples
            </NavLink>
          </li>
          <li>
            <NavLink to="/containers" className={({ isActive }) => isActive ? styles.active : ''}>
              Containers
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventory" className={({ isActive }) => isActive ? styles.active : ''}>
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/experiments" className={({ isActive }) => isActive ? styles.active : ''}>
              Experiments
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? styles.active : ''}>
              Reports
            </NavLink>
          </li>
        </ul>
        <div className={styles.userArea}>
          <span className={styles.userName}>{user?.full_name}</span>
          <span className={styles.userRole}>{user?.role}</span>
          <button type="button" onClick={logout} className={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
