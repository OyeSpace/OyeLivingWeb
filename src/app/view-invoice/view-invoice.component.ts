import { Component, OnInit, TemplateRef } from '@angular/core';
import { ViewInvoiceService } from '../services/view-invoice.service';
import { BlocksByAssoc } from '../models/blocks-by-assoc';
import { AssociationDetails } from '../models/association-details';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.css']
})
export class ViewInvoiceComponent implements OnInit {
  allBlocksByAssnID: BlocksByAssoc[];
  currentPage: number;
  pageSize: number;
  invoiceLists: any[];
  associationDetails: AssociationDetails;
  invoiceID: string;
  invoiceDate: Date;
  invoiceNumber: string;
  discountedValue: number;
  unitID: number;
  singleUnitDetails: object;
  OwnerFirstName: string;
  OwnerLastName: string;
  OwnerEmail: string;
  paymentDueDate: Date;
  previousDue: number;
  amountInWords: number;
  hasnumber: boolean;
  showGateWay: boolean;
  invValFinal: any;
  mainAmt: number;
  currentAssociationID: number;
  storeId: string;
  sharedSecret: string;
  charge: string;
  currency: string;
  timezone: Date;
  strPayOnly: string;
  strLanguage: string;
  strMerchantTransactionId: string;
  responseSuccessURL: string;
  responseFailURL: string;
  strTxntype: string;
  calculatedIPGUtilHash: string;
  blBlockID: string;
  modalRef: BsModalRef;
  asdPyDate: string;
  blMgrMobile: string;
  allLineItem: any[];
  subTotal: number;
  totals: number;
  dscntInvinvoiceID: number;
  dscntInvinvoiceNumber: number;
  dscntInvdescription: string;
  dscntInvdiscountedAmount: number;
  totalAmountForValidation: number;
  validationResult: boolean;
  blockid: number;
  p: number;
  isChecked:boolean;

  constructor(private viewinvoiceservice: ViewInvoiceService,
    private modalService: BsModalService,
    private toastr: ToastrService) {
    this.currentPage = 1;
    this.pageSize = 10;
    this.previousDue = 0.00;
    this.amountInWords = 0;
    this.hasnumber = false;
    this.showGateWay = false;
    this.currentAssociationID = 356;
    this.blBlockID = '';
    this.validationResult = true;
    this.p = 1;
    this.isChecked=false;
  }

  ngOnInit() {
    this.viewinvoiceservice.GetBlockListByAssocID()
      .subscribe(data => {
        this.allBlocksByAssnID = data;
        this.asdPyDate = this.allBlocksByAssnID[0]['asdPyDate'];
        this.blMgrMobile = this.allBlocksByAssnID[0]['blMgrMobile'];
        console.log('allBlocksByAssnID', this.allBlocksByAssnID);
      })
  }

  getCurrentBlockDetails(blBlockID) {
    this.blockid = blBlockID;
    console.log('blBlockID-' + blBlockID);
    this.viewinvoiceservice.getCurrentBlockDetails(blBlockID)
      .subscribe(data => {
        this.invoiceLists = data['data'].invoices;
        console.log('invoiceLists', this.invoiceLists);
      })
      this.isChecked=false;
  }

  viewInvoice1(template: TemplateRef<any>, inid, inGenDate, inNumber, inDsCVal, unUnitID) {
    console.log('inGenDate', inGenDate);
    console.log('inNumber', inNumber);
    console.log('inid', inid);
    console.log('inDsCVal', inDsCVal);
    console.log('unUnitID', unUnitID);

    this.invoiceID = inid;
    this.invoiceDate = inGenDate;
    this.invoiceNumber = inNumber;
    this.discountedValue = inDsCVal;
    this.unitID = unUnitID;
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'gray modal-lg' }));

    this.viewinvoiceservice.GetUnitListByUnitID(this.unitID)
      .subscribe(data => {
        console.log('GetUnitListByUnitID', data);
        this.singleUnitDetails = data['data'].unit;

        if (data['data'].unit.owner.length > 0) {
          this.OwnerFirstName = data['data']['unit'].owner[0].uofName;
          this.OwnerLastName = data['data']['unit'].owner[0].uolName;
          this.OwnerEmail = data['data']['unit'].owner[0].uoEmail;
        }

      })

    this.viewinvoiceservice.viewInvoice(this.blockid)
      .subscribe(data => {
        console.log('InvoiceDetails', data);
        //this.allLineItem = data['data'].invoiceDetails;
        //console.log(data['data'].invoiceDetails);
      },
        data => {
          console.log('InvoiceDetails', data);
        })

    this.viewinvoiceservice.GetAmountBalance(unUnitID)
      .subscribe(data => {
        console.log('GetAmountBalance', data);
        //$scope.previousDue = response.data.data.balanceDue;
      },
        data => {
          console.log('GetAmountBalance', data);
          //previousDue=parseFloat(0.00);
        })

    this.viewinvoiceservice.getassociationlist(this.asdPyDate, this.blMgrMobile)
      .subscribe(data => {
        console.log('associationDetails', data);
        this.associationDetails = data
      })

      this.viewinvoiceservice.invoiceDetails(inid,unUnitID);

  }

  totalAmountPaid(e?) {

    if (e != undefined) {
      e.preventDefault();
    }

    var total = this.previousDue;
    if (this.allLineItem != undefined) {
      for (var i = 0; i < this.allLineItem.length; i++) {
        var as = this.allLineItem[i].idValue;

        if (as == '' || as == null) {
          total;
          this.subTotal = total;
        } else {
          total += parseFloat(as);
          this.subTotal = total;

        }

      }
    }

    this.totals = total;
    total = total - this.discountedValue;
    this.amountInWords = Math.round(total);
    console.log('amountInWords', this.amountInWords);
    return total;
  }

  onButtonClick(amount) {
    this.mainAmt = amount;
    console.log(this.mainAmt);
    let flatCharges = this.mainAmt * 0.0189;
    console.log('Flat Charge', flatCharges);
    let gst = flatCharges * 0.18;
    console.log('gst', gst);
    let ravVal = this.mainAmt + flatCharges + gst + 1;//razorpay
    let invVal = this.mainAmt + flatCharges + gst + 0.04;//instamojo
    this.invValFinal = invVal.toFixed(2);//instamojo
    let ravValFinal = ravVal;//razorpay

    this.showGateWay = true;
  }

  iciciBank(e, iciciModal: TemplateRef<any>, invValFinal) {
    e.preventDefault();
    this.modalRef = this.modalService.show(iciciModal,
      Object.assign({}, { class: 'gray modal-lg' }));

    let iciciData = {
      "storeId": "3396020566",
      "strTxntype": "sale",
      "strPayOnly": "payonly",
      "strLanguage": "en_EN",
      "currency": "356",
      "sharedSecret": "Gq16esLoVw",
      "strMerchantTransactionId": "330995001_1",
      "charge": invValFinal,
      "responseSuccessURL": "https://demo.oyespace.com:8443/springAppConfig/success.jsp?param1=" + this.mainAmt + "&param2=" + this.invoiceNumber + "&param3=" + this.unitID + "&param4=" + this.currentAssociationID + "&param5=" + invValFinal,
      "responseFailURL": "http://demo.oyespace.com/response_fail.jsp"
    }

    this.viewinvoiceservice.springAppConfigPostAmount(iciciData)
      .subscribe(data => {
        // success
        console.log('success', data);
        this.storeId = data['storeId'];
        this.sharedSecret = data['sharedSecret'];
        this.charge = data['charge'];
        this.currency = data['currency'];
        this.timezone = data['timezone'];
        this.strPayOnly = data['strPayOnly'];
        this.strLanguage = data['strLanguage'];
        this.strMerchantTransactionId = data['strMerchantTransactionId'];
        this.responseSuccessURL = data['responseSuccessURL'];
        this.responseFailURL = data['responseFailURL'];
        this.strTxntype = data['strTxntype'];
        this.calculatedIPGUtilHash = data['calculatedIPGUtilHash'];
      });

  }

  discount(discount: TemplateRef<any>, inid, inNumber, inTotVal) {
    this.modalRef = this.modalService.show(discount,
      Object.assign({}, { class: 'gray modal-lg' }));

    console.log(inid, inNumber, inTotVal);
    this.dscntInvinvoiceID = inid;
    this.dscntInvinvoiceNumber = inNumber;
    this.dscntInvdescription = "Type Reason Here";
    this.dscntInvdiscountedAmount = inTotVal;
    this.totalAmountForValidation = inTotVal;
  }
  emptyDisplaytext() {
    this.dscntInvdescription = "";
  }
  checkDiscountedAmount(dscntInvdiscountedAmount) {
    var totalAmount = this.totalAmountForValidation;
    var discountedAmount = dscntInvdiscountedAmount;
    if (totalAmount < discountedAmount) {
      this.toastr.error('', 'Discounted Amount Cannot more than Total Amount', {
        timeOut: 3000
      });
    } else {
      this.validationResult = false;
    }
  }
  discountInvoice(dscntInvinvoiceNumber, dscntInvdiscountedAmount, dscntInvdescription) {
    console.log(dscntInvinvoiceNumber, dscntInvdiscountedAmount, dscntInvdescription);

    var discountData = {
      "INID": dscntInvinvoiceNumber,
      "IDDesc": dscntInvdiscountedAmount,
      "INDsCVal": dscntInvdescription
    }

    this.viewinvoiceservice.UpdateInvoiceDiscountValueAndInsert(discountData)
      .subscribe(data => {
        console.log(data);
      })
  }

  sendInvoiceInMail(inid) {
    console.log('inid', inid);
    this.viewinvoiceservice.GetInvoiceOwnerListByInvoiceId(inid)
      .subscribe(() => {
        swal.fire({
          title: "Mail Sent Successful",
          text: "",
          type: "success",
          confirmButtonColor: "#f69321",
          confirmButtonText: "OK"
        })
      },
        () => {
          swal.fire('Error', 'No Email Address to Send!', 'error')
        })
  }

  enableisChecked(){
        this.isChecked = true;
  }

  sendEmailToAll() {
    let chkboxs=document.querySelectorAll('.chkBox');
    let inids=[];
    chkboxs.forEach((item)=>{
     if(item['checked'] == true){
      inids.push(item['value'])
     }
    })
    //inids=inids.substring(0,inids.length-1);

    this.viewinvoiceservice.GetInvoiceOwnerListByInvoiceId(inids)
    .subscribe(() => {
      swal.fire({
        title: "Mail Sent Successful",
        text: "",
        type: "success",
        confirmButtonColor: "#f69321",
        confirmButtonText: "OK"
      })
    },
      () => {
        swal.fire('Error', 'No Email Address to Send!', 'error')
      })
  }

}
