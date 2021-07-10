//conditionally render componentDidUpdate like useEffect(()=>{ ... },[counter])
import React, { useState, useEffect } from "react";
import axios from 'axios';


export default function InitialEffect() {
    const [posts,setPosts]=useState([])
  useEffect(() => {
    axios.get("http://jsonplaceholder.typicode.com/posts").then(res=>{
        console.log(res)
        setPosts(res.data)
    }).catch(res=>{
        console.log(res)
    })
  }, []);

  return <div>
      <ul>
          {
              posts.map(post=><li id={post.id}>{post.title}</li>)
          }
      </ul>
  </div>;
}
