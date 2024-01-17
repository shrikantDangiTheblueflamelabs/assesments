trigger LeadTrigger on Lead (after insert) {
    System.debug('inserting with handler');
    LeadHandler handler = new LeadHandler();
    handler.process();
}