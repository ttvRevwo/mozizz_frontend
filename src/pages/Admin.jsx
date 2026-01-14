import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import '../App.css';

const UsersComponent = ({ users }) => {
    return (
        <div className="user-list-container">
            {users.map((user) => (
                <div key={user.userId} className="user-card">
                    <div className="user-info">
                        <div className="user-name">
                            {user.name || user.username}
                        </div>
                        <div className="user-email">
                            {user.email}
                        </div>
                    </div>
                    
                    <Link to={`/user/${user.userId}`} className="details-link">
                        <button className="details-button">
                            Részletek
                        </button>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5083/api/User/User')
        .then(response => response.json())
        .then(tartalom => {
            if(Array.isArray(tartalom)){
                setUsers(tartalom);
            } else if (tartalom && tartalom.data) {
                setUsers(Object.values(tartalom.data));
            } else {
                setUsers([]);
            }
        })
        .catch(error => console.log(error))
        .finally(() => setLoading(false));
    }, []);

    if(loading) { 
        return <div className="loading-text">Betöltés...</div>; 
    }
        
    if(!users.length) { 
        return (
            <div className="admin-panel">
                <h3 className="admin-title">Felhasználók listája</h3>
                <div className="empty-message">Nincs megjeleníthető elem.</div>
            </div>
        );
    }
    
    return(
        <div className="admin-panel">
            <h3 className="admin-title">Felhasználók listája ({users.length} db)</h3>
            <UsersComponent users={users} />
        </div>
    );
};

function Admin() {
  return (
    <div className="app-container admin-view">
       <Link to="/" className="back-to-home">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={20} height={20}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        Vissza a főoldalra
      </Link>
      
      <UsersList />
    </div>
  );
}

export default Admin;