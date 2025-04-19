import React, { useState, useEffect } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/api";
import DashboardNav from "../../components/DashboardNav";
import { Eye, EyeClosed } from "lucide-react";

const UserManagement = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isEditing) {
        const userData = { ...user };
        // Don't send password if it's empty (not being updated)
        if (!userData.password) delete userData.password;

        await updateUser(currentUserId, userData);
        setSuccess("User updated successfully");
      } else {
        await createUser(user);
        setSuccess("User created successfully");
      }

      // Reset form and refresh users list
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    setUser({
      name: user.name,
      email: user.email,
      password: "", // Don't set password for editing
      role: user.role,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        setSuccess("User deleted successfully");
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const resetForm = () => {
    setUser({
      name: "",
      email: "",
      password: "",
      role: "staff",
    });
    setIsEditing(false);
    setCurrentUserId(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='container mx-auto p-4'>
      <DashboardNav />
      <h1 className='text-3xl font-bold mb-4'>User Management</h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {success && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
          {success}
        </div>
      )}

      <div className='flex justify-center items-start gap-3'>
        <form onSubmit={handleSubmit} className='w-md mx-auto mb-8'>
          <div className='mb-4'>
            <label className='block text-gray-700'>Name</label>
            <input
              type='text'
              name='name'
              value={user.name}
              onChange={handleChange}
              className='w-full p-2 border border-gray-300 rounded'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700'>Email</label>
            <input
              type='email'
              name='email'
              value={user.email}
              onChange={handleChange}
              className='w-full p-2 border border-gray-300 rounded'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700'>
              Password {isEditing && "(leave blank to keep current)"}
            </label>
            <div className='relative'>
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                value={user.password}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded'
                required={!isEditing}
              />
              <button
                type='button'
                className='absolute right-2 top-1/2 transform -translate-y-1/2'
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <Eye /> : <EyeClosed />}
              </button>
            </div>
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700'>Role</label>
            <select
              name='role'
              value={user.role}
              onChange={handleChange}
              className='w-full p-2 border border-gray-300 rounded'
              required
            >
              <option value='staff'>Staff</option>
              <option value='manager'>Manager</option>
              <option value='owner'>Owner</option>
            </select>
          </div>
          <div className='flex space-x-4'>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              {isEditing ? "Update User" : "Add User"}
            </button>
            {isEditing && (
              <button
                type='button'
                onClick={resetForm}
                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className='mt-8 w-full'>
          <h2 className='text-2xl font-semibold mb-4'>Users List</h2>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full bg-white border border-gray-200'>
                <thead>
                  <tr>
                    <th className='py-2 px-4 border-b'>Name</th>
                    <th className='py-2 px-4 border-b'>Email</th>
                    <th className='py-2 px-4 border-b'>Role</th>
                    <th className='py-2 px-4 border-b'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id || user._id}>
                      <td className='py-2 px-4 border-b text-center'>{user.name}</td>
                      <td className='py-2 px-4 border-b text-center'>{user.email}</td>
                      <td className='py-2 px-4 border-b text-center'>{user.role}</td>
                      <td className='py-2 px-4 border-b text-center'>
                        <button
                          onClick={() => handleEdit(user)}
                          className='mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id || user._id)}
                          className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan='4' className='py-4 text-center'>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
