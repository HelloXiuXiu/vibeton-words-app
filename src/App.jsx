import React, { useState, useEffect } from "react";
import "./App.css";
import {getUsers, getWords, updateUserScore} from './queries';

const usersData = [
  {
    username: "somename",
    current_score: 0,
    current_lesson: 1,
  },
  {
    username: "somename2",
    current_score: 0,
    current_lesson: 1,
  },
];

const wordsData = [
  { word: "telo", img: "https://dfdfdfd1.com" },
  { word: "head", img: "https://dfdfdfd2.com" },
  { word: "hand", img: "https://dfdfdfd3.com" },
  { word: "leg", img: "https://dfdfdfd4.com" },
  { word: "eye", img: "https://dfdfdfd5.com" },
  { word: "ear", img: "https://dfdfdfd6.com" },
  { word: "nose", img: "https://dfdfdfd7.com" },
  { word: "mouth", img: "https://dfdfdfd8.com" },
  { word: "hair", img: "https://dfdfdfd9.com" },
  { word: "foot", img: "https://dfdfdfd10.com" },
  { word: "finger", img: "https://dfdfdfd11.com" },
  { word: "toe", img: "https://dfdfdfd12.com" },
  { word: "knee", img: "https://dfdfdfd13.com" },
  { word: "elbow", img: "https://dfdfdfd14.com" },
  { word: "shoulder", img: "https://dfdfdfd15.com" },
  { word: "back", img: "https://dfdfdfd16.com" },
  { word: "chest", img: "https://dfdfdfd17.com" },
  { word: "stomach", img: "https://dfdfdfd18.com" },
];


function App() {
  const [users, setUsers] = useState(null);
  const [words, setWords] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };
    const loadWords = async () => {
    const data = await getWords();
    setWords(data);
    };
     loadUsers();
    loadWords();

  }, []);
  console.log('usershere: ', users)
  console.log('wpoe: ', words)

  let initialUser = users ? users[0] : [];

  const [currentUsername, setCurrentUsername] = useState(initialUser.username);
  const [currentScore, setCurrentScore] = useState(initialUser.current_score);
  const [currentLesson, setCurrentLesson] = useState(
    initialUser.current_lesson,
  );

  const [shuffledCards, setShuffledCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [wrongCard, setWrongCard] = useState("");
  const [selectedCardData, setSelectedCardData] = useState("");



  useEffect(() => {
    if (!users) return
    const currentUser = users.find((u) => u.username === currentUsername);

    setCurrentScore(currentUser.current_score);
    setCurrentLesson(currentUser.current_lesson);
    prepareLessonCards(currentUser.current_lesson);
    setMatchedCards([]);
    setWrongCard("");
    setSelectedCardData("");
  }, [currentUsername]);

  const prepareLessonCards = (lesson) => {
    const startIndex = (lesson - 1) * 6;
    const lessonWords = words.slice(startIndex, startIndex + 6);

    const wordCards = lessonWords.map((w) => ({
      type: "word",
      content: w.word,
    }));
    const imageCards = lessonWords.map((w) => ({
      type: "img",
      content: w.img,
    }));

    const allCards = [...wordCards, ...imageCards];
    const shuffled = allCards.sort(() => 0.5 - Math.random());
    setShuffledCards(shuffled);
  };

  const handleCardClick = (card) => {
    if (matchedCards.includes(card.content)) return; // Matched → no action

    // First click
    if (!selectedCardData) {
      // Clear previous wrong card highlight on new first click
      setWrongCard("");
      setSelectedCardData(card.content);
      return;
    }

    // Second click → compare with first
    const firstCard = selectedCardData;
    const secondCard = card.content;

    const matchedWord = words.find(
      (w) =>
        (w.word === firstCard && w.img === secondCard) ||
        (w.word === secondCard && w.img === firstCard),
    );

    if (matchedWord) {
      // Correct match
      setCurrentScore((prev) => prev + 3);
      console.log("Correct match! +3 points");

      setMatchedCards((prev) => [...prev, firstCard, secondCard]);

      // Clear wrong highlight if these cards were previously wrong
      if (wrongCard === firstCard || wrongCard === secondCard) {
        setWrongCard("");
      }

      // TO-DO
      // TO-DO
      // TO-DO: send updateUsers(currentUsername, currentScore)
      setTimeout(() => {
        console.log(
          `Updating Supabase: user ${currentUsername} new score ${currentScore}`,
        );
      }, 500);
    } else {
      // Wrong match
      setCurrentScore((prev) => prev - 1);
      console.log("Wrong match! -1 point");

      // Set wrongCard to second clicked card only
      setWrongCard(secondCard);

      // TO-DO
      // TO-DO
      // TO-DO: send updateUserScore(currentUsername, currentScore)

      setTimeout(() => {
        console.log(
          `Updating Supabase: user ${currentUsername} new score ${currentScore}`,
        );
      }, 500);
    }

    // Reset first click
    setSelectedCardData("");
  };

  // Move to next lesson if all cards matched
  useEffect(() => {
    if (matchedCards.length === 12) {
      if (currentLesson < 3) {
        console.log("Moving to next lesson");
        const nextLesson = currentLesson + 1;
        setCurrentLesson(nextLesson);
        prepareLessonCards(nextLesson);
        setMatchedCards([]);
        setWrongCard("");
        setSelectedCardData("");
      } else {
        console.log("All lessons completed!");
      }
    }
  }, [matchedCards, currentLesson]);

  useEffect(() => {
    // TO-DO: send updateUserLesson(currentUsername, currentScore, currentLessto)
    // TO-DO: send updateUserLesson(currentUsername, currentScore, currentLessto)
    // TO-DO: send updateUserLesson(currentUsername, currentScore, currentLessto)
  }, [currentLesson]);

  if (!users || !words) return "...Loading";

  return (
    <div className="wrap">
      <ChangeUser
        users={users}
        currentUsername={currentUsername}
        onChangeUser={setCurrentUsername}
      />
      <div className="App">
        <h2>Current User: {currentUsername}</h2>
        <h3>Score: {currentScore}</h3>

        <div style={{ margin: "10px 0" }}>
          Progress: Lesson {currentLesson} / 3
          <div
            style={{
              background: "#eee",
              height: "10px",
              width: "100%",
              marginTop: "5px",
            }}
          >
            <div
              style={{
                background: "#4caf50",
                height: "10px",
                width: `${(currentLesson / 3) * 100}%`,
                transition: "width 0.5s",
              }}
            ></div>
          </div>
        </div>

        <div className="card-grid" style={{}}>
          {shuffledCards.map((card, index) => {
            const isMatched = matchedCards.includes(card.content);
            const isWrong = wrongCard === card.content;

            return (
              <div
                key={index}
                className={`card ${isMatched ? "matched" : ""} ${isWrong ? "wrong" : ""}`}
                onClick={() => handleCardClick(card)}
                style={{
                  border: "1px solid #ccc",
                  cursor: isMatched ? "not-allowed" : "pointer",
                  background: isMatched
                    ? "#c8e6c9"
                    : isWrong
                      ? "#f8d7da"
                      : selectedCardData === card.content
                        ? "#bbdefb"
                        : "#fff",
                  textAlign: "center",
                }}
              >
                {card.type === "word" ? (
                  <span style={{ fontSize: "18px" }}>{card.content}</span>
                ) : (
                  <img
                    src={card.content}
                    alt="img"
                    style={{ maxWidth: "100%", maxHeight: "80px" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Rates users={users} />
    </div>
  );
}

export default App;

function Rates({ users }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "16px",
        background: "#fafafa",
      }}
    >
      <h3>Leaderboard</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {users.map((user) => (
          <li
            key={user.username}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
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

function ChangeUser({ users, currentUsername, onChangeUser }) {
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "12px",
        background: "rgb(147 202 207)",
      }}
    >
      <label htmlFor="user-select" style={{ fontWeight: "bold" }}>
        Select User:
      </label>
      <select
        id="user-select"
        value={currentUsername}
        onChange={(e) => onChangeUser(e.target.value)}
        style={{
          marginLeft: "10px",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
          background: "rgb(209 230 232)",
        }}
      >
        {users.map((user) => (
          <option key={user.username} value={user.username}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
}
