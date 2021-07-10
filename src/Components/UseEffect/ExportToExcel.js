//conditionally render componentDidUpdate like useEffect(()=>{ ... },[counter])
import React, {  useEffect } from "react";
// import exportFromJSON from "export-from-json"
import xlsx from  "json-as-xlsx";
import SampleData from "../../Asset/SampleData.json"
// import axios from 'axios';
// import { CSVLink } from "react-csv";
export default function InitialEffect() {
    const data=[
        { firstName: "Warren", lastName: "Morrow", email: "sokyt@mailinator.com", age: "36" },
        { firstName: "Gwendolyn", lastName: "Galloway", email: "weciz@mailinator.com", age: "76" },
        { firstName: "Astra", lastName: "Wyatt", email: "quvyn@mailinator.com", age: "57" },
        { firstName: "Jasmine", lastName: "Wong", email: "toxazoc@mailinator.com", age: "42" },
        { firstName: "Brooke", lastName: "Mcconnell", email: "vyry@mailinator.com", age: "56" },
        { firstName: "Christen", lastName: "Haney", email: "pagevolal@mailinator.com", age: "23" },
        { firstName: "Tate", lastName: "Vega", email: "dycubo@mailinator.com", age: "87" },
        { firstName: "Amber", lastName: "Brady", email: "vyconixy@mailinator.com", age: "78" },
        { firstName: "Philip", lastName: "Whitfield", email: "velyfi@mailinator.com", age: "22" },
        { firstName: "Kitra", lastName: "Hammond", email: "fiwiloqu@mailinator.com", age: "35" },
        { firstName: "Charity", lastName: "Mathews", email: "fubigonero@mailinator.com", age: "63" }
      ]
    // const headers = [
    //     { label: "First Name", key: "firstName" },
    //     { label: "Last Name", key: "lastName" },
    //     { label: "Email", key: "email" },
    //     { label: "Age", key: "age" }
    //   ];
      // const csvReport = {
      //   data: data,
      //   exportType: 'xlsx',
      //   filename: 'Clue_Mediator_Report.csv'
      // };


  useEffect(() => {
   
  }, []);
  const handleClick =()=>{
  //  exportFromJSON(csvReport)
//  let content=SampleData.employees
   var columns = [
   
  ]
  

  for (const property in SampleData.employees[0]) {
    console.log(`${property}: ${SampleData.employees[0][property]}`);
    let c= {label:property.toLocaleUpperCase(),value:row=>row[property]}
     columns.push(c)
  }
  let window={
    performance:{
      navigation:{
        type:1
      }
    }
  }

console.log(columns)
  
  // var content = [
  //   { user: 'Ana', age: 16, more: { phone: '11111111' } },
  //   { user: 'Luis', age: 19, more: { phone: '12345678' } }
  // ]
  
  var settings = {
    sheetName: 'TVI', // The name of the sheet
    fileName: 'TVI-Data', // The name of the spreadsheet
    extraLength: 30, // A bigger number means that columns should be wider
    writeOptions: {} // Style options from https://github.com/SheetJS/sheetjs#writing-options
  }
  
  var download = true // If true will download the xlsx file, otherwise will return a buffer
  
  xlsx(columns, SampleData.employees, settings, download)
  }
  // console.log(SampleData.employees.map(item=>item.name))
  return (
    <div className="x">
      {/* <h3>Export data to CSV in React - <a href="https://cluemediator.com" target="_blank" rel="noopener noreferrer">Clue Mediator</a></h3> */}
      {/* <CSVLink {...csvReport}>Export to CSV</CSVLink> */}
      <button onClick={handleClick}>Export to Excel</button>
    </div>
  );
}
