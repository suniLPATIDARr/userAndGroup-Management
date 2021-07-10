import React, { Component } from 'react';
import { Label, Button, Card, CardBody, CardHeader, Col, Dropdown, DropdownItem,
DropdownMenu, DropdownToggle, Row,FormGroup} from 'reactstrap';
import { Redirect } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { injectIntl } from "react-intl";
import {configurationFile} from "../../../../../utils/config";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as qs from "qs"
import moment from 'moment';
import Loading from 'react-loading';
import { Bar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import {getUserRole,deleteAllSnmpLatest,pageReloadSnmp, dataExportSnmp,getUnique, getGraphBarData,getGraphBarLabels,alertComponent} from '../../../Common/Common';
class LatestViewer extends Component {
  constructor(props) {
    super(props);
    this.deviceDetail="";
    this.toggleColumn = this.toggleColumn.bind(this);         
    this.state = {
      radioSelected: 2,
      isDataFetched: false,
      dbname: 'dynamo',
      title:  'Latest Viewer',
      dropdownColumnOpen: false,
      selectedColumn: "Total Mono",
      sizePerPage: 50,
      iotData:"",  
      redirectFlag:false,
      deviceData:false  
    };
  }
  toggleColumn(event) {
    this.setState(prevState => ({
      dropdownColumnOpen: !prevState.dropdownColumnOpen
    }));
  }
  componentDidMount() {
    if( this.props.groupInfo.data.length===0){ 
      this.props.getGroupList(null,null, null);
      } 
    this.props.getAgentSettings()
    this.props.getDynamoLatestViewer(null, null)
  } 
  
componentWillUnmount(){
  this.setState({ iotData: "" });
}  
  static getDerivedStateFromProps(props, state){
   
    //if(props.auth.isIOTActive === true){
   
      let datas=[];     
      if(props.auth.data){
        if(state.iotData.length >= 1){
          datas=state.iotData;
        }             
        const iotData=props.auth.data;
        const strMeterReadingLocal = iotData.lambdaRecievedTime
        const strClosingDateLocal = iotData.timestamp
        let data = {
          serialNumber: iotData.serialnumber,
          modelName: iotData.modelname,
          ipAddress: iotData.ipaddress,
          closing: strClosingDateLocal,
          meterReading: strMeterReadingLocal,
          monochrome: parseInt(iotData.monochrome === undefined || iotData.monochrome === null ? 0 : iotData.monochrome),
          color: parseInt(iotData.fullcolor === undefined || iotData.fullcolor === null ? 0 : iotData.fullcolor)
        }
        data.total = data.monochrome + data.color;
        const k = iotData.tonarresidualbk;
        const c = iotData.tonarresidualc;
        const m = iotData.tonarresidualm;
        const y = iotData.tonarresidualy;
        data.tonarResidualCMYK = '';
        data.tonarResidualCMYK += k || '-';
        data.tonarResidualCMYK += '/';
        data.tonarResidualCMYK += c || '-';
        data.tonarResidualCMYK += '/';
        data.tonarResidualCMYK += m || '-';
        data.tonarResidualCMYK += '/';
        data.tonarResidualCMYK += y || '-';
        datas.push(data);                   
        datas=getUnique(datas,'serialNumber');       
        return { iotData:datas};
      } else{
        return { iotData:""}
      }
    //}
  }
  _setTableOption() {
    //const style = {'text-align':'center'};
    if ((this.props.latestSnmpReport.status === "requesting" || this.props.permissions.status === "requesting" || this.props.groupInfo.status === "requesting")&& this.props.auth.renewstatus!=="requesting") {
      return <div><Loading type='spin' color='#66cccc' height='3%' width='3%' /> </div>;
    } else {
      return  <FormattedMessage
      id="No records found"
      defaultMessage="No records found"
    /> ;
    }
  }
  reload() {
    this.setState({
      iotData:""
    })
    pageReloadSnmp(null,this.state.dbname,{...this.props});
    this.props.auth.data=undefined
  }
  deleteAll(){
    alertComponent("delete","","You want to delete data").then((result)=>{
      if(result.value){
        deleteAllSnmpLatest(null,this.state.dbname,{...this.props});  
        this.props.auth.data=null
        this.setState({
          iotData:""
        })
      }})
  }
  scanLatestSnmpReport=()=>{
    
  let dbName = this.state.dbname;
  let agentData;
  let agentIds=[]
  agentData= this.props.agentInfo.data?this.props.agentInfo.data:null

  agentData?agentData.map(item=>{
    if(item.agentType==="AGENT_MIB"){
      agentIds.push(item.agentSettings.agentId)
    }
  }):null 
    if(dbName === 'dynamo' && agentData){
      console.log('agentIds',agentIds)
       this.props.scanSnmpLatestData(null,this.state.dbname,agentIds);
    }    
  }
  export() {
    //dataExportSnmp(null,this.state.dbname,{...this.props});
    this.props.getAthenaStatusSNMP(
      'rmr',
      'athena',
      "csv",
      this.state.machineCode,
      this.defaultSerialNumber,
      null     

    );
  }
  onPageChange(page, sizePerPage) {
    this.setState({
      currentPage: page
    });
    // var offSet = (page - 1) * sizePerPage + 1;
    //alert(`page: ${page}, sizePerPage: ${sizePerPage},OffSet:${offSet}`);
    // this.props.getStatus(null, this.state.dbname, offSet, sizePerPage);
  }
  onSizePerPageList(page) {
    this.setState({ sizePerPage: page });
    this.setState({
      currentPage: 1
    });
    // this.props.getStatus(null, this.state.dbname, null, page);
  }
  selectColumn(e) {
    console.log(e.currentTarget.textContent);
    this.setState({ selectedColumn: e.currentTarget.textContent })
  }
  changePageSize(page) {
    this.setState({ sizePerPage: page });
    this.setState({
      currentPage: 1
    });
    //this.props.getAthenaStatus(null,this.state.dbname,page);
    var queryExecutionId = sessionStorage.getItem("queryExecutionId");
    this.props.getAthenaResults(null, queryExecutionId, null, null, page);
  }
  previousPage() {
    let query = qs.parse(this.props.location.search.substr(1));
    const nextTokenList = this.props.latestSnmpReport.paginationList;
    const currentPage = this.props.latestSnmpReport.currentPage;
    var token = null;
    if (nextTokenList.length > 0) {
      if (currentPage == 1) {
        this.props.latestSnmpReport.paginationList = [];
      }
      else if (currentPage == nextTokenList.length) {
        token = nextTokenList[currentPage - 2].value;
      }
      else {
        if (nextTokenList.length > 0) {
          this.props.latestSnmpReport.paginationList.splice(nextTokenList.length - 1, 1);
          token = nextTokenList[currentPage - 1].value;
        }
      }
    }
    if (this.state.dbname === "dynamo") {
      this.props.getDynamoLatestViewer(query.report, token, "prev")
    }
    /*else {
      if (queryExecutionId) {
        this.props.getAthenaResults(query.report, queryExecutionId, "prev", token, this.state.sizePerPage)
      }
    }  */
  }

  nextPage() {
    let query = qs.parse(this.props.location.search.substr(1));
    const nextTokenList = this.props.latestSnmpReport.paginationList;
    const currentPage = this.props.latestSnmpReport.currentPage;
    if (this.state.dbname == "dynamo") {
      this.props.getDynamoLatestViewer(query.report, nextTokenList[currentPage].value, "next")
    }
    /*else {
      if (queryExecutionId) {
        this.props.getAthenaResults(query.report, queryExecutionId, "next", nextTokenList[currentPage].value, this.state.sizePerPage)
      }
    }   */
  }
  renderPageDropDown(dbname) {
    if (dbname === 'dynamo') {
      return (<div className="col-md-6 col-xs-6 col-sm-6 col-lg-6">
      </div>)
    } 
  }
  rowClickHandeler(row){    
    this.props.getDeviceDetail(row.modelName,row.serialNumber)
    this.deviceDetail=new Buffer(row.modelName+"_"+row.serialNumber+"_"+localStorage.getItem("GroupId")).toString('base64');
    this.setState({
      redirectFlag:true,
    })
  }
  render() {
    const loadingStyle={position:"absolute",marginLeft:40+"%",marginTop:10+"%",opacity:1}
    let datas = [];    
    let selectedColumn = this.state.selectedColumn;
    let barDatas = [];
    let barLabels = [];
    let dbname = this.state.dbname;
    const st = this.props.latestSnmpReport.report;    
    const totalCount = this.props.latestSnmpReport.pageCount;
    var athenaPagelen = 0;
    var currentPageVal = this.props.latestSnmpReport.currentPage;    
    if (st) {
      dbname = this.state.dbname;
      if (this.props.latestSnmpReport.paginationList) {
        athenaPagelen = this.props.latestSnmpReport.paginationList.length;
      }
      else {
        if (this.props.latestSnmpReport.currentPage == 0) {
        }
      }
      // const diffFromUTC = moment().utcOffset();
      for (let i = 0; i < st.length; i++) {
        const diffFromUTC = moment().utcOffset(); 
        const meterReadingUTC = moment.utc(st[i].lambdaRecievedTime).add(diffFromUTC, 'minutes'); 
        const strMeterReadingLocal = meterReadingUTC.format('YYYY-MM-DD HH:mm:ss');
        const closingDateUTC = moment(st[i].closingdate);
        const closingDateLocal = closingDateUTC.add(diffFromUTC, 'minutes');
        const strClosingDateLocal = closingDateLocal.format('YYYY-MM-DD HH:mm:ss');
          
        let data = {
          serialNumber: st[i].serialnumber,
          modelName: st[i].modelname,
          ipAddress: st[i].ipaddress,
          closing: strClosingDateLocal,
          meterReading: strMeterReadingLocal,
          monochrome: parseInt(st[i].monochrome === undefined || st[i].monochrome === null ? 0 : st[i].monochrome),
          color: parseInt(st[i].fullcolor === undefined || st[i].fullcolor === null ? 0 : st[i].fullcolor)
        }
        data.total = data.monochrome + data.color;
        const k = st[i].tonarresidualbk;
        const c = st[i].tonarresidualc;
        const m = st[i].tonarresidualm;
        const y = st[i].tonarresidualy;
        data.tonarResidualCMYK = '';
        data.tonarResidualCMYK += k || '-';
        data.tonarResidualCMYK += '/';
        data.tonarResidualCMYK += c || '-';
        data.tonarResidualCMYK += '/';
        data.tonarResidualCMYK += m || '-';
        data.tonarResidualCMYK += '/';
        data.tonarResidualCMYK += y || '-';

        datas.push(data);                
        barDatas.push(selectedColumn === <FormattedMessage
          id={selectedColumn}
          defaultMessage={selectedColumn}
        /> ? data.monochrome : data.color);
        barLabels.push(data.serialNumber);
      }      
    }
    if(this.state.iotData !== null && this.state.iotData !== undefined && this.state.iotData.length >=1){
      datas.push(...this.state.iotData); 
          datas=getUnique(datas,'serialNumber'); 
    } 
    barDatas=getGraphBarData(datas,this.state.selectedColumn);
    barLabels=getGraphBarLabels(datas);
    let tableOtions = {
      onRowClick:this.rowClickHandeler.bind(this),
      onPageChange: this.onPageChange.bind(this),
      onSizePerPageList: this.onSizePerPageList.bind(this),
      noDataText: this._setTableOption(),
      sizePerPage: this.state.sizePerPage,
      page: this.state.currentPage
    };

    let buttonStyle = {
      marginRight: '10px',
      marginTop:0,
      minWidth:100,
    };
    let buttonActiveFlag;
    if(this.props.latestSnmpReport.report){
      buttonActiveFlag =this.props.auth.data!==undefined && this.props.auth.data!==null || this.props.latestSnmpReport.report.length>0
    }else{
      buttonActiveFlag =this.props.auth.data!==undefined && this.props.auth.data!==null
    }
    //Latest viewer
    const options = {
      tooltips: {
        enabled: false,
        custom: CustomTooltips
      },
      maintainAspectRatio: false
    }
    let tableStyle = {
      cursor: "pointer"
      };
  
const { intl } = this.props;

  const bar = {
      labels: barLabels,
      datasets: [
        {
          label:  intl.formatMessage({
            id: `Total Count: ${selectedColumn == 'Total Mono' ? 'Black & White' : 'Full Color'}`,
          }),
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: barDatas
        },
      ],
    };    
     const deleteButtonFlag= getUserRole('group.delete')
     const scanButtonFlag= getUserRole('group.update')
    let hideElement={
      display:"none"
    }
    const columnSelectors = [ "Total Mono",
    "Total Color"
  ];
    return (
      <div style = {{position:'relative'}} className="animated fadeIn">
        <Card>
          <CardHeader>
            <i className="fa fa-align-justify"></i><strong>
            <FormattedMessage
                            id="Visualizer"
                            defaultMessage="Visualizer"
                          /> 
            </strong>
            <div className="card-header-actions">
              {/*<a href="http://www.chartjs.org" className="card-header-action">
              <small className="text-muted">docs</small>
            </a>*/}
            </div>
          </CardHeader>
          <CardBody>
            <Row>
            {this.state.redirectFlag ? (
                    <Redirect
                    push
                    to={`${configurationFile.BASE_PROTO_PATH}/snmp/viewer/latest/id=${this.deviceDetail}`}
                    />
                ) : null}
              <Col sm="1" className="d-none d-sm-inline-block">
                <Label htmlFor="select">
                <FormattedMessage
                            id="Target Column:"
                            defaultMessage="Target Column:"
                          /> 
                </Label>
              </Col>
              <Col sm="1" className="d-none d-sm-inline-block">
                <Dropdown size="sm" isOpen={this.state.dropdownColumnOpen} toggle={this.toggleColumn}>
                  <DropdownToggle caret>
                  <FormattedMessage
                            id={selectedColumn}
                            defaultMessage={selectedColumn}
                          />
                  </DropdownToggle>
                  <DropdownMenu>
                    {columnSelectors.map((x) => {
                      return (<DropdownItem key={x} onClick={this.selectColumn.bind(this)}>
                        <FormattedMessage
                            id={x}
                            defaultMessage={x}
                          />
                      </DropdownItem>)
                    })}
                  </DropdownMenu>
                </Dropdown>
              </Col>
            </Row>
            <div className="chart-wrapper">
              <Bar data={bar} options={options} />
            </div>
          </CardBody>
        </Card>

        <Row style = {{position:'relative'}}>
          <Col xs="12">
            <Card>
              <div><CardHeader className="border-none">
                <Col className="d-inline-block">
                <i className="fa fa-align-justify"></i> <strong> <FormattedMessage
      id={this.state.title}
      defaultMessage={this.state.title}
    /></strong>
                </Col><br/><br/>
                <Col >
                {/* <div className="card-header-actions">
                  {/*<a href="https://reactstrap.github.io/components/tables/" rel="noreferrer noopener" target="_blank" className="card-header-action">
                    <small className="text-muted">docs</small>
                  </a>*/}
                {/* </div> */} 
                </Col>
              </CardHeader>
                <CardBody>
                <FormGroup row>
                    <Col xs='1'  md="12">
                      <div className="text-right mt-2 mb-2">
                        <Button type="submit" size="sm" color="success" className="text-center" style={buttonStyle} onClick={() => this.reload()}><i className="fa fa-refresh"></i>
                        <FormattedMessage
                            id="Reload"
                            defaultMessage="Reload"
                          /> </Button>
                        <Button type="reset" size="sm" color="primary" className="text-center" style={buttonStyle} onClick={() => this.export()}><i className="fa fa-floppy-o"></i>
                        <FormattedMessage
                            id="Export"
                            defaultMessage="Export"
                          /> </Button>
                        <Button type="reset" size="sm" color="danger" className="text-center" disabled={!buttonActiveFlag} style={deleteButtonFlag?buttonStyle:hideElement} onClick={() => this.deleteAll()}><i className="fa fa-trash"></i>
                        <FormattedMessage
                            id="Delete"
                            defaultMessage="Delete"
                          /> </Button>
                        <Button type="reset" size="sm" color="success" className="text-center" style={scanButtonFlag?buttonStyle:hideElement} onClick={() => this.scanLatestSnmpReport()}><i className="fa fa-search"></i> 
                        <FormattedMessage
                            id="Scan"
                            defaultMessage="Scan"
                          /> </Button>
                      </div>
                    </Col>
                  </FormGroup>
                  <div className="align-items-center">
                    {dbname === 'redshift' ?
                      (<BootstrapTable ref='table'  bodyStyle={{ cursor: "pointer" }} data={datas} multiColumnSort={2} pagination remote={true} fetchInfo={{ dataTotalSize: parseInt(totalCount) }}
                        options={tableOtions}>
                        <TableHeaderColumn dataField='modelName' onHover={tableStyle} dataSort={true}>
                        <FormattedMessage
                            id="Model"
                            defaultMessage="Model"
                          /> 

                        </TableHeaderColumn>
                        <TableHeaderColumn dataField='serialNumber' isKey={true} dataSort={true}>
                        <FormattedMessage
                            id="Serial Number"
                            defaultMessage="Serial Number"
                          /> 
                          </TableHeaderColumn>
                        <TableHeaderColumn dataField='ipAddress' dataSort={true} dataSort={true}>
                        <FormattedMessage
                            id="Ip Adress"
                            defaultMessage="Ip Adress"
                          /> 
                        </TableHeaderColumn>
                        <TableHeaderColumn dataField='closing' dataSort={true}>
                        <FormattedMessage
                            id="As Of"
                            defaultMessage="As Of"
                          /> 
                        </TableHeaderColumn>
                        <TableHeaderColumn dataField='meterReading' dataSort={true}>
                        <FormattedMessage
                            id="Meter Reading"
                            defaultMessage="Meter Reading"
                          /></TableHeaderColumn>
                        <TableHeaderColumn dataField='color' dataSort={true}>
                           <FormattedMessage 
                            id="Total Count:Full Color"
                            defaultMessage="Total Count:Full Color"
                          /> </TableHeaderColumn>
                        <TableHeaderColumn dataField='monochrome' dataSort={true}>
                        <FormattedMessage
                            id="Total Count:black & White"
                            defaultMessage="Total Count: & White"
                          /></TableHeaderColumn>
                        <TableHeaderColumn dataField='tonarResidualCMYK' dataSort={true}>
                        <FormattedMessage
                            id="Total Residual K/C/M/Y"
                            defaultMessage="Total Residual K/C/M/Y"
                          /></TableHeaderColumn>
                      </BootstrapTable>) :
                      <BootstrapTable ref='table'  bodyStyle={{ cursor: "pointer" }} data={datas}  multiColumnSort={2} options={tableOtions}>
                        <TableHeaderColumn dataField='modelName' onHover={tableStyle} dataSort={true}>
                        <FormattedMessage
                            id="Model"
                            defaultMessage="Model"
                          /> 
                        </TableHeaderColumn>
                        <TableHeaderColumn dataField='serialNumber' isKey={true} dataSort={true}>
                        <FormattedMessage
                            id="Serial Number"
                            defaultMessage="Serial Number"
                          /> 
                        </TableHeaderColumn>
                        <TableHeaderColumn dataField='ipAddress' dataSort={true} dataSort={true}>
                        <FormattedMessage
                            id="Ip Address"
                            defaultMessage="Ip Address"
                          /> </TableHeaderColumn>
                        <TableHeaderColumn dataField='closing' dataSort={true}> <FormattedMessage
                            id="As Of"
                            defaultMessage="As Of"
                          /></TableHeaderColumn>
                        <TableHeaderColumn dataField='meterReading' dataSort={true}>
                        <FormattedMessage
                            id="Meter Reading"
                            defaultMessage="Meter Reading"
                          />
                        </TableHeaderColumn>
                        <TableHeaderColumn dataField='color' dataSort={true}>
                        <FormattedMessage
                            id="Total Count: Full Color"
                            defaultMessage="Total Count: Full Color"
                          /></TableHeaderColumn>
                        <TableHeaderColumn dataField='monochrome' dataSort={true}>
                        <FormattedMessage
                            id="Total Count: Black & White"
                            defaultMessage="Total Count: Black & White"
                          /></TableHeaderColumn>
                        <TableHeaderColumn dataField='tonarResidualCMYK' dataSort={true}>
                        <FormattedMessage
                            id="Total Residual K/C/M/Y"
                            defaultMessage="Total Residual K/C/M/Y"
                          /></TableHeaderColumn>
                      </BootstrapTable>
                    }
                    {dbname !== 'redshift' ?
                      (<div className="row" >
                        {this.renderPageDropDown(dbname)}
                        <div className="col-md-6 col-xs-6 col-sm-6 col-lg-6" >
                          <div className="text-right mt-2 mb-2">
                            {this.props.latestSnmpReport.paginationList && currentPageVal != 0 ?
                              (<Button color="primary" className="text-right" onClick={() => this.previousPage()} style={buttonStyle}><i className="fa fa-chevron-left"></i> 
                               <FormattedMessage
                            id="Previous"
                            defaultMessage="Previous"
                          />
                               </Button>)
                              : <Button color="primary" className="text-right" onClick={() => this.previousPage()} style={buttonStyle} disabled> <i className="fa fa-chevron-left"> 
                               <FormattedMessage
                            id="Previous"
                            defaultMessage="Previous"
                          /> </i></Button>
                            }

                            {this.props.latestSnmpReport.paginationList && (this.props.latestSnmpReport.paginationList.length > 0) && currentPageVal != this.props.latestSnmpReport.paginationList.length ?
                              (<Button color="primary" className="text-right" onClick={() => this.nextPage()} > <FormattedMessage
                              id="Next"
                              defaultMessage="Next"
                            /> <i className="fa fa-chevron-right"></i></Button>)
                              : <Button color="primary" className="text-right" onClick={() => this.nextPage()} disabled> 
                               <FormattedMessage
                            id="Next"
                            defaultMessage="Next"
                          /> <i className="fa fa-chevron-right"></i></Button>
                            }
                          </div>
                        </div></div>)
                      : null
                    }
                  </div>
                </CardBody></div>
            </Card>
          </Col>
          {this.props.auth.renewstatus==="requesting"?(
             <Col style={loadingStyle}>
             <Loading
             type="spin"
             color="black"
             height="10%"
             width="10%"
           /> 
        </Col>

          ):null}
        </Row>
        
      </div>
    );
  }
}

export default injectIntl(LatestViewer);