import { useEffect, useState } from "react";
import getUsers from './queries';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };

    loadUsers();

  }, []);

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.name}>{user.name}</li>
      ))}
    </ul>
  );
}

export default App;
