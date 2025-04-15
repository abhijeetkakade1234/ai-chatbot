// src/components/QuestionInput.jsx
import React from 'react';

function QuestionInput({ initialQuestions, setInitialQuestions }) {
  const handleAddQuestion = () => {
    setInitialQuestions([...initialQuestions, '']);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...initialQuestions];
    updated[index] = value;
    setInitialQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = initialQuestions.filter((_, i) => i !== index);
    setInitialQuestions(updated);
  };

  return (
    <div className="settings-group">
      <h3>Initial questions (Up to 3 questions)</h3>
      {initialQuestions.map((question, index) => (
        <div key={index} className="question-input-row">
          <input
            type="text"
            value={question}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            placeholder="Enter a question"
          />
          <button className="delete-btn" onClick={() => handleDeleteQuestion(index)}>Delete</button>
        </div>
      ))}
      {initialQuestions.length < 3 && (
        <button className="add-question-btn" onClick={handleAddQuestion}>
          + Add
        </button>
      )}
    </div>
  );
}

export default QuestionInput;
