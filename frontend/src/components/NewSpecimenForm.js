import {useState} from 'react';

function NewSpecimenForm({onSpecimenCreated}){
    const [patientId, setPatientId] = useState('');
    const [type, setType] = useState('');
    const [collectedBy, setCollectedBy] = useState('');

    function handleSubmit(){
        if(!patientId || !type || !collectedBy)
        {
            alert("Please fill in all fields");
            return;
        }

        fetch("http://localhost:8000/specimens", {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                patient_id: parseInt(patientId),
                type: type,
                collected_by: parseInt(collectedBy)
            })
        })
        .then(response => response.json())
        .then(() => {
            setPatientId('');
            setType('');
            setCollectedBy('');
            onSpecimenCreated();
        })
    }

    return(
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        }}>
            <h2>Log New Specimen</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                    type="number"
                    placeholder="Patient ID"
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                />
                <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                >
                    <option value="">Select type</option>
                    <option value="Blood">Blood</option>
                    <option value="Urine">Urine</option>
                    <option value="Tissue">Tissue</option>
                    <option value="Saliva">Saliva</option>
                </select>
                <input
                    type="number"
                    placeholder="Collected By (User ID)"
                    value={collectedBy}
                    onChange={e => setCollectedBy(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                />
                <button onClick={handleSubmit} style={{
                    padding: '8px 16px',
                    backgroundColor: '#2c3e7a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}>
                    Log Specimen
                </button>
            </div>
        </div>
    );
}

export default NewSpecimenForm;