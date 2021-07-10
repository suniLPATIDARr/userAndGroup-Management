import React, { useState } from 'react';
export default function HooksWithObj(){
    const [name,setName]=useState({firstName:"",lastName:""})
    return(
        <div>
            <input type="text" value={name.firstName} onChange={e=>setName({firstName:e.target.value})}/>
            <input type="text" value={name.lastName} onChange={e=>setName({lastName:e.target.value})}/>
            <h2>First Name is - {name.firstName}</h2>
            <h2>Last Name is - {name.lastName}</h2>
        </div>
    )
}