@RestResource(urlMapping='/LeadManager/*')
global with sharing class DemoRestApi {
  @HttpGet
  global static Lead getRecord() {
    try {
      Id leadId = Id.valueOf(
        RestContext.request.requestURI.substring(
          RestContext.request.requestURI.lastIndexOf('/') + 1
        )
      );
      System.debug('LeadManager:: getRecord: id=' + leadId);
      List<Lead> toReturn = [SELECT Id, Name FROM Lead WHERE Id = :leadId];
      System.debug('LeadManager:: getRecord: toReturn=' + toReturn);
      if (toReturn.isEmpty()) {
        return null;
      }
      return toReturn[0];
    } catch (StringException e) {
      System.debug(
        'failed to convert to Id ' +
        RestContext.request.requestURI.substring(
          RestContext.request.requestURI.lastIndexOf('/') + 1
        )
      );
      return null;
    } catch (Exception e) {
      System.debug('failed');
      return null;
    }
  }

  @HttpPost
  global static List<Lead> postRecords(List<Lead> leads) {
    try {
      System.debug(
        'LeadManager:: postRecords: leads size=' +
          leads.size() +
          ' first=' + leads[0] 
      );

      for (Lead aLead : leads) {
        aLead.DandbCompanyId = null;
        aLead.IndividualId = null;
        // aLead.CreatedById = null;
        // aLead.LastModifiedById = null;
        aLead.OwnerId = null;
        aLead.Id = null;
      }

      insert leads;
      return leads;
    } catch (DmlException e) {
      System.debug(
        'LeadManager:: postRecords: message=' +
          e.getMessage() +
          ' cause=' +
          e.getCause()
      );
      return new List<Lead>();
    }
  }
}
