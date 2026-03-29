import {useState, useEffect} from 'react';
import API_BASE from '../api';

function UserList({onSelectUser, refresh}){
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API_BASE}/users`)
        .then(response => response.json())
        .then(data => setUsers(data.users))
    }, [refresh]);

    const filtered = users.filter(p =>
        p[1].toLowerCase().includes(search.toLowerCase()) ||
        p[4].toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0, color: '#2c3e7a' }}>Users</h2>
                <input
                    type="text"
                    placeholder="Search by name or role..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '8px 12px', borderRadius: '6px',
                        border: '1px solid #ccc', fontSize: '14px',
                        width: '280px'
                    }}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>No users found</td></tr>
                    ) : (
                        filtered.map((users) => (
                            <tr
                                key={users[0]}
                                onClick={() => onSelectUser(users)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{users[0]}</td>
                                <td>{users[1]}</td>
                                <td>{users[2]}</td>
                                <td>{users[4]}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;