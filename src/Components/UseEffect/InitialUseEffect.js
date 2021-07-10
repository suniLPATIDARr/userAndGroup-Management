//conditionally render componentDidUpdate like useEffect(()=>{ ... },[counter])
import React, { useState ,useEffect} from "react";

export default function InitialEffect() {
  const [counter, setCounter] = useState(0);
  const [name, setName] = useState("");
  useEffect(()=>{
      console.log("use Effect updating title")
      document.title=`Clicked ${counter} Times`
  },[counter])

  return (
    <div>
      <h1> You Clicked {counter} times</h1>
      <input type="text" value={name} onChange={e=>setName(e.target.value)}></input>
      <button onClick={(e) => setCounter((prevC) => prevC + 1)}>
        Click ME
      </button>
    </div>
  );
}
