import { api, wire } from "lwc";
import LightningModal from "lightning/modal";
import getEventsSubjectsPicklist from "@salesforce/apex/CalendarController.getEventsSubjectsPicklist";
import getContacts from "@salesforce/apex/CalendarController.getContacts";
import getAccounts from "@salesforce/apex/CalendarController.getAccounts";
import createEvent from "@salesforce/apex/CalendarController.createEvent";

export default class eventModal extends LightningModal {
  @api dateselected;

  connectedCallback(){
    this.setDefaultEnd();
    this.setDefaultStart();
  }

  subjectOptions = [];

  contactOptions = [];
  accountOptions = [];

  elements = {};

  @wire(getEventsSubjectsPicklist)
  fillSubjectOptions({ data, error }) {
    if (data) {
      this.subjectOptions = data.map((each) => ({ label: each, value: each }));
    }
    if (error) {
      console.log("fillSubjectOptions error", error);
    }
  }

  @wire(getAccounts)
  fillAccountOptions({ data, error }) {
    if (data) {
      this.accountOptions = data.map((each) => ({
        label: each.Name,
        value: each.Id
      }));
    }
    if (error) {
      console.log("fillAccountOptions error", error);
    }
  }

  @wire(getContacts)
  fillContactOptions({ data, error }) {
    if (data) {
      this.contactOptions = data.map((each) => ({
        label: each.Name,
        value: each.Id
      }));
    }
    if (error) {
      console.log("fillContactOptions error", error);
    }
  }

  setDefaultStart() {
    let defaultStart = new Date(this.dateselected);
    defaultStart.setHours(0);
    defaultStart.setMilliseconds(0);
    this.defaultStart = defaultStart.toISOString();
  }

  setDefaultEnd() {
    let defaultEnd = new Date(this.dateselected);
    defaultEnd.setHours(0);
    defaultEnd.setMilliseconds(0);
    defaultEnd.setDate(defaultEnd.getDate() + 1);
    this.defaultEnd = defaultEnd.toISOString();
  }

  resetFields() {
    this.elements.subject = this.template.querySelector(".subject");
    this.elements.startDate = this.template.querySelector(".startdate");
    this.elements.endDate = this.template.querySelector(".enddate");
    this.elements.whoId = this.template.querySelector(".contactname");
    this.elements.whatId = this.template.querySelector(".relatedaccount");
    this.elements.isAllDayEvent = this.template.querySelector(".alldaycheck");
    this.elements.outputField = this.template.querySelector(".error");

  }

  renderedCallback() {
    this.resetFields();
  }

  validate() {
    let errorMessage = "";

    if (!this.elements.startDate.value) {
      errorMessage += " (Enter startDate) ";
    }

    if (!this.elements.endDate.value) {
      errorMessage += " (Enter endDate) ";
    }

    let hasValue = this.elements.startDate.value && this.elements.endDate.value;
    if (
      hasValue &&
      new Date(this.elements.endDate.value) <
        new Date(this.elements.startDate.value)
    ) {
      errorMessage += " !(StartDateTime<EndDateTime)";
      this.elements.endDate.setCustomValidity(
        "StartDateTime must be smaller than EndDateTime"
      );
      this.elements.endDate.reportValidity();
    }
    if (hasValue) {
      let condition = !(
        Math.abs(
          (new Date(this.elements.endDate.value) -
            new Date(this.elements.startDate.value)) /
            (1000 * 60 * 60 * 24)
        ) < 14
      );
      if (condition) {
        errorMessage += " !(EndDateTime - StartDateTime ) < 14 days";

        let message =
          "StartDateTime and EndDateTime cannot be more than 14 days apart";

        this.elements.endDate.setCustomValidity(message);
        this.elements.endDate.reportValidity();

        this.elements.startDate.setCustomValidity(message);
        this.elements.startDate.reportValidity();
      }
    }

    this.elements.outputField.value = errorMessage;
    return errorMessage;
  }

  handleChange(event) {
    this.validate();
  }

  submitEvent(event) {
    let errorMessage = this.validate();

    let obj = {
      subject: this.elements.subject.value,
      startDateTime: this.elements.startDate.value,
      endDateTime: this.elements.endDate.value,
      whoId: this.elements.whoId.value,
      whatId: this.elements.whatId.value,
      isAllDayEvent: this.elements.isAllDayEvent.value
    };
    if (!errorMessage) {
      createEvent(obj)
        .then((id) => {
          console.log('created event with id', id);
          this.close({ message: id, success: true, Id: id, ...obj });
        })
        .catch((error) => {
          this.close({ message: error.message, success: false });
        });
    }
  }
}
