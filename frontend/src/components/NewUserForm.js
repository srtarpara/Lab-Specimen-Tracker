import { useState } from 'react';
import API_BASE from '../api';

function NewUserForm({ onUserCreated }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    function handleSubmit() {
        if (!name || !email || !password || !role) {
            setError('Please fill in all fields');
            setSuccess('');
            return;
        }

        fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: role
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
                setSuccess('');
            } else {
                setName('');
                setEmail('');
                setPassword('');
                setRole('');
                setError('');
                setSuccess('User created successfully!');
                onUserCreated();
            }
        })
    }

    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        }}>
            <h2>Add New User</h2>

            {error && (
                <p style={{
                    color: 'red',
                    backgroundColor: '#fff0f0',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '14px'
                }}>
                    {error}
                </p>
            )}

            {success && (
                <p style={{
                    color: '#2e7d32',
                    backgroundColor: '#e8f5e9',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '14px'
                }}>
                    {success}
                </p>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        flex: '1',
                        minWidth: '150px'
                    }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        flex: '1',
                        minWidth: '150px'
                    }}
                />
                <select value = {role} onChange={e => setRole(e.target.value)}
                    style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    minWidth: '150px'
                }}
                >
                    <option value="">Select role</option>
                    <option value="nurse">Nurse</option>
                    <option value="lab_tech">Lab Tech</option>
                    <option value="pathologist">Pathologist</option>
                    <option value="lis">LIS Admin</option>
                </select>
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#2c3e7a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Add User
                </button>
            </div>
        </div>
    );
}

export default NewUserForm;