import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

/// GET

const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, screens, score')
      .order('name');

    if (error) {
      console.error(error);
      throw new Error('Users could not be loaded');
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch users:', err);
    throw err;
  }
};

export default getUsers;
