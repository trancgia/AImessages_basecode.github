import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import styles from "./App.module.css"
import { getImageUrl } from "./utils";
import ReactMarkdown from 'react-markdown';


function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatbotName, setChatbotName] = useState("");
  

  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const apikey = import.meta.env.VITE_API_KEY;

  async function generateAnswer() {
    const botIntro = chatbotName ? `Your name is ${chatbotName}, please respond to it and try to embody the person if possible and try to text like a human, ONLY 1 EMOTICON! ` : '';
    const conversation = botIntro + chatHistory.map(entry => `${entry.question}\n ${entry.answer}`).join('\n') + `\n ${question}`;
    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apikey}`,
      method: "post",
      data: {contents:  [{ parts: [{ text: conversation }] }] },
    });
    const newAnswer = response['data']['candidates'][0]['content']['parts'][0]['text'].trim();
    setAnswer(newAnswer);
    setChatHistory(prevHistory => [...prevHistory, {question, answer: newAnswer}]);
    setQuestion("");
    
  }
  
  useEffect(() => {
    if (chatAreaRef.current) {
      const chatAreaHeight = chatAreaRef.current.clientHeight;
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
      chatHistory.forEach((entry, index) => {
        const element = document.getElementById(`user-bubble-${index}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const relativePosition = rect.top / chatAreaHeight;
          
          if (relativePosition < 0.33) {
            element.style.background = '#63aef4';
          } else if (relativePosition < 0.66) {
            element.style.background = '#57a1f4';
          } else {
            element.style.background = '#387df5';
          }
        }
      });
    }
  }, [chatHistory]);

  function submitInput() {
    const inputContainer = document.getElementById('inputContainer');
    inputContainer.style.display = 'none';
    const title = document.getElementById('title');
    title.style.display = 'flex'
  }

  function changeName() {
    const inputContainer = document.getElementById('inputContainer');
    inputContainer.style.display = 'flex';
    const title = document.getElementById('title');
    title.style.display = 'none'
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestion(e.target.result);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  }
  return (
    
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title} id = 'title'>
          {chatbotName}
        </h1>

        <div className={styles.navbar}>
          <div id='inputContainer' className={styles.inputContainer}>
            <input placeholder = "Enter your chatbot's name" className = {styles.chatbotInput} type='text' id = 'chatbotInput' value={chatbotName} onChange={(e) => setChatbotName(e.target.value)} />
            <button className={styles.chatbotBtn} type='submit' onClick={submitInput}>Submit</button>
          </div>
          <button className={styles.navBtn} type='submit' onClick={changeName}>
            <img src = {getImageUrl("navbar/rightarrow.png")} />
          </button>
        </div>
      </div>
      
      

      <div className={styles.chatarea} ref={chatAreaRef}>{chatHistory.map((entry, index) => (
        <div className = {styles.chatSep} key={index}>
          <div id = {`user-bubble-${index}`} className={styles.userbubble}>
            <p className={styles.usertext}>{entry.question}</p>
          </div>
          <div className={styles.aibubble}>
            <ReactMarkdown className={styles.aitext}>{entry.answer}</ReactMarkdown>
          </div>
        </div>
      ))}
      </div>

      <div className={styles.searchContainer}>
        <label className = {styles.addBtn}>
          <img src = {getImageUrl("inputbar/plus.png")}/>
          <input type='file' accept='.txt' onChange={handleFileUpload} ref={fileInputRef}/>
        </label>
        <textarea className = {styles.inputbar} value={question} onChange={(e) => setQuestion(e.target.value)}></textarea>
        <button className = {styles.btn} onClick={generateAnswer}>
          <img className = {styles.image} src = {getImageUrl("inputbar/arrows.png")}/>
        </button>
      </div>
      
    </div>
  )
}

export default App
