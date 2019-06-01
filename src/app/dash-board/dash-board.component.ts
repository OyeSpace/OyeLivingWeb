import { Component, OnInit } from '@angular/core';
import {DashBoardService} from './dash-board.service';
import {GlobalServiceService} from '../global-service.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.css']
})
export class DashBoardComponent implements OnInit {
  associations:any= [];
  allMemberByAccount=[];
  allTicketByAssociation=[];
  allVehicleListByAssn=[];
  accountID:string;
  totalMember:string;
  associationID:string;
  totalTickets:string;
  totalVehicles:string;
  AssociationAmountDue:boolean=false;
  memberDeatils:boolean=false;
  ticketDetails:boolean=false;
  vehicleDetails:boolean=false;
  currentAssociationName:string="Association Not Selected";
 

  constructor(private dashBrdService: DashBoardService, private appComponent:AppComponent,
     private globalService:GlobalServiceService) { }

  ngOnInit() {
    this.accountID="21";
    this.associationID="10";
    this.getAssociation();
    this.getMembers();
    this.getTickets();
    this.getVehicle();
  }

  getAssociation(){
    console.log(this.accountID);
    this.dashBrdService.getAssociation(this.accountID).subscribe(res => {
      //console.log(JSON.stringify(res));
      var data:any = res;
      this.associations = data.data.associationByAccount;
      });
  }

  getMembers(){
      this.dashBrdService.getMembers(this.accountID).subscribe(res => {
        //console.log(JSON.stringify(res));
        var data:any = res;
        this.allMemberByAccount = data.data.memberListByAccount;
        this.totalMember= data.data.memberListByAccount.length;
        });
  }

  getTickets(){
    this.dashBrdService.getTickets(this.associationID).subscribe(res => {
      //console.log(JSON.stringify(res));
      var data:any = res;
      this.allTicketByAssociation = data.data.ticketing;
      this.totalTickets= data.data.ticketing.length;
      });
  }

  getVehicle(){
      this.dashBrdService.getVehicle(this.associationID).subscribe(res => {
        //console.log(JSON.stringify(res));
        var data:any = res;
        this.allVehicleListByAssn = data.data.vehicleListByAssocID;
        this.totalVehicles= data.data.vehicleListByAssocID.length;
        });
  }

  loadAssociation(associationName:string){
    this.appComponent.myMenus=true;
    //console.log("Selected AssociationName: " + JSON.stringify(this.associations));
    this.currentAssociationName = associationName;
    this.associations.forEach(association => {
      if(association.asAsnName == associationName)
      {
        this.globalService.setCurrentAssociationId(association.asAssnID);
        this.globalService.setCurrentAssociationName(associationName);
        console.log("Selected AssociationId: " + this.globalService.getCurrentAssociationId());
      }
      
    });
    
  }

  assnAmountDue(){
  this.AssociationAmountDue=true;
  this.memberDeatils=false;
  this.ticketDetails=false;
  this.vehicleDetails=false;
  }

  members(){
    this.AssociationAmountDue=false;
    this.memberDeatils=true;
    this.ticketDetails=false;
    this.vehicleDetails=false;
  }

  tickets(){
    this.AssociationAmountDue=false;
    this.memberDeatils=false;
    this.ticketDetails=true;
    this.vehicleDetails=false;
  }

 vehicles(){
     this.vehicleDetails=true;
     this.AssociationAmountDue=false;
     this.memberDeatils=false;
     this.ticketDetails=false;
 }

}