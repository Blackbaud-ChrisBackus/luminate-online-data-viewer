dataViewerApp.factory('DonationService', ['WebServicesService', function(WebServicesService) {
  return {
    getDonations: function(options) {
      var _this = this, 
      settings = $.extend({
        page: '1',
        fault: $.noop, 
        success: $.noop, 
        complete: $.noop
      }, options || {});
      console.log(settings.pageSize);
      if(!settings.pageSize) {
        settings.pageSize = '200';
      }
      console.log(settings.pageSize);

      if(!settings.startDate || settings.startDate === '') {
        settings.startDate = moment().subtract(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ');
      }
      if(!settings.endDate || settings.endDate === '') {
        settings.endDate = moment(settings.startDate).add(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ');
      }
      
      WebServicesService.query({
        statement: 'select TransactionId, CampaignId, FormId, Comments,' + 
                   ' Payment.Amount, Payment.PaymentDate, Payment.TenderType, Payment.CreditCardType,' + 
                   ' Donor.ConsName.FirstName, Donor.ConsName.LastName,' + 
                   ' Donor.PrimaryEmail,' + 
                   ' Donor.HomeAddress.City, Donor.HomeAddress.State,' + 
                   ' Recognition.IsAnonymous,' +
                   ' RecurringPayment.OriginalTransactionId' + 
                   ' from Donation' + 
                   ' where Payment.PaymentDate &gt;= ' + settings.startDate + 
                   ' and Payment.PaymentDate &lt;=' + settings.endDate + 
                   (settings.campaignId && settings.campaignId !== '' ? (' and CampaignId = ' + settings.campaignId) : '') + 
                   (settings.formId && settings.formId !== '' ? (' and FormId = ' + settings.formId) : ''), 
        page: settings.page, 
        pageSize: settings.pageSize,
        error: function() {
          /* TODO */
        }, 
        success: function(response) {
          var $faultstring = $(response).find('faultstring');
          
          if($faultstring.length > 0) {
            settings.fault($faultstring.text());
          }
          else {
            var donations = [], 
            $records = $(response).find('Record');
            
            if($records.length === 0) {
              settings.success(donations);
            }
            else {
              $records.each(function() {
                var transactionId = $(this).find('TransactionId').text(), 
                campaignId = $(this).find('CampaignId').text(), 
                formId = $(this).find('FormId').text(), 
                paymentComments = $(this).find('Comments').text(), 
                $payment = $(this).find('Payment'), 
                $recognition = $(this).find('Recognition'), 
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
                isAnonymous = $recognition.find('IsAnonymous').text(), 
                $recurringPayment = $(this).find('RecurringPayment'), 
                originalTransactionId = transactionId, 
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
                
                var donation = {
                  'TransactionId': transactionId, 
                  'CampaignId': campaignId, 
                  'FormId': formId, 
                  'Comments' : paymentComments,
                  'IsAnonymous' : isAnonymous,
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
                
                if($recurringPayment.length > 0) {
                  originalTransactionId = $recurringPayment.find('OriginalTransactionId').text();
                  
                  donation.RecurringPayment = {
                    'OriginalTransactionId': originalTransactionId
                  };
                }
                
                donations.push(donation);
              });
              
              settings.success(donations);
            }
            
            console.log(settings.pageSize);
            if($records.length === settings.pageSize) {
              var nextPageSettings = $.extend({}, settings);
              
              nextPageSettings.page = '' + (Number(settings.page) + 1);
              
              _this.getDonations(nextPageSettings);
            }
            else {
              settings.complete();
            }
          }
        }
      });
    }
  };
}]);