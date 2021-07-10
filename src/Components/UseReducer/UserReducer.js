import React, { useReducer } from "react";
const reducer = (state, action) => {
  switch (action.type) {
    case "Increment":
      return {...state ,firstValue:state.firstValue+action.value}
    case "Decrement":
      return  {...state ,firstValue:state.firstValue-action.value}
    case "Reset":
      return initialState;
    default:
      return state;
  }
};
const initialState ={
    firstValue:0
}
function UseReducer() {
  const [count, dispatch] = useReducer(reducer, initialState);
  return (
    <div>
      <h1>Count : {count.firstValue}</h1>
      <button onClick={()=>dispatch({type:'Increment',value:1})}>Increment</button>
      <button onClick={()=>dispatch({type:'Decrement',value:1})}>Decrement</button>
      <button onClick={()=>dispatch({type:'Increment',value:10})}>Increment 10</button>
      <button onClick={()=>dispatch({type:'Decrement',value:10})}>Decrement 10</button>
      <button onClick={()=>dispatch({type:'Reset'})}>Reset</button>
    </div>
  );
}

export default UseReducer;
