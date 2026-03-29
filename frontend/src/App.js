import './App.css';
import PatientList from './components/PatientList';
import SpecimenList from './components/SpecimenList';
import SpecimenDetail from './components/SpecimenDetail';
import { useState } from 'react';
import NewSpecimenForm from './components/NewSpecimenForm';
import Login from './components/Login';
import PatientDetail from './components/PatientDetail';
import NewPatientForm from './components/NewPatientForm';
import AdminPage from './components/AdminPage';

function App() {
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("specimens");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRefresh, setPatientRefresh] = useState(0);

  function handleSelectSpecimen(specimenId) {
        setSelectedSpecimen(specimenId);
        setPage('specimens');
    }

  if(!user)
  {
    return <Login onLogin={setUser} />;
  }


  return (
        <div className="App">
            {/* Navbar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '3px solid #2c3e7a',
                paddingBottom: '10px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <h1 style={{ margin: 0, color: '#2c3e7a' }}>
                        Lab Specimen Tracker
                    </h1>
                    <nav style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => { setPage('specimens'); setSelectedSpecimen(null); }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: page === 'specimens' ? '#2c3e7a' : 'transparent',
                                color: page === 'specimens' ? 'white' : '#2c3e7a',
                                border: '2px solid #2c3e7a',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Specimens
                        </button>
                        <button
                            onClick={() => { setPage('patients'); setSelectedPatient(null); }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: page === 'patients' ? '#2c3e7a' : 'transparent',
                                color: page === 'patients' ? 'white' : '#2c3e7a',
                                border: '2px solid #2c3e7a',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Patients
                        </button>
                        {user.role === 'lis' && (
                            <button onClick= {() => setPage('admin')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: page === 'admin' ? '#2c3e7a' : 'transparent',
                                color: page === 'admin' ? 'white' : '#2c3e7a',
                                border: '2px solid #2c3e7a',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                            >
                                Admin
                            </button>
                        )}
                    </nav>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                        👤 {user.name} — <strong>{user.role}</strong>
                    </span>
                    <button
                        onClick={() => setUser(null)}
                        style={{
                            padding: '6px 14px',
                            backgroundColor: '#e53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Pages */}
            {page === 'patients' && (
    selectedPatient ? (
        <PatientDetail
            patient={selectedPatient}
            onBack={() => setSelectedPatient(null)}
            onSelectSpecimen={handleSelectSpecimen}
        />
    ) : (
        <>
            <NewPatientForm onPatientCreated={() => setPatientRefresh(r => r + 1)} />
            <PatientList
                onSelectPatient={setSelectedPatient}
                refresh={patientRefresh}
            />
        </>
    )
)}

            {page === 'specimens' && (
                selectedSpecimen ? (
                    <SpecimenDetail
                        specimenId={selectedSpecimen}
                        onBack={() => setSelectedSpecimen(null)}
                        user={user}
                    />
                ) : (
                    <>
                        <NewSpecimenForm onSpecimenCreated={() => setRefresh(r => r + 1)} />
                        <SpecimenList
                            onSelectSpecimen={setSelectedSpecimen}
                            refresh={refresh}
                        />
                    </>
                )
            )}

            {page === 'admin' && <AdminPage />}
        </div>
    );
}

export default App;