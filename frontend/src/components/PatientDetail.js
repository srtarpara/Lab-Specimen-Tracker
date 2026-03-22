import { useState, useEffect } from 'react';
import API_BASE from '../api';

function formatDate(dateString) {
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
};

function PatientDetail({ patient, onBack, onSelectSpecimen }) {
    const [specimens, setSpecimens] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/patients/${patient[0]}/specimens`)
            .then(response => response.json())
            .then(data => setSpecimens(data.specimens))
    }, [patient]);

    return (
        <div>
            <button onClick={onBack} style={{
                marginBottom: '20px',
                padding: '8px 16px',
                backgroundColor: '#2c3e7a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
            }}>
                ← Back to Patients
            </button>

            {/* Patient Info Card */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
            }}>
                <h2 style={{ color: '#2c3e7a', margin: '0 0 12px 0' }}>
                    {patient[1]}
                </h2>
                <p style={{ margin: '4px 0', color: '#555' }}>
                    <strong>Date of Birth:</strong> {patient[2]}
                </p>
                <p style={{ margin: '4px 0', color: '#555' }}>
                    <strong>MRN:</strong> {patient[3]}
                </p>
            </div>

            {/* Specimens Table */}
            <h3 style={{ color: '#2c3e7a' }}>Specimens</h3>
            {specimens.length === 0 ? (
                <p style={{ color: '#888' }}>No specimens found for this patient.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Collected At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specimens.map((specimen) => (
                            <tr
                                key={specimen[0]}
                                onClick={() => onSelectSpecimen(specimen[0])}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{specimen[0]}</td>
                                <td>{specimen[2]}</td>
                                <td>
                                    <span style={{
                                        ...statusColors[specimen[3]],
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: 'bold'
                                    }}>
                                        {specimen[3]}
                                    </span>
                                </td>
                                <td>{formatDate(specimen[4])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PatientDetail;