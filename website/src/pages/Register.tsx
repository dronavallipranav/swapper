import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/AuthService';
import { useAuth } from "../contexts/AuthContext";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register(username, email, password, name).then((user) => {
        loginUser(user);
        navigate('/'); // Redirect to the home page after successful registration
    }).catch((e) => {
        if (e.response.data.error) {
            setError(e.response.data.error);
            return;
        }
        setError('An error occurred. Please try again.');
    })
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Create an account</h3>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block" htmlFor="name">Name</label>
            <input type="text" placeholder="Name" 
                   className="w-full px-4 py-2 mt-2 border rounded-md" 
                   id="name" 
                   value={name} 
                   onChange={(e) => setName(e.target.value)} 
                   required />
          </div>
          <div>
            <label className="block" htmlFor="name">Username</label>
            <input type="text" placeholder="Name" 
                   className="w-full px-4 py-2 mt-2 border rounded-md" 
                   id="name" 
                   value={username} 
                   onChange={(e) => setUsername(e.target.value)} 
                   required />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="email">Email</label>
            <input type="email" placeholder="Email" 
                   className="w-full px-4 py-2 mt-2 border rounded-md" 
                   id="email" 
                   value={email} 
                   onChange={(e) => setEmail(e.target.value)} 
                   required />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="password">Password</label>
            <input type="password" placeholder="Password" 
                   className="w-full px-4 py-2 mt-2 border rounded-md" 
                   id="password" 
                   value={password} 
                   onChange={(e) => setPassword(e.target.value)} 
                   required />
          </div>
          <div className="flex items-baseline justify-between">
            <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
