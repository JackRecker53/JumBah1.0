import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AuthForm.module.css'; // Create this file
import { useGame } from '../contexts/GameContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { completeQuest, completedQuests } = useGame();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if(email && password) {
            login({ email }); // Pass user data to login function
            if (!completedQuests.has('q1')) {
                completeQuest('q1');
            }
            navigate('/profile'); // Redirect to profile after login
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authForm}>
                <h2>Welcome Back!</h2>
                <p>Log in to access your adventure.</p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary">Log In</button>
                </form>
                <div className={styles.divider}>OR</div>
                <button className={styles.googleBtn}>
                    <FcGoogle size={24} />
                    <span>Sign In with Google</span>
                </button>
            </div>
        </div>
    );
};

export default Login;