import React, { useState } from 'react';
export default function HooksWithArray(){
    const [number , setNumber] = useState([]);
    const addItem = () =>{
        setNumber([...number,{
            id:number.length,
            value:Math.floor(Math.random()*100)+1
        }])
    }
    return(
        <div>
            <button onClick={addItem}>Add Item</button>
           <ul>
                {
                    number.map((item)=>{
                    return <div>
                        <li key={item.id}>{item.value}</li>
                    </div>
                }
                    )
                }
           </ul>
        </div>
    )
}