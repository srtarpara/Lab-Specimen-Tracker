import { useState } from 'react';
import API_BASE from '../api';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleLogin() {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            setLoading(false);
            if (data.error) {
                setError(data.error);
            } else {
                onLogin(data.user);
            }
        })
        .catch(() => {
            setLoading(false);
            setError('Something went wrong, please try again');
        })
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f4f6f9'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{
                    color: '#2c3e7a',
                    textAlign: 'center',
                    marginBottom: '8px'
                }}>
                    Lab Specimen Tracker
                </h1>
                <p style={{
                    textAlign: 'center',
                    color: '#888',
                    marginBottom: '30px'
                }}>
                    Sign in to your account
                </p>

                {error && (
                    <p style={{
                        color: 'red',
                        backgroundColor: '#fff0f0',
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </p>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        marginBottom: '12px',
                        boxSizing: 'border-box'
                    }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        marginBottom: '20px',
                        boxSizing: 'border-box'
                    }}
                />
                <button
    onClick={handleLogin}
    disabled={loading}
    style={{
        width: '100%',
        padding: '12px',
        backgroundColor: loading ? '#999' : '#2c3e7a',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer'
    }}
>
    {loading ? 'Signing in...' : 'Sign In'}
</button>

                <div style={{
                    marginTop: '24px',
                    padding: '12px',
                    backgroundColor: '#f4f6f9',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#666'
                }}>
                    <p style={{ margin: '0 0 6px 0' }}><strong>Test Accounts:</strong></p>
                    <p style={{ margin: '2px 0' }}>alice@hospital.com — Nurse</p>
                    <p style={{ margin: '2px 0' }}>bob@hospital.com — Lab Tech</p>
                    <p style={{ margin: '2px 0' }}>carol@hospital.com — Pathologist</p>
                    <p style={{ margin: '6px 0 0 0' }}>Password: <strong>password123</strong></p>
                </div>
            </div>
        </div>
    );
}

export default Login;