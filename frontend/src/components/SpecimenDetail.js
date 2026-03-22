import {useState, useEffect} from 'react';
import API_BASE from '../api';

const STATUS_STEPS = ['Collected', 'Received', 'Processing', 'Resulted', 'Verified']

const statusColors = {
    'Collected': { background: '#e3f2fd', color: '#1565c0' },
    'Received': { background: '#fff3e0', color: '#e65100' },
    'Processing': { background: '#fff9c4', color: '#f57f17' },
    'Resulted': { background: '#e8f5e9', color: '#2e7d32' },
    'Verified': { background: '#f3e5f5', color: '#6a1b9a' },
};

function formatDate(dateString){
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function SpecimenDetail({specimenId, onBack, user}){
    const [specimen, setSpecimen] = useState(null);
    const [log, setLog] = useState([]);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchSpecimen();
        fetchLog();
    }, [specimenId]);

    function fetchSpecimen(){
        fetch(`${API_BASE}/specimens/${specimenId}`)
        .then(r => r.json())
        .then(data => setSpecimen(data.specimen));
    }

    function fetchLog(){
        fetch(`${API_BASE}/specimens/${specimenId}/log`)
        .then(r => r.json())
        .then(data => setLog(data.log));
    }

    function updateStatus(){
        if(!newStatus)
        {
            return;
        }

        fetch(`${API_BASE}/specimens/${specimenId}/status`,{
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({new_status: newStatus, updated_by: user.id})
        })
        .then(r => r.json())
        .then(() => {fetchSpecimen(); fetchLog(); setNewStatus('');});
    }

    if(!specimen)
    {
        return <p>Loading...</p>;
    }

    const currentStep = STATUS_STEPS.indexOf(specimen[3]);

    const statusTimes = {};
    log.forEach(entry => {
        if(!statusTimes[entry[2]])
        {
            statusTimes[entry[2]] = entry[4];
            statusTimes[entry[3]] = entry[4];
        }
    })


    return (
        <div>
            <button onClick={onBack} style={{
                marginBottom: '20px', padding: '8px 16px',
                backgroundColor: '#2c3e7a', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>
                ← Back to Specimens
            </button>

            {/* Header */}
            <div style={{
    background: 'white', padding: '20px', borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px', textAlign: "center",
}}>
    <div style={{ position: 'relative', marginBottom: '16px', textAlign: 'center' }}>
    <h2 style={{ margin: '0 0 4px 0', color: '#2c3e7a' }}>
        {specimen[2]} specimen — {specimen[1]}
    </h2>
    <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
        Specimen #{specimen[0]}
    </p>
    <span style={{
        ...statusColors[specimen[3]],
        padding: '4px 14px', borderRadius: '12px',
        fontSize: '13px', fontWeight: 'bold',
        position: 'absolute', top: '0', right: '0'
    }}>
        {specimen[3]}
    </span>
</div>

    {/* Detail Grid */}
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        borderTop: '1px solid #eee',
        paddingTop: '16px',
    }}>
        {[
        { label: 'Patient MRN', value: specimen[5] },
        { label: 'Specimen Type', value: specimen[2] },
        { label: 'Date Collected', value: formatDate(specimen[4]) }
    ].map(({ label, value }) => (
        <div key={label} style={{
            background: '#f9f9f9',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
        }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#2c3e7a' }}>
                {value}
            </p>
        </div>
    ))}
    </div>
</div>

            {/* Tracker */}
            <div style={{
                background: 'white', padding: '24px', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                    {STATUS_STEPS.map((step, index) => {
                        const isDone = index < currentStep || (index === currentStep && specimen[3] === 'Verified');
                        const isActive = index === currentStep && specimen[3] !== 'Verified';
                        const isFuture = index > currentStep;

                        return (
                            <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                {/* Connector line */}
                                {index < STATUS_STEPS.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '17px',
                                        left: 'calc(50% + 18px)',
                                        right: 'calc(-50% + 18px)',
                                        height: '2px',
                                        backgroundColor: isDone ? '#1D9E75' : '#e0e0e0',
                                        zIndex: 0
                                    }} />
                                )}

                                {/* Circle */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: '500', zIndex: 1,
                                    backgroundColor: isDone ? '#1D9E75' : isActive ? 'white' : '#f5f5f5',
                                    border: isDone ? '2px solid #1D9E75' : isActive ? '2px solid #185FA5' : '2px solid #e0e0e0',
                                    color: isDone ? 'white' : isActive ? '#185FA5' : '#aaa',
                                    boxShadow: isActive ? '0 0 0 4px rgba(24,95,165,0.12)' : 'none'
                                }}>
                                    {isDone ? '✓' : index + 1}
                                </div>

                                {/* Label */}
                                <div style={{
                                    fontSize: '12px', marginTop: '8px', textAlign: 'center',
                                    fontWeight: isActive ? '600' : '400',
                                    color: isActive ? '#2c3e7a' : isFuture ? '#aaa' : '#333'
                                }}>
                                    {step}
                                </div>

                                {/* Timestamp */}
                                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'center', minHeight: '16px' }}>
                                    {statusTimes[step] ? formatDate(statusTimes[step]) : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Audit Trail */}
            <div style={{
                background: 'white', padding: '20px', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#2c3e7a' }}>Audit trail</h3>
                {log.length === 0 ? (
                    <p style={{ color: '#888' }}>No status changes yet</p>
                ) : (
                    [...log].reverse().map((entry, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: '12px', alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: i < log.length - 1 ? '0.5px solid #eee' : 'none',
                            fontSize: '13px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000000', flexShrink: 0 }} />
                            <div style={{ color: '#888', minWidth: '130px' }}>{formatDate(entry[4])}</div>
                            <div>
                                <strong>{entry[1]}</strong> moved from{' '}
                                <span style={{ ...statusColors[entry[2]], padding: '2px 8px', borderRadius: '8px', fontSize: '12px' }}>{entry[2]}</span>
                                {' → '}
                                <span style={{ ...statusColors[entry[3]], padding: '2px 8px', borderRadius: '8px', fontSize: '12px' }}>{entry[3]}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Update Status */}
            <div style={{
                background: 'white', padding: '20px', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#2c3e7a' }}>Update status</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{
                        padding: '8px 12px', borderRadius: '6px',
                        border: '1px solid #ccc', fontSize: '14px'
                    }}>
                        <option value="">Select new status</option>
                        {STATUS_STEPS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button onClick={updateStatus} style={{
                        padding: '8px 16px', backgroundColor: '#2c3e7a',
                        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
                    }}>
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpecimenDetail;