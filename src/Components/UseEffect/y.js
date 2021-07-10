import { configurationFile } from "../../../utils/config";
import permissionMap from "../../../assets/UserPermission.json"
import Swal from "sweetalert2";
import React from "react";
import {localization} from '../../../containers/DefaultLayout/DefaultLayout'
export const commonWarningStyle = "";
export function pageReload(
  reportType,
  dbname,
  machineCode,
  props,
  serialNumber,
  pageSize
) {
  switch (dbname) {
    case "redshift":
      // props.getStatus(reportType, dbname, null, null, machineCode);
      break;
    case "athena":
      serialNumber?props.getAthenaStatusLogone(
        reportType,
        dbname,
        null,
        machineCode,
        serialNumber,
        pageSize
      ):
      props.getAthenaStatus(
        reportType,
        dbname,
        null,
        machineCode,
        serialNumber,
        pageSize
      );
      break;
    case "dynamo":
      props.getDynamoDBStatus(reportType, null, null, machineCode);
  }
}

export function pageReloadFss(reportType, dbname, props, pageSize) {
  switch (dbname) {
    case "athena":
      props.getFSSDeviceAthenaStatus(reportType, dbname, null, pageSize);
      break;
    case "dynamo":
      props.getFSSDeviceDynamoStatus(reportType, null, pageSize, null);
  }
}
export function dataExport(
  reportType,
  dbname,
  machineCode,
  props,
  serialNumber
) {
  switch (dbname) {
    case "redshift":
      props.exportStatus(reportType, dbname, null, machineCode);
      break;
    case "athena":
      props.getAthenaStatus(
        reportType,
        dbname,
        "csv",
        machineCode,
        serialNumber
      );
      break;
    case "dynamo":
      props.exportStatus(reportType, dbname, null, machineCode);
      break;
  }
}

export function dataExportFss(reportType, dbname, props) {
  switch (dbname) {
    case "athena":
      props.getFSSDeviceAthenaStatus(reportType, dbname, "csv");
      break;
    case "dynamo":
      props.exportStatusFss(reportType, dbname, null);
      break;
  }
}

export function submitMachineCode(
  reportType,
  dbname,
  machineCode,
  props,
  pageSize,
  serialNumber
) {
  switch (dbname) {
    case "redshift":
      // props.getStatus(reportType, dbname, null, pageSize, machineCode);
      break;
    case "athena":
      serialNumber?props.getAthenaStatusLogone(
        reportType,
        dbname,
        null,
        machineCode,
        serialNumber,
        pageSize
      ):
      props.getAthenaStatus(
        reportType,
        dbname,
        null,
        machineCode,
        serialNumber,
        pageSize
      )
      break;
    case "dynamo":
      props.getDynamoDBStatus(reportType, null, null, machineCode);
      break;
  }
}
export function pageReloadSnmp(reportType, dbname, props) {
  switch (dbname) {
    /* case 'redshift':
       props.getStatus(reportType, dbname, null, null,machineCode);         
       break;
     case 'athena':        
       props.getAthenaStatus(reportType, dbname, null,machineCode);        
       break;  */
    case "dynamo":
      props.getDynamoLatestViewer(reportType, null);
  }
}

export function deleteAllSnmpLatest(reportType, dbname, props) {
  switch (dbname) {
    default:
      props.deleteAllSnmpLatestData(reportType, null);
  }
}

export function dataExportSnmp(reportType, dbname, props) {
  switch (dbname) {
    /* case 'redshift':
       props.exportStatus(reportType, dbname,null,machineCode);
       break;
     case 'athena':
       props.getAthenaStatus(reportType, dbname, "csv",machineCode);
       break;   */
    case "dynamo":
      props.exportStatusSnmp(reportType, dbname);
      break;
  }
}
export function isvalidIPAddress(ipaddress) {
  if (
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress
    )
  ) {
    return true;
  }
  return false;
}
export function isIPRangeValid(start, end) {
  var fromArr = start.split(".");
  var toArr = end.split(".");
  for (let i = 0; i < 4; i++) {
    if (fromArr[i] > toArr[i]) return false;
  }
  return true;
}
export function getUnique(originalArray, prop) {
  var newArray = [];
  var lookupObject = {};

  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
}
export function getGraphBarData(array, key) {
  var barDatas = [];
  for (var i in array) {
    barDatas.push(key == "Total Mono" ? array[i].monochrome : array[i].color);
  }
  return barDatas;
}
export function getGraphBarLabels(array) {
  var barLabels = [];
  for (var i in array) {
    barLabels.push(array[i].serialNumber);
  }
  return barLabels;
}
export function pageReloadAlert(reportType, dbname, props) {
  switch (dbname) {
    /* case 'redshift':
       props.getStatus(reportType, dbname, null, null,machineCode);         
       break;
     case 'athena':        
       props.getAthenaStatus(reportType, dbname, null,machineCode);        
       break;  */
    default:
      if (reportType == "alert") {
        props.getAlertViewerFSS(reportType);
      } else {
        props.getAlertViewer(reportType);
      }
  }
}
export function dataExportAlert(reportType, dbname, props) {
  switch (dbname) {
    /* case 'redshift':
       props.exportStatus(reportType, dbname,null,machineCode);
       break;
     case 'athena':
       props.getAthenaStatus(reportType, dbname, "csv",machineCode);
       break;   */
    case "dynamo":
      if (reportType == "alert") {
        props.exportSnmpAlert();
      } else {
        props.exportSnmpAlert();
      }

      break;
  }
}
export function getCheckBoxProps(alertData, checkBoxAlertkeys) {
 
  var CheckBoxData = [];
  var AlertObject = {};
  Object.keys(alertData).forEach(function(key) {
    AlertObject[key] = alertData[key];
  });
  Object.keys(AlertObject).map(function(key, index) {
    let data = {};
    let check = false;
    for (let i = 0; i < checkBoxAlertkeys.length; i++) {
      if (checkBoxAlertkeys[i] == key) {
        check = true;
        break;
      }
    }
    data = {
      id: key,
      value: AlertObject[key],
      isChecked: check,
    };
    CheckBoxData.push(data);
  });
 
  return CheckBoxData;
}
export function isValidEmail(emailVal) {
  let isValid = true;
  if (emailVal.includes(",")) {
    return false;
  }
  let temp = emailVal;
  if (temp.includes(";")) {
    temp = emailVal.split(";");
    for (let i = 0; i < temp.length; i++) {
      isValid = /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(temp[i]);
      if (!isValid) {
        break;
      }
    }
  } else {
    isValid = /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(temp);
  }

  return isValid;
}
export function getRedirectURL(props) {
  let url = configurationFile.BASE_PROTO_PATH + "/snmp/viewer/latest";

  let prevLocation = props.historyInfo.location;
  if (
    prevLocation !== null &&
    prevLocation !== undefined &&
    prevLocation !== configurationFile.BASE_PROTO_PATH + "/login"
  ) {
    url = prevLocation;
  }
  if (props.auth.dbname === "athena") {
    url = url + "?dbname=athena";
  }
  let location = localStorage.getItem("Location");
  if (location) {
    if (!location.includes("login")) url = location;
  }
  return url;
}
export function getUserRole(component, Id) {
  let keys = Object.keys(permissionMap);
  let position = keys.indexOf(component);
  var jwt = require("jsonwebtoken");
  var decodedtoken = jwt.decode(localStorage.getItem("Authorization"), {
    complete: true,
  });
  let pArray = decodedtoken ? decodedtoken.payload["cognito:groups"] : null;
  let set = false;
  pArray
    ? pArray.map((permission, index) => {
        let groupId = localStorage.getItem("GroupId");
        if(Id){
          groupId=Id
        }
        if (permission.includes(groupId)) {
          permission = permission.split(":");
          permission = permission[permission.length - 1];
          permission = parseInt(permission);
          let result = permission >> position;
          if (result & 1) {
            set = true;
          }
        }
      })
    : null;
  return set;
}

export function convertIPtoDecimal(IP) {
  let decimalIP;
  let startipArray = [];
  let arrList = [];
  let decimalIPlist = [];
  try {
    startipArray = IP.split(".");
    decimalIPlist[0] = startipArray[0] * 16777216;
    decimalIPlist[1] = startipArray[1] * 65536;
    decimalIPlist[2] = startipArray[2] * 256;
    decimalIPlist[3] = startipArray[3];

    decimalIP =
      parseInt(decimalIPlist[0]) +
      parseInt(decimalIPlist[1]) +
      parseInt(decimalIPlist[2]) +
      parseInt(decimalIPlist[3]);
    arrList.push(true);
  } catch (e) {
    decimalIP = 0;
    arrList.push(false);
  }
  arrList.push(decimalIP);
  return arrList;
}

export function alertComponent(type, msg, txt) { 
  if (type === "delete") {
    return Swal.fire({
      title:
        `<i class="fa fa-exclamation-triangle" style="color:#C62E2E; aria-hidden="true"> </i>&nbsp${localization(null,"Are you sure?")}`,
      text:localization(null,txt),
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      cancelButtonText: `<i class="fa fa-thumbs-down"></i>${localization(null,'No')}`,
      cancelButtonAriaLabel: "Thumbs down",
      confirmButtonAriaLabel: "Thumbs up, great!",
      confirmButtonText: localization(null,'Yes'),
      width: 30 + "%",
    });
  } else if (type === "success") {
    return Swal.fire({
      type: "success",
      html: localization(null,msg),
      showConfirmButton: false,
      animation: false,
      confirmButtonText: localization(null,'OK'),
      confirmButton: "confirm-button-class",
      showCloseButton: true,
    });
  }else if (type === "successAgent") {
    let txtData= localization('',txt+" Created")
    return Swal.fire({
      title:
      `<i class="fa fa-exclamation-triangle" style="color:#4EBD74;margin-left:0px"; aria-hidden="true"> </i>&nbsp ${txtData} `,
      type: "success",
      html: `<b style='font-size:15px;text-align:left'>${localization(null,txt+" has been created successfully")}<br/> ${localization(null,msg)}</b>`,
      // text: `${txt} has been created successfully`,
      showConfirmButton: true,
      confirmButtonColor: "#4EBD74",
      confirmButtonText: localization(null,'OK'),
      animation: false,
      confirmButton: "confirm-button-class",
      showCloseButton: true,
    });
  }else if (type === "roleSuccess") {
    return Swal.fire({
      type: "success",
      html: localization(null,msg),
      // text: `${txt} has been created successfully`,
      showConfirmButton: true,
      confirmButtonText: localization(null,'OK'),
      confirmButtonColor: "#4EBD74",
      animation: false,
      confirmButton: "confirm-button-class",
      showCloseButton: true,
    });
  } else {
    return Swal.fire({
      type: "warning",
      html: localization(null,msg),
      showConfirmButton: true,
      confirmButtonText: localization(null,'OK'),
      animation: true,
      width: 30 + "%",
      customClass: {
        container: "container-class",
        popup: "popup-class",
        header: "header-class",
        title: "title-class",
        closeButton: "close-button-class",
        icon: "icon-class",
        image: "image-class",
        content: "content-class",
        input: "input-class",
        actions: "actions-class",
        confirmButton: "confirm-button-class",
        cancelButton: "cancel-button-class",
        footer: "footer-class",
      },
    });
  }
}
export class ActiveFormatter extends React.Component {
  render() {
    let obj = [];
          this.props.props.attachDetachInfo.data.map((agent, j) => {
              if (agent.parentAgentId === this.props.row.agentId) {
                obj[agent.agentType] = agent.agentSettings.triggerFromLauncher;
                  obj.push(
                  agent.agentType +
                  ":" +
                  agent.agentSettings.triggerFromLauncher +
                  ":" +
                  agent.agentSettings.agentName
                );
          }
          });
      
    

    let launcherStatusData = obj.map((item) => {
      item = item.split(":");
      return (
        <div>
          {item[1] === "true" ? (
            <span>
              <i className="fa fa-check" style={{ color: "#4EBD74" }} />{" "}
              {item[2]!='undefined' ? item[2] + "-" + item[0] : item[0]}
            </span>
          ) : (
            <span>
              <i className="fa fa-times" style={{ color: "#F86C6B" }} />{" "}
              {item[2]!='undefined' ? item[2] + "-" + item[0] : item[0]}
            </span>
          )}
        </div>
      );
    });
    return <div>{launcherStatusData}</div>;
  }
}

export class IdFormatter extends React.Component {
  render() {
    let launcherStatusData = this.props.cell.map((item) => {
      return (
        <div>
            <span>
             {item}
            </span>
        </div>
      );
    });
    return <div>{launcherStatusData}</div>;
  }
}