import React, { useState, useEffect } from 'react';

const ColorCounter = ({ onChange, onValidate }) => {
  const [counters, setCounters] = useState({
    Red: 0,
    Blue: 0,
    Green: 0,
    Yellow: 0,
    Purple: 0,
  });

  const increment = (color) => {
    setCounters((prevCounters) => {
      const updatedCounters = {
        ...prevCounters,
        [color]: Math.min(prevCounters[color] + 1, 10),
      };
      onChange(updatedCounters); // Appeler la fonction de rappel avec les nouvelles valeurs
      return updatedCounters;
    });
  };

  const decrement = (color) => {
    setCounters((prevCounters) => {
      const updatedCounters = {
        ...prevCounters,
        [color]: Math.max(prevCounters[color] - 1, 0),
      };
      onChange(updatedCounters); // Appeler la fonction de rappel avec les nouvelles valeurs
      return updatedCounters;
    });
  };

  const colorStyles = {
    Red: 'red',
    Blue: 'blue',
    Green: 'green',
    Yellow: 'yellow',
    Purple: 'purple',
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      {Object.keys(counters).map((color) => (
        <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button onClick={() => decrement(color)} style={{ fontSize: '12px', padding: '2px 5px' }}>-</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: colorStyles[color] }}></div>
            <span>{counters[color]}</span>
          </div>
          <button onClick={() => increment(color)} style={{ fontSize: '12px', padding: '2px 5px' }}>+</button>
        </div>
      ))}
      <button onClick={() => onValidate(counters)} style={{ fontSize: '12px', padding: '5px 10px' }}>Validate</button>
    </div>
  );
};

export default ColorCounter;

