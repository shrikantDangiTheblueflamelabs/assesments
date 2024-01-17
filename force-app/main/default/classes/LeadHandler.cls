public with sharing class LeadHandler {
  private List<Lead> triggerNew;
  private List<Lead> triggerOld;
  private Map<Id, Lead> triggerMapNew;
  private Map<Id, Lead> triggerMapOld;

  public LeadHandler() {
    this.triggerOld = (List<Lead>) Trigger.old;
    this.triggerNew = (List<Lead>) Trigger.new;
    this.triggerMapNew = (Map<Id, Lead>) Trigger.newMap;
    this.triggerMapOld = (Map<Id, Lead>) Trigger.oldMap;
  }

  @future(callout=true)
  public static void remoteLeads(List<Id> leadIds) {
    List<String> fields = new List<String>();
    for (LeadFieldsToSync__mdt each : LeadFieldsToSync__mdt.getAll().values()) {
      fields.add(each.LeadFieldName__c);
    }

    String query =
      'Select ' +
      String.join(fields, ', ') +
      ' from Lead where Id in :leadIds';
    System.debug('query is: ' + query);
    List<Lead> leadsToCreate = Database.query(String.escapeSingleQuotes(query));
    System.debug('fetched leads: ' + leadsToCreate);

    HttpRequest request = new HttpRequest();
    request.setEndpoint(
      'callout:firstConnectedAppOnExposer/services/apexrest/LeadManager'
    );

    request.setMethod('POST');
    request.setHeader('Content-Type', 'application/json');
    request.setBody('{ "leads": ' + JSON.serialize(leadsToCreate) + '}');
    System.debug('post body is : ' + request.getBody());

    Http protocol = new Http();
    HttpResponse response = protocol.send(request);
    System.debug(
      'response Status: ' +
        response.getStatusCode() +
        ' response body: ' +
        response.getBody()
    );
  }

  public void onAfterInsert() {
    System.debug('leads being sent are: ' + this.triggerNew);
    remoteLeads(new List<Id>(this.triggerMapNew.keySet()));
  }

  public void process() {
    System.debug('process operationType' + Trigger.operationType);
    if (Trigger.isExecuting) {
      switch on Trigger.operationType {
        when AFTER_INSERT {
          this.onAfterInsert();
        }
      }
    }
  }
}
