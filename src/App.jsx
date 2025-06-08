import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, screens, score')
          .order('name');

        if (error) {
          console.error(error);
          throw new Error('Users could not be loaded');
        }

        console.log("DATA: ", data);
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
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
