import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [model, setModel] = useState('openai-gpt');

  const handleSubmit = async () => {
    const res = await axios.post('/api/ask', { question, model });
    setResponse(res.data.answer);
  };

  return (
    <div className="App">
      <h1>Ask AI</h1>
      <select value={model} onChange={(e) => setModel(e.target.value)}>
        <option value="openai-gpt">OpenAI GPT</option>
        <option value="google-ai">Google AI</option>
        <option value="custom-model">Custom Model</option>
      </select>
      <input 
        type="text" 
        value={question} 
        onChange={(e) => setQuestion(e.target.value)} 
      />
      <button onClick={handleSubmit}>Ask</button>
      <div>
        <h2>Response:</h2>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;