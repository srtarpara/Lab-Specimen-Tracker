import {useState, useEffect} from 'react';
import API_BASE from '../api';

function formatDate(dateString){
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


const statusColors = {
    'Collected': { background: '#e3f2fd', color: '#1565c0' },
    'Received': { background: '#fff3e0', color: '#e65100' },
    'Processing': { background: '#fff9c4', color: '#f57f17' },
    'Resulted': { background: '#e8f5e9', color: '#2e7d32' },
    'Verified': { background: '#f3e5f5', color: '#6a1b9a' },
}


function SpecimenList({onSelectSpecimen, refresh}){
    const [specimens, setSpecimens] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API_BASE}/specimens`)
        .then(response => response.json())
        .then(data => setSpecimens(data.specimens))
    }, [refresh]);
    
    const filtered = specimens.filter(s =>
        s[1].toLowerCase().includes(search.toLowerCase()) ||
        s[2].toLowerCase().includes(search.toLowerCase()) ||
        s[3].toLowerCase().includes(search.toLowerCase())
    );

    return (
<div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0, color: '#2c3e7a' }}>Active Specimens</h2>
                <input
                    type="text"
                    placeholder="Search by patient, type or status..."
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
                        <th>Patient</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Collected At</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>No specimens found</td></tr>
                    ) : (
                        filtered.map((specimen) => (
                            <tr key={specimen[0]} onClick={() => onSelectSpecimen(specimen[0])}>
                                <td>{specimen[0]}</td>
                                <td>{specimen[1]}</td>
                                <td>{specimen[2]}</td>
                                <td>
                                    <span style={{
                                        ...statusColors[specimen[3]],
                                        padding: '4px 12px', borderRadius: '12px',
                                        fontSize: '13px', fontWeight: 'bold'
                                    }}>
                                        {specimen[3]}
                                    </span>
                                </td>
                                <td>{formatDate(specimen[4])}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SpecimenList;