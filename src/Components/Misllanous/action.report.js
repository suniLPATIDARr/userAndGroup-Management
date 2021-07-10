import * as constance from "./action.constance";
import moment from "moment";
import {alertComponent,commonWarningStyle} from "../views/Main/Common/Common"
import { renew } from "./action.auth";

export const REPORT_REQUEST = "REPORT_REQUEST";
export const REPORT_REQUEST_LATEST = "REPORT_REQUEST_LATEST";
export const REPORT_REQUEST_MONTHLY = "REPORT_REQUEST_MONTHLY";
export const REPORT_REQUEST_LOGONE = "REPORT_REQUEST_LOGONE";
export const REPORT_REQUEST_LOGONE_DEVICE = "REPORT_REQUEST_LOGONE_DEVICE";

export const REPORT_SUCCESS = "REPORT_SUCCESS";
export const REPORT_SUCCESS_LATEST = "REPORT_SUCCESS_LATEST";
export const REPORT_SUCCESS_MONTHLY = "REPORT_SUCCESS_MONTHLY";
export const REPORT_SUCCESS_LOGONE = "REPORT_SUCCESS_LOGONE";
export const REPORT_SUCCESS_LOGONE_DEVICE = "REPORT_SUCCESS_LOGONE_DEVICE";
export const REPORT_FAILURE = "REPORT_FAILURE";

export const AUTH_REQUEST = "AUTH_REQUEST";
export const AUTH_FAILURE = "AUTH_FAILURE";
export const AUTH_SUCCESS = "AUTH_SUCCESS";

//import { renew } from "./action.auth";

export function getRequest(report) {
  let request=report==='monthly'?REPORT_REQUEST_MONTHLY:report==='all'?REPORT_REQUEST:report==='logone'?REPORT_REQUEST:REPORT_REQUEST_LATEST
    return {
      type: request,
      matches: [],
      status: constance.REQUESTING
    }
   }
   export function getRequestLog(report) {
    let request=report==='logone'?REPORT_REQUEST_LOGONE:REPORT_REQUEST_LOGONE_DEVICE
      return {
        type: request,
        matches: [],
        status: constance.REQUESTING
      }
     }
export function getFailure(error) {
  return {
    type: REPORT_FAILURE,
    error,
    status: constance.ERROR
  };
}

export function getSuccess(matches, total, tokenList, page,isLatest,date,report) {
  console.log(matches);
  let success=report==='monthly'?REPORT_SUCCESS_MONTHLY:report==='all'?REPORT_SUCCESS:report==='logone'?REPORT_SUCCESS:REPORT_SUCCESS_LATEST
    return {
      type: success,
      matches,
      pageCount: total,
      paginationList: tokenList,
      currentPage: page,
      isLatestRecord: isLatest,
      previousExecutiondate: date,
      status: constance.SUCCESS
    }
}
export function getSuccessLog(matches, total, tokenList, page,isLatest,date,report) {
  console.log(matches);
  let success=report==='logone'?REPORT_SUCCESS_LOGONE:REPORT_SUCCESS_LOGONE_DEVICE
    return {
      type: success,
      matches,
      pageCount: total,
      paginationList: tokenList,
      currentPage: page,
      isLatestRecord: isLatest,
      previousExecutiondate: date,
      status: constance.SUCCESS
    }
}
export function getSuccessLogone(matches, report) {  
  let success=REPORT_SUCCESS_LOGONE
    return {
      type: success,
      matches,      
      status: constance.SUCCESS
    }
}
/*
export function getSuccessCSV(matches) {
  console.log(matches);
  return {
    type: REPORT_SUCCESS,
    matches,
    status: constance.SUCCESS
  };
}
*/

export function unauthorized(matches) {
  return {
    type: AUTH_FAILURE,
    isAuthrized: false,
    status: constance.FAILURE
  };
}


export function getStatus(report, dbname, offset, rowLimit,machineCode) {
  //renew();
  return async (dispatch, getState, { api }) => {
    dispatch(getRequest(report));
    let url = "";
    if (dbname == 'redshift') {
      url = "redshiftstatus";
      url += "?dbname=" + dbname;
      url+="&requestType=read"
      if(machineCode){
        url += "&machineCode=" +machineCode;    
        }
        else{
          url += "&machineCode=*"; 
      }
      url += "&groupId=" + localStorage.getItem("GroupId");
      url += "&format=json";

      var closingdate = getState().property.data.monthlyClosingDate;
      var closingminute = getState().property.data.monthlyClosingMinute - moment().utcOffset();
      if (report) {
        url += "&report=" + report;
        url += "&closingdate=" + closingdate;
        //url += "&closingtime=" + "22:00"
        url += "&closingminute=" + closingminute;
        url += "&limit=" + "12";
      }
      if (offset) {
        url += "&offset=" + offset;
      }
      if (rowLimit) {
        url += "&rowLimit=" + rowLimit;
      }
    }
    try {
      const result = await api.get(url);
      let resultJson = await result.json();
      console.log(result);
      if (result.status == 403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        console.log(result.status)
        //dispatch(unauthorized());
      } else {
        if (result.status >= 400) {
          if (dbname == 'redshift') {
            if (report) {
              if (report == 'monthly') {
                dispatch(getAthenaStatus('monthly', 'athena', null,machineCode));
              }
              else {
                dispatch(getAthenaStatus('all', 'athena', null,machineCode));
              }
            }
            else {
              dispatch(getAthenaStatus(null, 'athena', null,machineCode));
            }
          }
          //throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        else {
          dispatch(getSuccess(resultJson.data, resultJson.count,null,null,null,null,report));
        }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
      //dispatch(unauthorized());
      dispatch(getFailure(e.message));
      }
    }
  };
}


export function getAthenaResults(report, executionId, key, nextToken, max,serialnumber) {
  //renew();
  return async (dispatch, getState, { api }) => {
    let propInfo=report==='monthly'?getState().monthlyReportEric:report==='logone'?getState().logone:report==="all"?getState().report:getState().latestEricReport    
    if (!key) {     
      propInfo.paginationList=[];     
    }
    dispatch(getRequest(report));
    let url = "reportResults?format=json";
    url += "&queryExecutionId=" + executionId;
    url+="&requestType=read";          
    if(report==='logone'){
      url+="&reportType=logone";  
    }
    if (max && report !=='logone') {
      url += "&resultLimit=" + max;
    }
    if (nextToken) {
      url += "&athenaToken=" + nextToken;
    } 
    try {
      const result = await api.get(url);
      let resultJson = await result.json();      
      if (result.status == 403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        console.log(result.status)
        //dispatch(unauthorized());
      } else {
        if (result.status > 400) {
          dispatch(getFailure(resultJson.error));
          throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        if(report==="logone"){
          dispatch(getSuccessLogone(resultJson.data));
          if(resultJson.data.length >=1){
            window.selectedDevice=resultJson.data[0].serialnumber
            dispatch(getAthenaStatus('all', 'athena', null,null,resultJson.data[0].serialnumber,max))
          }else{
            window.selectedDevice=null
            //if group has no log making react store to null            
            dispatch(getSuccess(resultJson.data, null, null, null,null,null,report))
          }
        }
        else{
        var page = 0;
        if (resultJson.nextToken) {
          var tokenList = [];
          if (key == null || propInfo.paginationList == null) {
            let data = {
              id:0,
              value: resultJson.nextToken
            }
            tokenList.push(data);
          }
          else {
            if (propInfo.paginationList.length == 0) {
              let data = {
                id: 0,
                value: resultJson.nextToken
              }
              tokenList.push(data);
            }
            else {
              tokenList = propInfo.paginationList;
              var len = tokenList.length;
              if (key == "prev") {
                tokenList.splice(len-1, 1);
                len = tokenList.length;
                page = len;
                let data = {
                  id: len,
                  value: resultJson.nextToken
                }
                tokenList.push(data);
              }
              else {
                len = tokenList.length;
                page = len;
                let data = {
                  id: len,
                  value: resultJson.nextToken
                }
                tokenList.push(data);
              }
            }
          }
        }
        else {
          tokenList =propInfo.paginationList;
          if (tokenList) {
            var len = tokenList.length;
            if (len > 0) {
              page = len;
            }
          }
          else{
            tokenList = [];
          }
        }
        dispatch(getSuccess(resultJson.data, 0, tokenList, page,null,null,report));
      }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
      //dispatch(unauthorized());
      dispatch(getFailure(e.message));
      }
    }
  };
}

export function exportStatus(report, dbname, executionId, machineCode,serialNumber) {
  //renew();
  return async (dispatch, getState, { api }) => {
    if(report==="usagereport"){
    dispatch(getRequest());
    }
    let url = "";
    let prefix = 'ERIC_Latest_';
        if (report == 'monthly') {
          prefix = 'ERIC_Report_'
        }else if (serialNumber || window.logoneExportFlag === true) {
          prefix = 'ERIC_Log_Device_'
          window.logoneExportFlag = false
        } else if (report == 'all') {
          prefix = 'ERIC_Log_Devices_'
        }else if(report == 'usagereport'){
          prefix = 'SRDM_Log_Report'
        }else if(report ==="uniagentreport"){
          prefix = 'UNIAGENT_Report'
        }
    const dateAndTime = moment().format("YYYYMMDDHHmmss");
    let fileName = prefix + dateAndTime;;
    if(report==='uniagentreport'||report==='usagereport'){
      fileName= prefix +"_"+ dateAndTime;
    }
    if (dbname === "redshift") {
      url += "redshiftstatus?format=csv" + "&dbname=" + dbname;
      url += "&groupId=" + localStorage.getItem("GroupId");
    } else if (dbname === "dynamo") {
      url += "reportStatus2?format=csv";
      url +='&reportType='+ report 
      url += "&groupId=" + localStorage.getItem("GroupId");
      //url += "&tableName=" + "gdvm-4RMR";
    } else {
      url = "reportResults?format=csv" + "&dbname=" + dbname;
      url += "&queryExecutionId=" + executionId;
      url +='&reportType='+prefix 
      url += "&fileName=" + fileName;
    }
    url += "&requestType=read";
    if(serialNumber){
      url+="&serialNumber="+serialNumber
    }
    var closingdate = getState().property.data.monthlyClosingDate;
    var closingminute = getState().property.data.monthlyClosingMinute;
    if (report) {
      if(report!=="usagereport"){
        url += "&report=" + report;
        url += "&closingdate=" + closingdate;
        //url += "&closingtime=" + "22:00"
        url += "&closingminute=" + closingminute;
        url += "&limit=" + "12";
      }else{
        url += "&report=" + report;
        url += "&limit=" + "12";
      }
    }
    if (machineCode) {
      url += "&machineCode=" + machineCode;
    } else if(report!="usagereport" && report!=="uniagentreport"){
      url += "&machineCode=*";
    }

    try {
      let blob;
      let resultJson;
      const result = await api.get(url);
      if(dbname == 'dynamo'){
        blob = await result.blob();
      }else{
        resultJson = await result.json();
      }
      
      if (result.status == 401 || result.status==403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        //dispatch(unauthorized());
      } else if (result.status === 502 || result.status === 504) {
        alertComponent("warning",`Export Operation Failed`)
      } else {
        if (result.status > 400) {
          if (dbname == "redshift") {
            dispatch(getAthenaStatus(null, "athena", "csv"));
          }
          if(dbname != 'dynamo'){
            dispatch(getFailure(resultJson.error));
          }          
          throw new Error(`4xx`);
        }
       
        if(dbname === 'dynamo'){
          if (navigator.appVersion.toString().indexOf('.NET') > 0) {
            //IE 10+
            window.navigator.msSaveBlob(blob, fileName + '.csv');
          } else {
            var a = document.createElement('a');
            var blobUrl = window.URL.createObjectURL(new Blob([blob], {
              type: blob.type
            }));
            document.body.appendChild(a);
            a.style = 'display: none';
            a.href = blobUrl;
            a.download = fileName + '.csv';
            if(report==="usagereport" || report==="uniagentreport"){
              dispatch(getSuccess());
              }
            a.click();
          }
        }else{
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          a.href = resultJson.downloadSignedUrl;
          a.download = fileName + ".csv";
          if(report==="usagereport" || report==="uniagentreport"){
            dispatch(getSuccess());
            }
          a.click();

        }       
      }
    } catch (e) {
      console.log("Canceld error", e);
      if (e.name === "TypeError") {
        console.log("User refresh the api call");
      } else {
        // //dispatch(unauthorized());
        dispatch(getFailure(e.message));
      }
    }
  };
}


export function getAthenaStatus(report, dbname, format,machineCode,serialnumber,pageSize) { 
  //renew();
  return async (dispatch, getState, { api }) => {
    let propInfo=report==='monthly'?getState().monthlyReportEric:report==='logone'?getState().logone:report==="all"?getState().report:getState().latestEricReport
    if (!format || report === "usagereport" || report === "uniagentreport") {
      dispatch(getRequest(report));
      propInfo.paginationList=[];
      propInfo.currentPage=0
    }
    let url = "reportStatus";
    if(report==="usagereport" || report==="uniagentreport")
    url = "usagereport";
    url += "?dbname=athena";
    if(report!=="usagereport" && report!=="uniagentreport")
    url += "&groupId=" + localStorage.getItem("GroupId");
    url+="&requestType=read"
    if(report==="usagereport" || report==="uniagentreport"){
      let data;
      let agentList=[]
      getState().agentInfo.data?data=getState().agentInfo.data:null
      data?data.map(item=>{
       if(item.agentType==="AGENT_LOG"){
         agentList.push(item.agentSettings.agentId)
       }
      }):null
      url+="&agentId="+agentList;

    }
    if (format) {
      url += "&format=csv";
    }
    else {
      url += "&format=json";
    }
    if(report!=="usagereport" && report!=="uniagentreport" ){
      if(machineCode){
        url += "&machineCode=" +machineCode;    
        }
        else{
          url += "&machineCode=*"; 
      }
    }
    
    var closingdate = getState().property.data.monthlyClosingDate;
    var closingminute = getState().property.data.monthlyClosingMinute;
    if (report) {
     // url += "&reportType=" + report;
      url += "&reportType=" + report;
      if(report !== "rmr" && report !== "logone" && report !== "all" && report !== "usagereport" &&  report !== "uniagentreport"){
        url += "&closingdate=" + closingdate;
        //url += "&closingtime=" + "22:00"
        url += "&closingminute=" + closingminute;      
      }
      if(report === "logone" || (serialnumber && serialnumber.length>1)){
        console.log("123")         
       // if(serialnumber.length>1){
        url += "&serialNumber=" + serialnumber;
        //}
      }
    }
    if(pageSize && report !=='logone'){
    url += "&resultLimit=" + pageSize;
    }
    try {
      let result;
      if(report==="usagereport" || report==="uniagentreport"){
        result= await api.getSrdmData(url)
      }else{
        result = await api.get(url);
      }
      let resultJson = await result.json();
      let resultValue;
      if(report==="usagereport" || report==="uniagentreport"){
        resultValue=resultJson.queryExecutionId
      }else{
        resultValue=resultJson.value
      }
      console.log(result)
      if (result.status == 403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        //dispatch(unauthorized());
      } else {
        if (result.status > 400) {
          dispatch(getFailure(resultJson.error));
          throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        else if (result.status == 200) {

          if (!format) {
            sessionStorage.setItem("queryExecutionId", resultValue);
          }          
          dispatch(getQueryStatus(report, dbname, resultValue, null, null, pageSize, format,serialnumber));
        }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
      //dispatch(unauthorized());
      dispatch(getFailure(e.message));
      }
    }
  };
}
export function getDynamoDBStatus(report, token,key,machineCode) {
  //renew();
  return async (dispatch, getState, { api }) => {  
  let propInfo=report==='monthly'?getState().monthlyReportEric:report==='all'?getState().report:getState().latestEricReport
    if (!key) {
      propInfo.paginationList=[];
      dispatch(getRequest(report));
    }    
    let url = "reportStatus2";    
    url += "?groupId=" + localStorage.getItem("GroupId");
    url+="&requestType=read";
    url += "&resultLimit=" + "10";
    if(machineCode){
    url += "&machineCode=" +machineCode;    
    }
    else{
      url += "&machineCode=*"; 
    }
    url += "&format=json";    
    if(token){
      url+="&lastEvalKey="+token;
    }    
    var closingdate = getState().property.data.monthlyClosingDate;
    var closingminute = getState().property.data.monthlyClosingMinute;
    if (report) {
      url += "&reportType=" + report;
      url += "&closingdate=" + closingdate;
      //url += "&closingtime=" + "22:00"
      url += "&closingminute="+closingminute ;           
    }else{
      url += "&reportType=" + "rmr";
    }
    try {
      const result = await api.get(url);
      let resultJson = await result.json();      
      console.log('resultjson',resultJson)
      console.log('result',result)
      let isLatest=true;       
      if (result.status == 403) {
        console.log(result.status)
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        //dispatch(unauthorized());
      } else {
        if (result.status >= 400) {
          dispatch(getFailure(resultJson.error));
          throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        else if (result.status == 200) {
          if(report){
            isLatest=resultJson.isLatestRecord;
          }
          var tokenList = [];          
          var page = 0;
          if (resultJson.nextToken) {
            if (key == null || propInfo.paginationList == null) {
              let data = {
                id:0,
                value: resultJson.nextToken
              }
              tokenList.push(data);
            }
            else {
              if (propInfo.paginationList.length == 0) {
                let data = {
                  id: 0,
                  value: resultJson.nextToken
                }
                tokenList.push(data);
              }
              else {
                tokenList = propInfo.paginationList;
                var len = tokenList.length;
                if (key == "prev") {
                  tokenList.splice(len-1, 1);
                  len = tokenList.length;
                  page = len;
                  let data = {
                    id: len,
                    value: resultJson.nextToken
                  }
                  tokenList.push(data);
                }
                else {
                  len = tokenList.length;
                  page = len;
                  let data = {
                    id: len,
                    value: resultJson.nextToken
                  }
                  tokenList.push(data);                  
                }
              }
            } 
        } else{
            tokenList = propInfo.paginationList;
            if (tokenList) {
              var len = tokenList.length;
              if (len > 0) {
                page = len;
              }
            }
            else{
              tokenList = [];
            }
          }         
          dispatch(getSuccess(resultJson.data, 0, tokenList, page,isLatest,resultJson.prevExecutionDate,report));
        }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
      //dispatch(unauthorized());
      dispatch(getFailure(e.message));
      }
    }
  };
}
export function getQueryStatus(report, dbname, executionId, key, nextToken, pageSize, format,serialnumber) {
  //renew();  
  return async (dispatch, getState, { api }) => {
    if (!format || report==="usagereport" ||  report==="uniagentreport") {
      dispatch(getRequest(report));
    }
    let url = "queryStatus";
    url+="?requestType=read"
    if (executionId)
      url += "&queryExecutionId=" + executionId;
    try {
      const result = await api.get(url);
      let resultJson = await result.json();
      if (result.status == 403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        console.log(result.status)
        //dispatch(unauthorized());
      } else {
        if (result.status > 400) {
          dispatch(getFailure(resultJson.error));
          throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        else if (result.status == 200) {
          console.log("resultJson",resultJson)
          let queryStatus = resultJson.message;         
         // if (report==="usagereport" ||  report==="uniagentreport") 
         // queryStatus = resultJson.message;
          if (format && queryStatus == "SUCCEEDED") {            
            dispatch(exportStatus(report, dbname, executionId,null,serialnumber));
          }
          else if (queryStatus == "SUCCEEDED") {           
            dispatch(getAthenaResults(report, executionId, key, nextToken, pageSize,serialnumber));
          }
          else if (queryStatus == "FAILED" || queryStatus == "CANCELLED") {
            dispatch(getFailure(resultJson.error));
            throw new Error(`[${result.status}] ${resultJson.error}`);
          }
          else {
            await waitMethod();
            dispatch(getQueryStatus(report, dbname, executionId, null, null, pageSize, format,serialnumber));
          }

        }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
        //dispatch(unauthorized());
        dispatch(getFailure(e.message));
      }
      
    }
  };
}
export function getAthenaStatusLogone(report, dbname, format,machineCode,serialnumber,pageSize) { 
  //renew();
  return async (dispatch, getState, { api }) => {
    let propInfo=report=== report==='logone'?getState().logone:getState().logoneEricDevice
    if (!format) {
      dispatch(getRequestLog(report));
      propInfo.paginationList=[];
      propInfo.currentPage=0
    }
    let url = "reportStatus";
    url += "?dbname=athena";
    url += "&groupId=" + localStorage.getItem("GroupId");
    url+="&requestType=read"
    if (format) {
      url += "&format=csv";
    }
    else {
      url += "&format=json";
    }
      if(machineCode){
        url += "&machineCode=" +machineCode;    
        }
        else{
          url += "&machineCode=*"; 
      }
    
    var closingdate = getState().property.data.monthlyClosingDate;
    var closingminute = getState().property.data.monthlyClosingMinute;
    if (report) {
     // url += "&reportType=" + report;
      url += "&reportType=" + report;
      if(report === "logone" || (serialnumber && serialnumber.length>1)){
        console.log("123")         
       // if(serialnumber.length>1){
        url += "&serialNumber=" + serialnumber;
        //}
      }
    }
    if(pageSize && report !=='logone'){
    url += "&resultLimit=" + pageSize;
    }
    try {
      let result = await api.get(url);
      let resultJson = await result.json();
      let resultValue;
      if(report==="usagereport" || report==="uniagentreport"){
        resultValue=resultJson.queryExecutionId
      }else{
        resultValue=resultJson.value
      }
      if (result.status == 403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        //dispatch(unauthorized());
      } else {
        if (result.status > 400) {
          dispatch(getFailure(resultJson.error));
          throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        else if (result.status == 200) {

          if (!format) {
            sessionStorage.setItem("queryExecutionIdLogone", resultValue)
          }          
          dispatch(getQueryStatusLogone(report, dbname, resultValue, null, null, pageSize, format,serialnumber));
        }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
      //dispatch(unauthorized());
      dispatch(getFailure(e.message));
      }
    }
  };
}
export function getQueryStatusLogone(report, dbname, executionId, key, nextToken, pageSize, format,serialnumber) {
  //renew();  
  return async (dispatch, getState, { api }) => {
    if (!format) {
      dispatch(getRequestLog(report));
    }
    let url = "queryStatus";
    url+="?requestType=read"
    if (executionId)
      url += "&queryExecutionId=" + executionId;
    try {
      const result = await api.get(url);
      let resultJson = await result.json();
      if (result.status == 403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        console.log(result.status)
        //dispatch(unauthorized());
      } else {
        if (result.status > 400) {
          dispatch(getFailure(resultJson.error));
          throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        else if (result.status == 200) {
          console.log("resultJson",resultJson)
          let queryStatus = resultJson.message;         
         // if (report==="usagereport" ||  report==="uniagentreport") 
         // queryStatus = resultJson.message;
          if (format && queryStatus == "SUCCEEDED") {            
            dispatch(exportStatus(report, dbname, executionId,null,serialnumber));
          }
          else if (queryStatus == "SUCCEEDED") {           
            dispatch(getAthenaResultsLogone(report, executionId, key, nextToken, pageSize,serialnumber));
          }
          else if (queryStatus == "FAILED" || queryStatus == "CANCELLED") {
            dispatch(getFailure(resultJson.error));
            throw new Error(`[${result.status}] ${resultJson.error}`);
          }
          else {
            await waitMethod();
            dispatch(getQueryStatusLogone(report, dbname, executionId, null, null, pageSize, format,serialnumber));
          }

        }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
        //dispatch(unauthorized());
        dispatch(getFailure(e.message));
      }
      
    }
  };
}
export function getAthenaResultsLogone(report, executionId, key, nextToken, max,serialnumber) {
  //renew();
  return async (dispatch, getState, { api }) => {
    let propInfo=report==='logone'?getState().logone:getState().logoneEricDevice
    if (!key) {     
      propInfo.paginationList=[];     
    }
    dispatch(getRequestLog(report));
    let url = "reportResults?format=json";
    url += "&queryExecutionId=" + executionId;
    url+="&requestType=read";          
    if(report==='logone'){
      url+="&reportType=logone";  
    }
    if (max && report !=='logone') {
      url += "&resultLimit=" + max;
    }
    if (nextToken) {
      url += "&athenaToken=" + nextToken;
    } 
    try {
      const result = await api.get(url);
      let resultJson = await result.json();      
      if (result.status == 403) {
        getState().auth.status!=='requesting'?dispatch(renew()):null
        dispatch(getFailure(resultJson.error));
        console.log(result.status)
        //dispatch(unauthorized());
      } else {
        if (result.status > 400) {
          dispatch(getFailure(resultJson.error));
          throw new Error(`[${result.status}] ${resultJson.error}`);
        }
        if(report==="logone"){
          dispatch(getSuccessLogone(resultJson.data));
          if(resultJson.data.length >=1){
            window.selectedDevice=resultJson.data[0].serialnumber
            dispatch(getAthenaStatusLogone('all', 'athena', null,null,resultJson.data[0].serialnumber,max))
          }else{
            window.selectedDevice=null
            //if group has no log making react store to null            
            dispatch(getSuccessLog(resultJson.data, null, null, null,null,null,report))
          }
        }
        else{
        var page = 0;
        if (resultJson.nextToken) {
          var tokenList = [];
          if (key == null || propInfo.paginationList == null) {
            let data = {
              id:0,
              value: resultJson.nextToken
            }
            tokenList.push(data);
          }
          else {
            if (propInfo.paginationList.length == 0) {
              let data = {
                id: 0,
                value: resultJson.nextToken
              }
              tokenList.push(data);
            }
            else {
              tokenList = propInfo.paginationList;
              var len = tokenList.length;
              if (key == "prev") {
                tokenList.splice(len-1, 1);
                len = tokenList.length;
                page = len;
                let data = {
                  id: len,
                  value: resultJson.nextToken
                }
                tokenList.push(data);
              }
              else {
                len = tokenList.length;
                page = len;
                let data = {
                  id: len,
                  value: resultJson.nextToken
                }
                tokenList.push(data);
              }
            }
          }
        }
        else {
          tokenList =propInfo.paginationList;
          if (tokenList) {
            var len = tokenList.length;
            if (len > 0) {
              page = len;
            }
          }
          else{
            tokenList = [];
          }
        }
        dispatch(getSuccessLog(resultJson.data, 0, tokenList, page,null,null,report));
      }
      }
    } catch (e) {
      console.log("Canceld error",e.name);
      if(e.name === 'TypeError'){
        console.log('User refresh the api call')
      }else{
      //dispatch(unauthorized());
      dispatch(getFailure(e.message));
      }
    }
  };
}
async function waitMethod() {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("success"), 5000)
  });
  let result = await promise; 
 return result; 
}