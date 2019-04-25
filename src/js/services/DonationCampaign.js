dataViewerApp.factory('DonationCampaignService', ['WebServicesService', function(WebServicesService) {
  var donationCampaignCache = [];
  
  return {
    getDonationCampaigns: function(options) {
      var _this = this, 
      settings = $.extend({
        page: '1', 
        fault: $.noop, 
        success: $.noop, 
        complete: $.noop
      }, options || {});
      
      if(Number(settings.page) === 1 && donationCampaignCache.length > 0) {
        settings.success(donationCampaignCache);
        
        settings.complete();
      }
      else {
        WebServicesService.query({
          statement: 'select CampaignId, Title, Description, Type, Goal, CurrentlyRaisedAmount' + 
                     ' from DonationCampaign' + 
                     ' where IsArchived = \'false\'', 
          page: settings.page, 
          error: function() {
            /* TODO */
          }, 
          success: function(response) {
            console.log(response);
            var $faultstring = $(response).find('faultstring');
            
            if($faultstring.length > 0) {
              settings.fault($faultstring.text());
            }
            else {
              var donationCampaigns = [], 
              $records = $(response).find('Record');
              
              if($records.length === 0) {
                settings.success(donationCampaigns)
              }
              else {
                $records.each(function() {
                  var campaignId = $(this).find('CampaignId').text(), 
                  campaignTitle = $(this).find('Title').text(),
                  campaignDescription = $(this).find('Description').text(),
                  campaignType = $(this).find('Type').text(),
                  campaignGoal = $(this).find('Goal').text(),
                  campaignRaised = $(this).find('CurrentlyRaisedAmount').text();
                  
                  var donationCampaign = {
                    'CampaignId': campaignId, 
                    'Title': campaignTitle,
                    'Description' : campaignDescription,
                    'Type' : campaignType,
                    'Goal' : campaignGoal,
                    'CurrentlyRaisedAmount' : campaignRaised
                  };
                  
                  donationCampaigns.push(donationCampaign);
                  
                  donationCampaignCache.push(donationCampaign);
                });
                
                settings.success(donationCampaigns);
              }
              
              if($records.length === 200) {
                var nextPageSettings = $.extend({}, settings);
                
                nextPageSettings.page = '' + (Number(settings.page) + 1);
                
                _this.getDonationCampaigns(nextPageSettings);
              }
              else {
                settings.complete();
              }
            }
          }
        });
      }
    }
  };
}]);