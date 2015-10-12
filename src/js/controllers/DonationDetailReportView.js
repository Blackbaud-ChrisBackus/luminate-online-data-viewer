dataViewerControllers.controller('DonationDetailReportViewController', ['$scope', 'StorageService', 'WebServicesService', function($scope, StorageService, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $('#report-config-datepicker').daterangepicker({
    startDate: moment().subtract(1, 'days'), 
    endDate: moment(), 
    ranges: {
      'Last 24 Hours': [
        moment().subtract(1, 'days'), 
        moment()
      ], 
      'Today': [
        moment().startOf('day'), 
        moment()
      ], 
      'Yesterday': [
        moment().subtract(1, 'days').startOf('day'), 
        moment().subtract(1, 'days').endOf('day')
      ], 
      'Last 7 Days': [
        moment().subtract(6, 'days').startOf('day'), 
        moment()
      ], 
      'Last 30 Days': [
        moment().subtract(29, 'days').startOf('day'), 
        moment()
      ], 
      'This Month': [
        moment().startOf('month'), 
        moment()
      ], 
      'Last Month': [
        moment().subtract(1, 'month').startOf('month'), 
        moment().subtract(1, 'month').endOf('month')
      ]
    }, 
    timePicker: true
  }, function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
    $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });
  
  $scope.reportconfig = $.extend({
    datelabel: 'Last 24 Hours', 
    startdate: '', 
    enddate: '', 
    donationcampaign: '', 
    donationform: ''
  }, StorageService.getStoredData('reportconfig_donations_detail') || {});
  
  $scope.donationcampaigns = [];
  
  var addDonationCampaign = function(donationCampaign) {
    $scope.donationcampaigns.push(donationCampaign);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getDonationCampaigns = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {});
    
    WebServicesService.query({
      statement: 'select CampaignId, Title from DonationCampaign', 
      page: settings.page, 
      error: function() {
        /* TODO */
      }, 
      success: function(response) {
        var $faultstring = $(response).find('faultstring');
        
        if($faultstring.length > 0) {
          /* TODO */
        }
        else {
          var $records = $(response).find('Record');
          
          if($records.length === 0) {
            /* TODO */
          }
          else {
            $records.each(function() {
              var campaignId = $(this).find('CampaignId').text(), 
              campaignTitle = $(this).find('Title').text();
              
              var campaignData = {
                'CampaignId': campaignId, 
                'Title': campaignTitle
              };
              
              addDonationCampaign(campaignData);
            });
          }
          
          if($records.length === 200) {
            getDonationCampaigns({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            /* TODO */
          }
        }
      }
    });
  };
  
  getDonationCampaigns();
  
  $scope.donationforms = [];
  
  var addDonationForm = function(donationForm) {
    $scope.donationforms.push(donationForm);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getDonationForms = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {});
    
    WebServicesService.query({
      statement: 'select FormId, CampaignId, Title from DonationForm', 
      page: settings.page, 
      error: function() {
        /* TODO */
      }, 
      success: function(response) {
        var $faultstring = $(response).find('faultstring');
        
        if($faultstring.length > 0) {
          /* TODO */
        }
        else {
          var $records = $(response).find('Record');
          
          if($records.length === 0) {
            /* TODO */
          }
          else {
            $records.each(function() {
              var formId = $(this).find('FormId').text(), 
              campaignId = $(this).find('CampaignId').text(), 
              formTitle = $(this).find('Title').text();
              
              var formData = {
                'FormId': formId, 
                'CampaignId': campaignId, 
                'Title': formTitle
              };
              
              addDonationForm(formData);
            });
          }
          
          if($records.length === 200) {
            getDonationForms({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            /* TODO */
          }
        }
      }
    });
  };
  
  getDonationForms();
  
  $scope.donations = [];
  
  var addDonation = function(donation) {
    $scope.donations.push(donation);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getDonations = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'), 
    endDate = moment().format('YYYY-MM-DD[T]HH:mm:ssZ'), 
    campaignId, 
    formId;
    
    if($scope.reportconfig.startdate !== '') {
      startDate = $scope.reportconfig.startdate;
      
      if($scope.reportconfig.enddate !== '') {
        endDate = $scope.reportconfig.enddate;
      }
    }
    else if($scope.reportconfig.enddate !== '') {
      startDate = '1969-12-31T00:00:00';
      endDate = $scope.reportconfig.enddate;
    }
    
    if($scope.reportconfig.donationcampaign !== '') {
      campaignId = $scope.reportconfig.donationcampaign;
    }
    
    if($scope.reportconfig.donationform !== '') {
      formId = $scope.reportconfig.donationform;
    }
    
    WebServicesService.query({
      statement: 'select TransactionId, CampaignId, FormId,' + 
                 ' Payment.Amount, Payment.PaymentDate, Payment.TenderType, Payment.CreditCardType,' + 
                 ' Donor.ConsName.FirstName, Donor.ConsName.LastName, Donor.PrimaryEmail, Donor.HomeAddress.City, Donor.HomeAddress.State,' + 
                 ' RecurringPayment.OriginalTransactionId' + 
                 ' from Donation' + 
                 ' where Payment.PaymentDate &gt;= ' + startDate + ' and Payment.PaymentDate &lt;=' + endDate + 
                 (campaignId ? (' and CampaignId = ' + campaignId) : '') + 
                 (formId ? (' and FormId = ' + formId) : ''), 
      page: settings.page, 
      error: function() {
        /* TODO */
      }, 
      success: function(response) {
        $('.report-table').DataTable().destroy();
        
        var $faultstring = $(response).find('faultstring');
        
        if($faultstring.length > 0) {
          /* TODO */
        }
        else {
          var $records = $(response).find('Record');
          
          if($records.length === 0) {
            /* TODO */
          }
          else {
            $records.each(function() {
              var transactionId = $(this).find('TransactionId').text(), 
              campaignId = $(this).find('CampaignId').text(), 
              formId = $(this).find('FormId').text(), 
              $payment = $(this).find('Payment'), 
              paymentAmount = Number($payment.find('Amount').text()), 
              paymentAmountFormatted = paymentAmount.toLocaleString('en', {
                style: 'currency', 
                currency: 'USD', 
                minimumFractionDigits: 2
              }), 
              paymentDate = $payment.find('PaymentDate').text(), 
              paymentDateFormatted = moment(paymentDate).format('MM/DD/YYYY h:mma'), 
              paymentTenderType = $payment.find('TenderType').text(), 
              paymentTenderTypeFormatted = '', 
              paymentCreditCardType = $payment.find('CreditCardType').text(), 
              $donor = $(this).find('Donor'), 
              $donorName = $donor.find('ConsName'), 
              donorFirstName = $donorName.find('FirstName').text(), 
              donorLastName = $donorName.find('LastName').text(), 
              donorPrimaryEmail = $donor.find('PrimaryEmail').text(), 
              $donorHomeAddress = $(this).find('HomeAddress'), 
              donorHomeCity = $donorHomeAddress.find('City').text(), 
              donorHomeState = $donorHomeAddress.find('State').text(), 
              $recurringPayment = $(this).find('RecurringPayment'), 
              donationType = 'One-Time';
              
              switch(paymentTenderType.toLowerCase()) {
                case 'credit_card':
                  paymentTenderTypeFormatted = 'Credit';
                  break;
                case 'check':
                  paymentTenderTypeFormatted = 'Check';
                  break;
                case 'cash':
                  paymentTenderTypeFormatted = 'Cash';
                  break;
                case 'ach':
                  paymentTenderTypeFormatted = 'ACH';
                  break;
                case 'x_checkout':
                  if(paymentCreditCardType.toLowerCase() === 'paypal') {
                    paymentTenderTypeFormatted = 'PayPal';
                  }
                  else {
                    paymentTenderTypeFormatted = 'X-Checkout';
                  }
                  break;
              }
              
              if($recurringPayment.length > 0) {
                donationType = 'Sustaining';
              }
              
              var donationData = {
                'TransactionId': transactionId, 
                'CampaignId': campaignId, 
                'FormId': formId, 
                'Payment': {
                  'Amount': paymentAmount, 
                  '_AmountFormatted': paymentAmountFormatted, 
                  'PaymentDate': paymentDate, 
                  '_PaymentDateFormatted': paymentDateFormatted, 
                  'TenderType': paymentTenderType, 
                  '_TenderTypeFormatted': paymentTenderTypeFormatted
                }, 
                'Donor': {
                  'ConsName': {
                    'FirstName': donorFirstName, 
                    'LastName': donorLastName
                  }, 
                  'PrimaryEmail': donorPrimaryEmail, 
                  'HomeAddress': {
                    'City': donorHomeCity, 
                    'State': donorHomeState
                  }
                }, 
                '_DonationType': donationType
              };
              
              addDonation(donationData);
            });
          }
          
          $('.report-table').DataTable({
            'scrollX': true, 
            'paging': true, 
            'lengthChange': false, 
            'searching': false, 
            'ordering': true, 
            'order': [
              [9, 'desc']
            ], 
            'info': true, 
            'autoWidth': false
          });
          
          if($records.length === 200) {
            getDonations({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            $('.content .js--loading-overlay').addClass('hidden');
          }
        }
      }
    });
  };
  
  getDonations();
  
  $scope.refreshReport = function() {
    $scope.donations = [];
    
    $('.report-table').DataTable().destroy();
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getDonations();
  };
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_donations_detail', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Transaction ID,Campaign,Form,Donation Amount,First Name,Last Name,Email Address,City,State,Donation Date,Donation Type,Payment Type';
    $.each($scope.donations, function() {
      csvData += '\n' + 
                 this.TransactionId + ',' + 
                 this.CampaignId + ',' + 
                 this.FormId + ',' + 
                 this.Payment._AmountFormatted + ',' + 
                 '"' + this.Donor.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                 '"' + this.Donor.ConsName.LastName.replace(/"/g, '""') + '",' + 
                 this.Donor.PrimaryEmail + ',' + 
                 this.Donor.HomeAddress.City + ',' + 
                 this.Donor.HomeAddress.State + ',' + 
                 this.Payment._PaymentDateFormatted + ',' + 
                 this._DonationType + ',' + 
                 this.Payment._TenderTypeFormatted;
    });
    
    $('.js--report-save-as').off('change').on('change', function() {
      require('fs').writeFile($(this).val(), csvData, function(error) {
        if(error) {
          /* TODO */
        }
      });
    }).click();  
  };
}]);