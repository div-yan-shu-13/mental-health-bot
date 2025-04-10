import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import '../styles/Profile.css';

// Password update schema
const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Required'),
});

// Profile info schema
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
});

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  if (!user) {
    return (
      <Layout>
        <div className="loading">Loading profile...</div>
      </Layout>
    );
  }

  // Handle profile info update
  const handleUpdateProfile = async (values: { name: string }) => {
    try {
      await updateUser({ name: values.name });
      setUpdateSuccess('Profile updated successfully!');
      setUpdateError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (err) {
      setUpdateError('Failed to update profile');
      setUpdateSuccess(null);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (values: { 
    currentPassword: string; 
    newPassword: string; 
  }) => {
    try {
      // In a real app, you would call an API endpoint to verify the current password
      // and update to the new password. For this example, we'll simulate that.
      setUpdateSuccess('Password updated successfully!');
      setUpdateError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (err) {
      setUpdateError('Failed to update password');
      setUpdateSuccess(null);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      // In a real app, you would call an API endpoint to delete the user's account
      // For this example, we'll just log out the user
      alert('Account deletion would happen here. Logging out instead for this demo.');
      logout();
    }
  };

  return (
    <Layout>
      <div className="profile-container">
        <h1>Your Profile</h1>
        
        {/* Success and error messages */}
        {updateSuccess && <div className="success-message">{updateSuccess}</div>}
        {updateError && <div className="error-message">{updateError}</div>}
        
        <div className="profile-content">
          {/* Profile sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar">
              {user.name.substring(0, 1).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p className="join-date">
                Joined {format(new Date(user.created_at), 'MMMM yyyy')}
              </p>
            </div>
            
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">{user.current_streak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{user.best_streak}</div>
                <div className="stat-label">Best Streak</div>
              </div>
            </div>
            
            <div className="profile-nav">
              <button 
                className={activeTab === 'info' ? 'active' : ''} 
                onClick={() => setActiveTab('info')}
              >
                Personal Information
              </button>
              <button 
                className={activeTab === 'password' ? 'active' : ''} 
                onClick={() => setActiveTab('password')}
              >
                Change Password
              </button>
              <button 
                className={activeTab === 'privacy' ? 'active' : ''} 
                onClick={() => setActiveTab('privacy')}
              >
                Privacy & Data
              </button>
            </div>
          </div>
          
          {/* Profile main content */}
          <div className="profile-main">
            {/* Personal Information Tab */}
            {activeTab === 'info' && (
              <div className="profile-section">
                <h2>Personal Information</h2>
                <Formik
                  initialValues={{ name: user.name }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleUpdateProfile}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <Field type="text" name="name" className="form-control" />
                        <ErrorMessage name="name" component="div" className="error" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="field-static">{user.email}</div>
                        <p className="field-note">Email cannot be changed</p>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Update Profile'}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
            
            {/* Password Change Tab */}
            {activeTab === 'password' && (
              <div className="profile-section">
                <h2>Change Password</h2>
                <Formik
                  initialValues={{ 
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }}
                  validationSchema={PasswordSchema}
                  onSubmit={handleUpdatePassword}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <Field 
                          type="password" 
                          name="currentPassword" 
                          className="form-control" 
                        />
                        <ErrorMessage 
                          name="currentPassword" 
                          component="div" 
                          className="error" 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <Field 
                          type="password" 
                          name="newPassword" 
                          className="form-control" 
                        />
                        <ErrorMessage 
                          name="newPassword" 
                          component="div" 
                          className="error" 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <Field 
                          type="password" 
                          name="confirmPassword" 
                          className="form-control" 
                        />
                        <ErrorMessage 
                          name="confirmPassword" 
                          component="div" 
                          className="error" 
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
            
            {/* Privacy & Data Tab */}
            {activeTab === 'privacy' && (
              <div className="profile-section">
                <h2>Privacy & Data</h2>
                
                <div className="data-section">
                  <h3>Your Data</h3>
                  <p>
                    We store your mood entries, conversation history, and account information
                    to provide you with personalized support and insights.
                  </p>
                  
                  <div className="data-actions">
                    <button className="btn btn-secondary">
                      Download Your Data
                    </button>
                  </div>
                </div>
                
                <div className="data-section">
                  <h3>Delete Account</h3>
                  <p>
                    Deleting your account will permanently remove all your data from our system,
                    including your profile, mood entries, and conversation history.
                  </p>
                  
                  <div className="data-actions">
                    <button 
                      className="btn btn-danger" 
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
                
                <div className="data-section">
                  <h3>Privacy Policy</h3>
                  <p>
                    We take your privacy seriously. Please review our privacy policy to understand
                    how we handle your data.
                  </p>
                  
                  <div className="data-actions">
                    <a href="/privacy-policy" className="btn btn-link">
                      View Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
