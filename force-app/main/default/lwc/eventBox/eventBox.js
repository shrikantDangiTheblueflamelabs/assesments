import { LightningElement, api, track, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { refreshApex } from "@salesforce/apex";

import getEvents from "@salesforce/apex/CalendarController.getEvents";

export default class EventBox extends NavigationMixin(LightningElement) {
  @api
  dateSelected;

  @track
  monthlyEvents = [];

  @track
  dailyEvents = [];

  @api
  updateEvents(event) {
    this.monthlyEvents.push({
      Subject: event.subject,
      StartDateTime: new Date(event.startDateTime),
      EndDateTime: new Date(event.endDateTime),
      WhoId: event.whoId,
      WhatId: event.whatId,
      IsAllDayEvent: event.isAllDayEvent,
      Id: event.Id
    });

    this.setDailyEvents();
    refreshApex(this.eventsRecords);
  }

  get month() {
    if (!this.dateSelected) {
      return "empty";
    }
    return this.dateSelected.getMonth() + 1;
  }

  get year() {
    if (!this.dateSelected) {
      return "empty";
    }
    return this.dateSelected.getFullYear();
  }

  @wire(getEvents, { month: "$month", year: "$year" })
  processMonthlyEvents(eventsRecords) {
    this.eventsRecords = eventsRecords;
    const { data, error } = eventsRecords;
    this.noDailyEvents();
    if (data && data.length > 0) {
      this.monthlyEvents = data.map((evnt) => {
        let StartDateTime = new Date(evnt.StartDateTime);
        let EndDateTime = new Date(evnt.EndDateTime);
        return {
          ...evnt,
          StartDateTime,
          EndDateTime
        };
      });
      this.setDailyEvents();
    }
    if (error) {
      console.log("error retrieving events for ", this.month, this.year);
    }
  }

  noDailyEvents() {
    this.dailyEvents = [
      {
        startTime: "",
        endTime: "",
        eventMessage: "No Events",
        key: 1
      }
    ];
  }

  setDailyEvents() {
    try {
      if (this.monthlyEvents && this.monthlyEvents.length) {
        this.dailyEvents = this.monthlyEvents
          .filter(
            (evnt) =>
              evnt.StartDateTime.getDate() === this.dateSelected.getDate() &&
              evnt.StartDateTime.getMonth() === this.dateSelected.getMonth() &&
              evnt.StartDateTime.getFullYear() ===
                this.dateSelected.getFullYear()
          )
          .map((evnt) => {
            return {
              startTime: `${evnt.StartDateTime.getHours()}:${evnt.StartDateTime.getMinutes()}`,
              endTime: `${evnt.EndDateTime.getHours()}:${evnt.EndDateTime.getMinutes()}`,
              eventMessage: evnt.Subject,
              key: evnt.Id
            };
          });
      }
    } catch (error) {
      console.log("get events error", error);
    }
    if (!this.dailyEvents.length) this.noDailyEvents();
  }

  handleNavigation(event) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: event.currentTarget.dataset.key,
        objectApiName: "Event",
        actionName: "edit"
      }
    });
  }
}
