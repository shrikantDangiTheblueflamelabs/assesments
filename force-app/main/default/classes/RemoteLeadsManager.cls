public with sharing class RemoteLeadsManager implements Queueable, Database.AllowsCallouts {
  List<Lead> leadsToCreate;
  public RemoteLeadsManager(List<Lead> leadsToCreate) {
    this.leadsToCreate = leadsToCreate;
  }

  public void makeCallout() {
    HttpRequest request = new HttpRequest();
    request.setEndpoint(
      'callout:firstConnectedAppOnExposer/services/apexrest/LeadManager'
    );
    request.setMethod('POST');
    request.setHeader('Content-Type', 'application/json');
    request.setBody('{ "leads": ' + JSON.serialize(this.leadsToCreate) + '}');
    System.debug('post body is : ' + request.getBody());

    Http h = new Http();
    HttpResponse response = h.send(request);
    System.debug(
      'response Status: ' +
        response.getStatusCode() +
        ' response body: ' +
        response.getBody()
    );
  }

  public void execute(QueueableContext context) {
    this.makeCallout();
  }
}
