import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from './api/authApi';
import AuthPage from './components/AuthPage';
import Home from './components/Home';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLoggedUser();
    }, []);

    async function checkLoggedUser() {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        try {
            await logout();
        } catch {
            // Even if logout request fails, we still clear the frontend state.
        }

        setUser(null);
    }

    if (loading) {
        return (
            <main className="page">
                <section className="card">
                    <h2>Loading...</h2>
                </section>
            </main>
        );
    }

    if (!user) {
        return <AuthPage onLoginSuccess={setUser} />;
    }

    return <Home user={user} onLogout={handleLogout} />;
}