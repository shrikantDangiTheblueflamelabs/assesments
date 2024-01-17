public with sharing class CalendarController {
  @AuraEnabled(cacheable=true)
  public static List<string> getEventsSubjectsPicklist() {
    try {
      List<String> picklistValues = new List<String>();

      // Get the global describe for the object
      Schema.DescribeSObjectResult objectDescribe = Schema.getGlobalDescribe()
        .get('Event')
        .getDescribe();

      // Get the field describe for the specified field
      Schema.DescribeFieldResult fieldDescribe = objectDescribe.fields.getMap()
        .get('Subject')
        .getDescribe();

      List<Schema.PicklistEntry> picklistEntries = fieldDescribe.getPicklistValues();
      for (Schema.PicklistEntry picklistEntry : picklistEntries) {
        picklistValues.add(picklistEntry.getLabel());
      }

      return picklistValues;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Account> getAccounts() {
    return [SELECT Id, Name FROM Account];
  }

  @AuraEnabled(cacheable=true)
  public static List<Contact> getContacts() {
    return [SELECT Id, Name, AccountId, Account.Name FROM Contact];
  }

  @AuraEnabled
  public static Id createEvent(
    String subject,
    Datetime startDateTime,
    Datetime endDateTime,
    Id whoId,
    Id whatId,
    Boolean isAllDayEvent
  ) {
    String z = ' ';
    System.debug(
      'createEvent: subject, startDateTime' + subject + z + startDateTime
    );
    System.debug(
      'createEvent: endDateTime whoId whatId isAllDayEvent' +
        endDateTime +
        z +
        whoId +
        z +
        whatId +
        z +
        isAllDayEvent
    );
    Event anEvent = new Event(
      Subject = subject,
      StartDateTime = startDateTime,
      EndDateTime = endDateTime,
      WhoId = whoId,
      WhatId = whatId,
      IsAllDayEvent = isAllDayEvent
    );
    try {
      insert anEvent;
      return anEvent.Id;
    } catch (Exception e) {
      System.debug('exception while inserting event ' + e.getMessage());
      return null;
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Event> getEvents(Integer month, Integer year) {
    try {
      Datetime fromDateTime = Datetime.newInstance(
        Date.newInstance(year, month, 1),
        Time.newInstance(0, 0, 0, 0)
      );
      Datetime tillDateTime = Datetime.newInstance(
        Date.newInstance(year, month + 1, 1),
        Time.newInstance(0, 0, 0, 0)
      );

      System.debug(
        'getEvents called : start end ' + fromDateTime + ' ' + tillDateTime
      );

      List<Event> z = [
        SELECT
          Id,
          Subject,
          StartDateTime,
          EndDateTime,
          WhoId,
          WhatId,
          IsAllDayEvent
        FROM Event
        WHERE StartDateTime >= :fromDateTime AND EndDateTime < :tillDateTime
      ];

      return z;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
