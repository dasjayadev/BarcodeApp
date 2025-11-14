import React, { useState, useEffect } from "react";
import DashboardNav from "../../components/DashboardNav";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/api";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import ErrorMessage from "../../components/Common/Error/ErrorMessage";
import SuccessMessage from "../../components/Common/Success/SuccessMessage";
import { SuccessToast, ErrorToast } from "../../components/Common/Toast/Toast";

const Settings = () => {
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setProfile((prev) => ({
        ...prev,
        name: currentUser.name || "",
        email: currentUser.email || "",
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!profile.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email)) {
      setError("Valid email is required");
      return;
    }

    if (profile.password && profile.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (profile.password && profile.password !== profile.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Create update object (only include password if provided)
      const updateData = {
        name: profile.name,
        email: profile.email,
      };

      if (profile.password) {
        updateData.password = profile.password;
      }
      await updateUser(currentUser.id, updateData);
      setSuccess("Profile updated successfully");
      SuccessToast("Profile updated successfully");

      // Clear password fields after successful update
      setProfile((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
      ErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          backgroundColor: "#f9fafb",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 2 : 4,
        }}
      >
        <div className='container mx-auto p-4'>
          {/* <DashboardNav /> */}
          <h1 className='text-3xl font-bold mb-4'>Settings</h1>

          <ErrorMessage 
            message={error} 
            onDismiss={() => setError('')} 
            className="max-w-md mx-auto"
          />

          <SuccessMessage 
            message={success} 
            onDismiss={() => setSuccess('')} 
            className="max-w-md mx-auto"
          />

          <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
            <div className='mb-4'>
              <label className='block text-gray-700'>Name</label>
              <input
                type='text'
                name='name'
                value={profile.name}
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
                value={profile.email}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded'
                required
              />
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700'>
                Password (leave blank to keep current)
              </label>
              <input
                type='password'
                name='password'
                value={profile.password}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700'>Confirm Password</label>
              <input
                type='password'
                name='confirmPassword'
                value={profile.confirmPassword}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded'
              />
            </div>
            <div className='mb-4'>
              <button
                type='submit'
                className='w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition'
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </DashboardLayout>
  );
};

export default Settings;
