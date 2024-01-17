import { LightningElement, track } from "lwc";
import EventModal from "c/eventModal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Calendar extends LightningElement {
  @track
  calendarDates = [];
  @track currentTime;

  weekDays = "SU MO TU WE TH FR SA".split(" ");
  weekDaysLong =
    "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");

  today = new Date();
  calendarStartDate = this.today;
  todayDateDisplay = this.today.toDateString();
  dateSelected = this.today;
  dateSelectedElement;
  dayDateDisplay;

  monthDisplay = this.calendarStartDate.toLocaleString("default", {
    month: "long"
  });
  yearDisplay = this.calendarStartDate.getFullYear();

  showToast(message) {
    if (!message) return;
    const event = new ShowToastEvent({
      title: message.success ? "Success" : "Error",
      message: message.message,
      variant: message.success ? "success" : "error"
    });
    this.dispatchEvent(event);
  }

  connectedCallback() {
    // Update time every second
    this.keepTime();
    this.interval = setInterval(() => {
      this.keepTime();
    }, 100);
    this.calendarStartDate = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      1
    );
    this.setDayDateDisplay();
    this.fillDates();
  }

  disconnectedCallback() {
    // clearInterval(this.interval);
  }

  setDayDateDisplay() {
    if (this.dateSelected.toDateString() === this.today.toDateString()) {
      this.dayDateDisplay = "Today";
    } else {
      let day = this.weekDaysLong[this.dateSelected.getDay()];
      this.dayDateDisplay = `${day} ${this.dateSelected.getDate()}`;
    }
  }

  keepTime() {
    const now = new Date();
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    const seconds = this.padZero(now.getSeconds());

    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  padZero(value) {
    return value < 10 ? `0${value}` : value;
  }

  setDisplayMonthYear() {
    this.monthDisplay = this.calendarStartDate.toLocaleString("default", {
      month: "long"
    });
    this.yearDisplay = this.calendarStartDate.getFullYear();
  }

  genMonthWithTails(month, year) {
    let dates = [];
    let tailLeft = [];
    let tailRight = [];
    // Create a date object for the first day of the given month and year
    const firstOfMonth = new Date(year, month - 1, 1);
    let currentDate = new Date(year, month - 1, 1);

    let dateObject = (dt) => {
      return {
        date: dt.getDate(),
        key: dt.toString(),
        day: this.weekDays[dt.getDay()],
        class:
          dt.toDateString() === this.today.toDateString()
            ? "current-month today selected"
            : "current-month",
        fulldate: new Date(dt)
      };
    };

    // left tail for the month
    while (currentDate.getDay()) {
      currentDate.setDate(currentDate.getDate() - 1);
      tailLeft.unshift(dateObject(currentDate));
    }

    // Loop through the month
    currentDate = firstOfMonth;
    while (currentDate.getMonth() === month - 1) {
      dates.push(dateObject(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // right tail for the month
    while (currentDate.getDay()) {
      tailRight.push(dateObject(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return [...tailLeft, ...dates, ...tailRight];
  }

  fillDates() {
    this.calendarDates = this.genMonthWithTails(
      this.calendarStartDate.getMonth() + 1,
      this.calendarStartDate.getFullYear()
    );
    this.setDisplayMonthYear();
  }
  genNextMonth() {
    this.calendarStartDate.setMonth(this.calendarStartDate.getMonth() + 1);
    this.fillDates();
  }

  genPrevMonth() {
    this.calendarStartDate.setMonth(this.calendarStartDate.getMonth() - 1);
    this.fillDates();
  }

  setSelectionClass(toElement) {
    if (this.dateSelectedElement) {
      this.dateSelectedElement.setAttribute(
        "class",
        this.dateSelectedElement.getAttribute("class").replace("selected", "")
      );
    }
    if (!toElement.getAttribute("class").includes("selected")) {
      toElement.setAttribute(
        "class",
        toElement.getAttribute("class") + " selected"
      );
    }
    this.dateSelectedElement = toElement;
  }

  async handleDateDblClick(event) {
    this.dateSelected = new Date(event.target.dataset.date);
    this.setSelectionClass(event.target);
    this.setDayDateDisplay();
    const result = await EventModal.open({
      size: "medium",
      description: "Accessible description of modal's purpose",
      label: "Modal Heading",
      dateselected: this.dateSelected
    });
    this.showToast(result);
    let eventBox = this.template.querySelector("c-event-box");
    if (eventBox) {
      eventBox.updateEvents(result);
    }
  }

  handleDateClick(event) {
    this.dateSelected = new Date(event.target.dataset.date);
    this.setSelectionClass(event.target);
    this.setDayDateDisplay();
  }
}
