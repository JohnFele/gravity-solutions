import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiFilter,
  FiChevronUp,
  FiChevronDown,
  FiEye,
  FiUser,
  FiUserPlus,
  FiRotateCcw,
  FiTrash,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import Sidebar from '../components/dashboard/sidebar/Sidebar';
import Header from '../components/dashboard/header/Header';
import ViewUserModal from '../components/modals/ViewUserModal';
import SuperUserModal from '../components/modals/SuperUserModal';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUserRole, softDeleteUser, restoreUser } from '../api/admin';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const UserManagement = () => {
  const { showAlert } = useAlert();
  const { profileData: user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewUserModal, setViewUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'active'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'firstName',
    direction: 'ascending'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const isSuperUser = String(user?.email || '').toLowerCase() === 'johnfele86@gmail.com';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const includeDeleted = filters.status === 'deleted' || debouncedSearchTerm.length > 0;
      
      const response = await getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
        role: filters.role !== 'all' ? filters.role : 'all',
        status: filters.status,
        sort: sortConfig.key,
        order: sortConfig.direction === 'ascending' ? 1 : -1,
        includeDeleted: includeDeleted ? 'true' : 'false',
      });
      
      setUsers(response.data);
      setPagination(prev => ({
        ...prev,
        pages: response.pagination.pages,
        total: response.pagination.total
      }));
    } catch (error) {
      showAlert('Failed to load users', { type: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters, sortConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, filters, sortConfig]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const requestSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      showAlert(`User role updated to ${newRole}`, { type: 'success' });
    } catch (error) {
      showAlert('Failed to update user role', { type: 'error' });
      console.error(error);
    }
  };

  const showDeleteUserConfirmation = (userId, isDeleted) => {
    if (isDeleted) {
      showAlert('Are you sure you want to restore this user account?', {
        type: 'warning',
        actionText: 'Restore',
        onAction: () => toggleDelete(userId, isDeleted),
        duration: 5000,
        position: 'top-center'
      });
    } else {
      showAlert('Are you sure you want to delete this user account?', {
        type: 'warning',
        actionText: 'Delete',
        onAction: () => toggleDelete(userId, isDeleted),
        duration: 5000,
        position: 'top-center'
      });
    }
  };

  const showRoleChangeConfirmation = (userId, newRole) => {
    showAlert(`Are you sure you want to change this user's role to ${newRole}?`, {
      type: 'warning',
      actionText: 'Change Role',
      onAction: () => handleRoleChange(userId, newRole),
      duration: 5000,
      position: 'top-center'
    });
  };

  const toggleDelete = async (userId, isDeleted) => {
    if (isDeleted) {
      try {
        await restoreUser(userId);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, deleted: false } : user
        ));
        showAlert('User restored successfully', { type: 'success' });
      } catch (error) {
        showAlert('Failed to restore user', { type: 'error' });
        console.error(error);
      }
    } else {
      try {
        await softDeleteUser(userId);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, deleted: true } : user
        ));
        showAlert('User deleted successfully', { type: 'success' });
      } catch (error) {
        showAlert('Failed to delete user', { type: 'error' });
        console.error(error);
      }
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { color: 'bg-purple-500/20 text-purple-400', label: 'Admin' },
      ulinker: { color: 'bg-blue-500/20 text-blue-400', label: 'Ulinker' },
      teacher: { color: 'bg-green-500/20 text-green-400', label: 'Teacher' },
      user: { color: 'bg-gray-500/20 text-gray-400', label: 'User' }
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roles[role]?.color || 'bg-gray-500/20 text-gray-400'}`}>
        {roles[role]?.label || role}
      </span>
    );
  };

  const getStatusBadge = (deleted, verified) => {
    if (deleted) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          Deleted
        </span>
      );
    }
    
    return verified ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        Verified
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-yellow-400">
        Unverified
      </span>
    );
  };

  const handleViewUserDetails = (userId) => {
    try {
      setViewUserModal(true);
      setSelectedUserId(userId);
    } catch (error) {
      console.error(error);
    }
  }

  const handleRowClick = (userId, event) => {
    // Prevent opening modal if user clicked on action buttons
    if (event.target.closest('button') || event.target.closest('a')) {
      return;
    }
    handleViewUserDetails(userId);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-1">
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-2 right-4 z-50 md:hidden bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl text-white shadow-lg"
        >
          {mobileMenuOpen ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </button>
      )}

      <Sidebar
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        customItems={null}
        userRole={user?.role}
      />

      <div className={`transition-all duration-300 ${
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
      }`}>
        <Header 
          searchQuery={searchTerm} 
          setSearchQuery={setSearchTerm}
          searchPlaceholder="Search users..."
        />
      
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden m-2 md:m-4">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                User Management
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-1.5 w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={filters.role}
                      onChange={(e) => setFilters({...filters, role: e.target.value})}
                      className="appearance-none bg-slate-700/50 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Ulinker">Ulinker</option>
                      <option value="Teacher">Teacher</option>
                      <option value="user">User</option>
                    </select>
                    <FiFilter className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="appearance-none bg-slate-700/50 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="active">Active Users</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                      <option value="deleted">Deleted</option>
                    </select>
                    <FiFilter className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('firstName')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortConfig.key === 'firstName' && (
                          sortConfig.direction === 'ascending' ? 
                            <FiChevronUp className="ml-1" /> : 
                            <FiChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hidden sm:table-cell"
                      onClick={() => requestSort('email')}
                    >
                      <div className="flex items-start text-left"> 
                        Email
                        {sortConfig.key === 'email' && (
                          sortConfig.direction === 'ascending' ? 
                            <FiChevronUp className="ml-1" /> : 
                            <FiChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                      onClick={() => requestSort('role')}
                    >
                      <div className="flex items-center">
                        Role
                        {sortConfig.key === 'role' && (
                          sortConfig.direction === 'ascending' ? 
                            <FiChevronUp className="ml-1" /> : 
                            <FiChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                      onClick={() => requestSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Joined
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'ascending' ? 
                            <FiChevronUp className="ml-1" /> : 
                            <FiChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-slate-400">
                        {filters.status === 'deleted' ? 'No deleted users found' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr 
                        key={user._id} 
                        className="hover:bg-slate-700/20 transition-colors cursor-pointer"
                        onClick={(e) => handleRowClick(user._id, e)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-700 flex items-center justify-center">
                              {user.profilePicture ? (
                                <img 
                                  className="h-8 w-8 md:h-10 md:w-10 rounded-full" 
                                  src={user.profilePicture} 
                                  alt="User profile" 
                                />
                              ) : (
                                <FiUser className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-slate-400">
                                @{user.userName}
                              </div>
                              <div className="text-xs text-slate-400 sm:hidden mt-1">
                                {user.email}
                              </div>
                              <div className="sm:hidden mt-1">
                                {getStatusBadge(user.deleted, user.isEmailVerified)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300 text-center hidden sm:table-cell">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center hidden md:table-cell">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 text-center hidden lg:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                          {getStatusBadge(user.deleted, user.isEmailVerified)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-1 md:space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleViewUserDetails(user._id)}
                              className="text-blue-400 hover:text-blue-300 p-1 rounded-md hover:bg-blue-500/10 transition-colors"
                              title="View Details"
                            >
                              <FiEye className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                            
                            {user.isEmailVerified && !user.deleted && (
                              <>
                                <div className="relative inline-block">
                                  <button
                                    className="text-purple-400 hover:text-purple-300 p-1 rounded-md hover:bg-purple-500/10 transition-colors peer"
                                    title="Change Role"
                                  >
                                    <FiUserPlus className="h-4 w-4 md:h-5 md:w-5" />
                                  </button>
                                  <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-slate-800 shadow-lg ring-1 ring-slate-700 focus:outline-none opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 hover:opacity-100 hover:visible">
                                    <div className="py-1">
                                      {['Admin', 'Ulinker', 'user'].map((role) => (
                                        user.role !== role && (
                                          <button
                                            key={role}
                                            onClick={() => showRoleChangeConfirmation(user._id, role)}
                                            className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                                          >
                                            {`Make ${role === 'user' ? 'Regular User' : role}`}
                                          </button>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            <button
                              onClick={() => showDeleteUserConfirmation(user._id, user.deleted)}
                              className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                              title={user.deleted ? "Restore User" : "Delete User"}
                            > 
                              {user.deleted ? (
                                <FiRotateCcw className="h-4 w-4 md:h-5 md:w-5 hover:cursor-pointer" /> 
                              ) : (
                                <FiTrash className="h-4 w-4 md:h-5 md:w-5 hover:cursor-pointer" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-slate-700/50 gap-4">
                <div className="text-sm text-slate-400 text-center sm:text-left">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> users
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-md bg-slate-700/50 border border-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let page;
                    if (pagination.pages <= 5) {
                      page = i + 1;
                    } else if (pagination.page <= 3) {
                      page = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      page = pagination.pages - 4 + i;
                    } else {
                      page = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          pagination.page === page
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-700/50 border border-slate-600 text-white hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                    <span className="px-2 text-slate-400">...</span>
                  )}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-md bg-slate-700/50 border border-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedUserId && viewUserModal && (
        isSuperUser ? (
          <SuperUserModal
            userId={selectedUserId}
            currentUserEmail={user?.email}
            onUserUpdated={fetchUsers}
            onClose={() => {
              setViewUserModal(false);
              setSelectedUserId(null);
            }}
          />
        ) : (
          <ViewUserModal 
            userId={selectedUserId} 
            onClose={() => {
              setViewUserModal(false);
              setSelectedUserId(null);
            }} 
          />
        )
      )}
    </div>
  );
};

export default UserManagement;
