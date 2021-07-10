import React, { useState } from 'react';

export default function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  const increment = () =>{
      for(let i=0;i<5;i++){
          setCount(x=>x+1)
      }
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
      <button onClick={() => setCount(prevCount=>prevCount + 1)}>
       Increment
      </button>
      <button onClick={() => setCount(prevCount=>prevCount - 1)}>
       Decrement
      </button>
      <button onClick={increment}>
       Inc by 5
      </button>
    </div>
  );
}