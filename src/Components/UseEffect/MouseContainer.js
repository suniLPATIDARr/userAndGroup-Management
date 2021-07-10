import {useState} from "react";
import Comp from "./MouseHook";
export default function Show(){
    const [display,setDisplay]=useState(true);
    return(
        <div>
            <button onClick={()=>setDisplay(!display)}>{display.toString()}</button>
            {display&&<Comp/>}
        </div>
    )
}