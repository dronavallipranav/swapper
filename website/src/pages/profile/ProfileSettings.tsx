import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Assuming this is where user info and update functions are stored
import { updateUser } from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const { user, loginUser } = useAuth(); // Assuming updateUser is a method to update user details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | File>();
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setProfileImage(user.profilePicture); 
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = {
      name,
      email,
      profileImage,
    };

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("name", user.name);

    if (user.profileImage) {
      formData.append("profilePicture", user.profileImage);
    }

    updateUser(formData)
      .then((u) => {
        setError("");
        loginUser(u);
        nav('/profile')
      })
      .catch((e) => {
        if (e.response.data.error) {
          setError(e.response.data.error);
          return;
        }
        setError("An error occurred. Please try again.");
      });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Profile Settings</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label" htmlFor="name">
            <span className="label-text">Name</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Name"
            className="input input-bordered"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            className="input input-bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="profileImage">
            <span className="label-text">Profile Image</span>
          </label>
          <input
            id="profileImage"
            type="file"
            className="input input-bordered"
            onChange={handleImageChange}
          />
        </div>
        <div className="form-control mt-6">
          <button type="submit" className="btn btn-primary">Update Profile</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
