import { useState } from 'react';
import { login, register } from '../api/authApi';
import './AuthPage.css';

export default function AuthPage({ onLoginSuccess }) {
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!userName.trim()) {
            setMessage('Username is required.');
            return;
        }

        if (isRegisterMode && !email.trim()) {
            setMessage('Email is required.');
            return;
        }

        if (!password.trim()) {
            setMessage('Password is required.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            let user;

            if (isRegisterMode) {
                user = await register(userName.trim(), email.trim(), password);
            } else {
                user = await login(userName.trim(), password);
            }

            onLoginSuccess(user);
        } catch (error) {
            setMessage(error.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    }

    function switchMode() {
        setIsRegisterMode(!isRegisterMode);
        setMessage('');
        setPassword('');
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <p className="small-title">Appointments Manager</p>

                <h1>{isRegisterMode ? 'Create account' : 'Login'}</h1>

                <p className="auth-subtitle">
                    {isRegisterMode
                        ? 'Create a user account to manage your own appointments.'
                        : 'Login to see and manage your own appointments.'}
                </p>

                {message ? <p className="auth-message">{message}</p> : null}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Username
                        <input
                            value={userName}
                            onChange={(event) => setUserName(event.target.value)}
                            placeholder="mario"
                        />
                    </label>

                    {isRegisterMode ? (
                        <label>
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="mario@example.com"
                            />
                        </label>
                    ) : null}

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Password"
                        />
                    </label>

                    <button type="submit" className="button" disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : isRegisterMode
                                ? 'Register'
                                : 'Login'}
                    </button>
                </form>

                <button type="button" className="switch-button" onClick={switchMode}>
                    {isRegisterMode
                        ? 'Already have an account? Login'
                        : 'No account? Register'}
                </button>
            </section>
        </main>
    );
}