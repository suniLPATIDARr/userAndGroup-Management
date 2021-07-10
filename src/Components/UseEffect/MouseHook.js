//clean Up return in useEffect
import { useState, useEffect } from "react";
export default function MouseMove() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(()=>{
      console.log('useEffect called');
      window.addEventListener("mousemove",mouseMove)
      return ()  =>{
        console.log('clean UP called');
        window.removeEventListener("mousemove",mouseMove)
      }
  },[])
  const mouseMove=e=>{
      console.log('mousemove called');
      setX(e.clientX);
      setY(e.clientY)
  }
  return (
    <div>
      Hooks x={x} And y={y}
    </div>
  );
}
