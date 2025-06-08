import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

/// GET

const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, current_lesson, current_score')
      .order('username');

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

const getWords = async () => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('id, word, translation, img');

    if (error) {
      console.error(error);
      throw new Error('Words could not be loaded');
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch words:', err);
    throw err;
  }
};

const updateUserScore = async (username, score) => {
  try {
    const { data, error } = await supabase
      .from('words')
      .update({current_score: score})
      .eq('username', username)
      .select();

    if (error) {
      console.error(error);
      throw new Error('Words could not be loaded');
    }

    return data;
  } catch (err) {
    console.error('Failed to update score:', err);
    throw err;
  }
};

const updateLesson = async (username, lesson) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({current_lesson: lesson})
      .eq('username', username)
      .select();

    if (error) {
      console.error(error);
      throw new Error('Words could not be loaded');
    }

    return data;
  } catch (err) {
    console.error('Failed to update score:', err);
    throw err;
  }
};

export {getUsers, getWords, updateUserScore, updateLesson};