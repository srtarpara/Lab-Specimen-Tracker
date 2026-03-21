import {useState, useEffect} from 'react';

function PatientList({onSelectPatient, refresh}){
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch("http://localhost:8000/patients")
        .then(response => response.json())
        .then(data => setPatients(data.patients))
    }, [refresh]);

    const filtered = patients.filter(p =>
        p[1].toLowerCase().includes(search.toLowerCase()) ||
        p[3].toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0, color: '#2c3e7a' }}>Patients</h2>
                <input
                    type="text"
                    placeholder="Search by name or MRN..."
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
                        <th>Date of Birth</th>
                        <th>MRN</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>No patients found</td></tr>
                    ) : (
                        filtered.map((patient) => (
                            <tr
                                key={patient[0]}
                                onClick={() => onSelectPatient(patient)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{patient[0]}</td>
                                <td>{patient[1]}</td>
                                <td>{patient[2]}</td>
                                <td>{patient[3]}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default PatientList;