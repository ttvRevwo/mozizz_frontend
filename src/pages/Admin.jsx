import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import '../App.css';

const UsersComponent = ({ users }) => {
    return ( 
        <ol className="list-group list-group-numbered">
            {users.map((user) => (
                <li key={user.userId} className="list-group-item d-flex justify-content-between align-items-start" style={{background: '#3A3A3A', color: '#E0E0E0', borderColor: '#c79c0f', marginBottom: '10px'}}>
                    <div className="ms-2 me-auto text-start">
                        <div className="fw-bold" style={{color: '#c79c0f'}}>
                            {user.name || user.username}
                        </div>
                        <span style={{fontSize: '0.9rem'}}>Email: {user.email}</span>
                    </div>
                    
                    <Link to={`/user/${user.userId}`}>
                        <button className="nav-button" style={{padding: '5px 10px', fontSize: '0.8rem'}}>
                            Részletek
                        </button>
                    </Link>
                </li>
            ))}
        </ol>
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
        return <div className="spinner-border text-danger m-5">Betöltés...</div>; 
    }
        
    if(!users.length) { 
        return (
            <div className="container">
                <h3 className="m-4">Felhasználók listája</h3>
                <div className="alert alert-info">Nincs megjeleníthető elem.</div>
            </div>
        );
    }
    
    return(
        <div className="container">
            <div className="row m-5 p-5 border" style={{backgroundColor: '#1a0606', color: 'white'}}>
                <h3 className="mb-4" style={{color: '#c79c0f'}}>Felhasználók listája ({users.length} db)</h3>
                <UsersComponent users={users} />
            </div>
        </div>
    );
};

function Admin() {
  return (
    <div className="app-container" style={{flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '50px'}}>
       
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