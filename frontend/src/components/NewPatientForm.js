import { useState } from 'react';
import API_BASE from '../api';

function NewPatientForm({ onPatientCreated }) {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [mrn, setMrn] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function handleSubmit() {
        if (!name || !dob || !mrn) {
            setError('Please fill in all fields');
            setSuccess('');
            return;
        }

        fetch(`${API_BASE}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                date_of_birth: dob,
                medical_record_number: mrn
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
                setSuccess('');
            } else {
                setName('');
                setDob('');
                setMrn('');
                setError('');
                setSuccess('Patient created successfully!');
                onPatientCreated();
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
            <h2>Add New Patient</h2>

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
                    type="date"
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                />
                <input
                    type="text"
                    placeholder="MRN (e.g. MRN004)"
                    value={mrn}
                    onChange={e => setMrn(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        flex: '1',
                        minWidth: '150px'
                    }}
                />
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
                    Add Patient
                </button>
            </div>
        </div>
    );
}

export default NewPatientForm;