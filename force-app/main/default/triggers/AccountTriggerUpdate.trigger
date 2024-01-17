trigger AccountTriggerUpdate on Account (after insert) {
    System.debug('AccountTriggerUpdate before update::'+Trigger.new);
    List<Account> accounts = new List<Account>([
        select Id, Name from Account 
        where Id in :Trigger.newMap.keySet()]);
    for(Account each :accounts){
        each.Name = 'test'+each.Name;
    }
    update accounts;
    System.debug('AccountTriggerUpdate post update::'+accounts);
}