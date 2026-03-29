import NewUserForm from './NewUserForm';
import UserList from './UserList';
import { useState } from 'react';

function AdminPage() {
    //A refresh state.
    const [refresh, setRefresh] = useState(0);

    return(
        <div>

            <NewUserForm onUserCreated={() => setRefresh(r => r + 1)} />
            
            <UserList refresh = {refresh} />
        </div>
    );
}

export default AdminPage;