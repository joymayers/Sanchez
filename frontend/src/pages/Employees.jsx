import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { employeeAPI, departmentAPI } from '../services/api';
import '../styles/EmployeesPage.css';

export default function Employees() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    hire_date: '',
    manager_id: '',
  });

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Filter employees when search term or department changes
  useEffect(() => {
    filterEmployees();
  }, [searchTerm, selectedDepartment, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      const data = response.data?.data || response.data || [];
      setEmployees(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      const data = response.data?.data || response.data || [];
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.department_id.toString() === selectedDepartment);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department_id: '',
      position: '',
      hire_date: '',
      manager_id: '',
    });
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      department_id: employee.department_id,
      position: employee.position || '',
      hire_date: employee.hire_date || '',
      manager_id: employee.manager_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        setEmployees(employees.filter(emp => emp.id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete employee');
        console.error(err);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await employeeAPI.update(editingId, formData);
      } else {
        await employeeAPI.create(formData);
      }
      setShowForm(false);
      fetchEmployees();
      setError('');
    } catch (err) {
      setError('Failed to save employee');
      console.error(err);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  if (!user) {
    return null;
  }

  return (
    <div className="employees-page">
      <header className="employees-header">
        <div className="header-content">
          <h1>Employee Management</h1>
          <div className="user-info">
            <span>{user.first_name} {user.last_name}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="employees-main">
        {error && <div className="error-message">{error}</div>}

        <div className="employees-toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="department-filter"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {user.role === 'HR_ADMIN' && (
            <button className="btn-primary" onClick={handleAddNew}>
              + Add Employee
            </button>
          )}
        </div>

        {showForm && (
          <div className="form-modal">
            <div className="form-container">
              <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleFormChange}
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleFormChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="position"
                    placeholder="Position"
                    value={formData.position}
                    onChange={handleFormChange}
                  />
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleFormChange}
                  />
                  <input
                    type="number"
                    name="manager_id"
                    placeholder="Manager ID"
                    value={formData.manager_id}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : (
          <>
            <div className="table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Hire Date</th>
                    {user.role === 'HR_ADMIN' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map(employee => {
                      const dept = departments.find(d => d.id === employee.department_id);
                      return (
                        <tr key={employee.id}>
                          <td>{employee.first_name} {employee.last_name}</td>
                          <td>{employee.email}</td>
                          <td>{dept ? dept.name : 'N/A'}</td>
                          <td>{employee.position || '-'}</td>
                          <td>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}</td>
                          {user.role === 'HR_ADMIN' && (
                            <td>
                              <button
                                className="btn-edit"
                                onClick={() => handleEdit(employee)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(employee.id)}
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={user.role === 'HR_ADMIN' ? 6 : 5} className="no-data">
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
