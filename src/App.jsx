import React, { useState, useEffect } from 'react';
import { getUsers, getWords, updateUserScore } from './queries';
import './App.css';

const CARDS_PER_LESSON = 6;
const TOTAL_LESSONS = 3;
const SCORE_INCREMENT = 3;
const SCORE_DECREMENT = 1;

function App() {
  // data states
  const [users, setUsers] = useState(null);
  const [words, setWords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // ui user states
  const [currentUserId, setCurrentUserId] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  // ui cards states
  const [currentCards, setCurrentCards] = useState(null);
  const [activeCardInd, setActiveCardInd] = useState(null);
  const [wrongCardInd, setWrongCardInd] = useState(null);
  const [solvedCardIds, setSolvedCardIds] = useState([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [usersData, wordsData] = await Promise.all([
          getUsers(),
          // TO-DO get only an authenticated user's data
          // TO-DO move this request to Leaderboard component
          getWords(),
        ]);

        setUsers(usersData);
        setWords(wordsData);

        // init user 0 game
        // TO-DO use authenticated user
        const user = usersData[0];
        initUserGame(user, wordsData);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  function initUserGame(user, words) {
    setCurrentUserId(user.id);
    setCurrentScore(user.current_score);
    setCurrentLesson(user.current_lesson);
    setCurrentCards(() =>
      getShuffledWordsForLesson(words, user.current_lesson),
    );
  }

  function changeLesson(newLesson) {
    if (newLesson === TOTAL_LESSONS) {
      setCurrentLesson(newLesson);
      return;
    }

    setTimeout(() => {
      setCurrentCards(() => getShuffledWordsForLesson(words, newLesson));
      setSolvedCardIds([]);
      setCurrentLesson(newLesson);
    }, 500);
  }

  function changeUser(userId) {
    const newUser = users.find((user) => user.id == userId);
    initUserGame(newUser, words);
    setSolvedCardIds([]);
    setWrongCardInd(null);
    setActiveCardInd(null);
  }

  function handleCardClick(clickedCard, cardInd) {
    if (activeCardInd === null && wrongCardInd === null) {
      // no card selected before
      setActiveCardInd(cardInd);
    } else if (activeCardInd === cardInd && wrongCardInd) {
      setWrongCardInd(null);
    } else if (wrongCardInd === cardInd) {
      // click to a 'wrong' card
      setWrongCardInd(null);
      setActiveCardInd(cardInd);
    } else {
      const currentCard = currentCards[activeCardInd];
      setWrongCardInd(null);

      if (currentCard.id === clickedCard.id) {
        if (clickedCard.word === currentCard.word) {
          // click to the same card
          setActiveCardInd(null);
        } else {
          // matched!
          if (solvedCardIds.length === CARDS_PER_LESSON - 1) {
            changeLesson(currentLesson + 1);
          }
          setCurrentScore((score) => score + SCORE_INCREMENT);
          setSolvedCardIds((state) => [...state, clickedCard.id]);
          setActiveCardInd(null);
          setWrongCardInd(null);
        }
      } else {
        if (currentCard.word) {
          if (clickedCard.img) {
            setCurrentScore((score) => score - SCORE_DECREMENT);
            setWrongCardInd(cardInd);
          }
          if (clickedCard.word) setActiveCardInd(cardInd);
        }

        if (currentCard.img) {
          if (clickedCard.img) setActiveCardInd(cardInd);
          if (clickedCard.word) {
            setCurrentScore((score) => score - SCORE_DECREMENT);
            setWrongCardInd(cardInd);
          }
        }
      }
    }
  }

  if (isLoading) return '...Loading';
  if (!users || !words) return '...Something Went Wrong';

  const currentUser = users.find((user) => user.id == currentUserId);

  return (
    <div className='wrap'>
      <ChangeUser
        users={users}
        currentUser={currentUser}
        onChangeUser={changeUser}
      />
      <div>
        <h2>Current User: {currentUser.username}</h2>
        <h3>Score: {currentScore}</h3>

        <div style={{ margin: '10px 0' }}>
          Progress: Lesson {Math.min(currentLesson + 1, TOTAL_LESSONS)} / 3
          <ProgressBar currentLesson={currentLesson} total={TOTAL_LESSONS} />
        </div>

        <div className='card-grid'>
          {currentCards?.map((card, ind) => {
            let classString = 'card';
            if (card.word) classString += ' word';
            if (card.img) classString += ' image';
            if (activeCardInd === ind) classString += ' active';
            if (wrongCardInd === ind) classString += ' wrong';
            if (solvedCardIds.includes(card.id)) classString += ' matched';

            return (
              <div
                key={ind}
                className={classString}
                onClick={() => handleCardClick(card, ind)}
              >
                <div>{card.word || card.img}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Leaderboard users={users} />
    </div>
  );
}

function ProgressBar({ currentLesson, total }) {
  return (
    <div
      style={{
        background: '#eee',
        height: '10px',
        width: '100%',
        marginTop: '5px',
      }}
    >
      <div
        style={{
          background: '#4caf50',
          height: '10px',
          width: `${(currentLesson / total) * 100}%`,
          transition: 'width 0.5s',
        }}
      ></div>
    </div>
  );
}

function Leaderboard({ users }) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '12px',
        padding: '16px',
        background: '#fafafa',
      }}
    >
      <h3>Leaderboard</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {users.map((user) => (
          <li
            key={user.username}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{user.username}</span>
            <span>{user.current_score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChangeUser({ users, currentUser, onChangeUser }) {
  if (!users) return;

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '12px',
        background: '#E7EDF5',
      }}
    >
      <label htmlFor='user-select' style={{ fontWeight: 'bold' }}>
        Select User:
      </label>
      <select
        value={currentUser.id}
        onChange={(e) => onChangeUser(e.target.value)}
        style={{
          marginLeft: '10px',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontSize: '16px',
          background: 'white',
        }}
      >
        {users.map((user) => (
          <option key={user.username} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
}

function getShuffledWordsForLesson(allWords, lessonNum) {
  const start = lessonNum * CARDS_PER_LESSON;
  const end = start + CARDS_PER_LESSON;
  const words = allWords.slice(start, end).sort(() => Math.random() - 0.5);

  const cards = [
    ...words.map(({ id, word }) => ({ id, word })),
    ...words.map(({ id, img }) => ({ id, img })),
  ].sort(() => Math.random() - 0.5);

  return cards;
}

export default App;
