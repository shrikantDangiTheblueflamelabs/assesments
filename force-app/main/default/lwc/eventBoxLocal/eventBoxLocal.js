import { LightningElement, api, track, wire } from "lwc";
// import getEvents from "@salesforce/apex/CalendarController.getEvents";

export default class EventBox extends LightningElement {
  @api
  dateSelected;

  // @track
  // dailyEvents;

  dailyEvents = [
    {
      startTime: "sample start",
      endTime: "sample end",
      eventMessage: "sample message long",
      key: 1
    }
  ];

  get month() {
    if (!this.dateSelected) {
      console.log("no date Selected");
      return "empty";
    }
    return this.dateSelected.getMonth() + 1;
  }

  get year() {
    if (!this.dateSelected) {
      console.log("no date Selected");
      return "empty";
    }
    return this.dateSelected.getFullYear();
  }

  connectedCallback() {
    console.log("connectedCallback:evbox dateSelected: ", this.dateSelected);
  }

  renderedCallback() {
    console.log("evbox renderedCallback: ", this.dateSelected);
  }

  // @wire(getEvents, { month: "$month", year: "$year" })
  // processMonthlyEvents({ data, error }) {
  //   if (data && data.length > 0) {
  //     this.monthlyEvents = data.map((evnt) => {
  //       console.log(evnt);
  //       let StartDateTime = new Date(evnt.StartDateTime);
  //       let EndDateTime = new Date(evnt.EndDateTime);
  //       return {
  //         ...evnt,
  //         StartDateTime,
  //         EndDateTime
  //       };
  //     });
  //     this.setDailyEvents();
  //   }
  //   if (error) {
  //     console.log("error retrieving events for ", this.month, this.year);
  //   }
  // }

  setDailyEvents() {
    try {
      if (this.monthlyEvents && this.monthlyEvents.length) {
        this.dailyEvents = this.monthlyEvents
          .filter(
            (evnt) =>
              evnt.StartDateTime.getDate() === this.dateSelected.getDate()
          )
          .map((evnt) => {
            return {
              startTime: `${evnt.StartDateTime.getHours()}:${evnt.StartDateTime.getMinutes()}`,
              endTime: `${evnt.EndDateTime.getHours()}:${evnt.EndDateTime.getMinutes()}`,
              eventMessage: evnt.Subject
            };
          });
      }
    } catch (error) {
      console.log("get events error", error);
    }
    if (!this.dailyEvents.length) {
      this.dailyEvents = [
        {
          startTime: "",
          endTime: "",
          eventMessage: "No Events",
          key: 1
        }
      ];
    }
  }

  handleInput(event) {
    console.log(event.target, event.target.value, event.type);
  }
}
