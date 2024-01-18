import { LightningElement, track } from "lwc";
// import EventModal from "c/eventModal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const WEEK_DAYS_SHORT = "SU MO TU WE TH FR SA".split(" ");
const WEEK_DAYS_LONG =
  "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");

const MONTHS_SHORT = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(
  " "
);

// {
//   key, value, year, month, date, class, day
// }

export default class Calendar extends LightningElement {
  weekDays = WEEK_DAYS_SHORT;

  @track
  calendarEntries = [];

  @track currentTime;

  today = new Date();
  todayDateDisplay = this.today.toDateString();
  dateSelected = this.today;
  selectedDayAndDateDisplay;

  selectedCalendarElement;

  chooseDate = true;
  chooseMonth = false;
  chooseYear = false;

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

    this.calendarStartDate = this.today;

    this.setSelectedDayDateDisplay();
    this.fillCalendarEntries();
  }

  setSelectedDayDateDisplay() {
    if (this.dateSelected.toDateString() === this.today.toDateString()) {
      this.selectedDayAndDateDisplay = "Today";
    } else {
      let day = WEEK_DAYS_LONG[this.dateSelected.getDay()];
      this.selectedDayAndDateDisplay = `${day} ${this.dateSelected.getDate()}`;
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

  setCalendarHeaderText() {
    let calendarMonth = this.calendarStartDate.toLocaleString("default", {
      month: "long"
    });
    let calendarYear = Number(this.calendarStartDate.getFullYear());

    if (this.chooseDate) {
      this.headerText = `${calendarMonth} ${calendarYear}`;
    } else if (this.chooseMonth) {
      this.headerText = `${calendarYear}`;
    } else if (this.chooseYear) {
      this.headerText = `${calendarYear}-${calendarYear+9}`;
    }
  }

  generateDatesWithTails(forMonth, forYear) {
    let dates = [];
    let tailLeft = [];
    let tailRight = [];
    // Create a date object for the first day of the given month and year
    const firstOfMonth = new Date(forYear, forMonth, 1);
    let currentDate = new Date(forYear, forMonth, 1);

    let dateObject = (dt) => {
      return {
        date: dt.getDate(),
        key: dt.toString(),
        day: WEEK_DAYS_SHORT[dt.getDay()],
        class:
          dt.toDateString() === this.today.toDateString()
            ? "bright today selected"
            : "bright",
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
    while (currentDate.getMonth() === forMonth) {
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

  fillCalendarEntries() {
    if (this.chooseDate) {
      this.calendarEntries = this.generateDatesWithTails(
        this.calendarStartDate.getMonth(),
        this.calendarStartDate.getFullYear()
      );
    } else if (this.chooseMonth) {
      this.calendarEntries = MONTHS_SHORT.map((element, index) => ({
        year: this.calendarStartDate.getFullYear(),
        month: index,
        key: element,
        value: element,
        class:
          this.calendarStartDate.getFullYear() === this.today.getFullYear() &&
          index === this.today.getMonth()
            ? "bright today"
            : "bright"
      }));
    } else if (this.chooseYear) {
      let entries = [];
      for (
        let year = this.calendarStartDate.getFullYear();
        year < this.calendarStartDate.getFullYear() + 12;
        year++
      ) {
        entries.push({
          year,
          month: 1,
          key: year,
          value: year,
          class:
            this.calendarStartDate.getFullYear() === this.today.getFullYear()
              ? "bright today"
              : "bright"
        });
      }
      this.calendarEntries = entries;
    }

    this.setCalendarHeaderText();
  }

  setSelectionClass(toElement) {
    if (!this.chooseDate) return;

    if (this.selectedCalendarElement) {
      this.selectedCalendarElement.setAttribute(
        "class",
        this.selectedCalendarElement
          .getAttribute("class")
          .replace("selected", "")
      );
    }
    if (!toElement.getAttribute("class").includes("selected")) {
      toElement.setAttribute(
        "class",
        toElement.getAttribute("class") + " selected"
      );
    }
    this.selectedCalendarElement = toElement;
  }

  async handleDateDblClick(event) {
    this.dateSelected = new Date(event.target.dataset.date);
    this.setSelectionClass(event.target);
    this.setSelectedDayDateDisplay();
    // const result = await EventModal.open({
    //   size: "medium",
    //   description: "Accessible description of modal's purpose",
    //   label: "Modal Heading",
    //   dateselected: this.dateSelected
    // });
    // this.showToast(result);
    // let eventBox = this.template.querySelector("c-event-box");
    // if (eventBox) {
    //   eventBox.updateEvents(result);
    // }
  }

  handleCalendarEntryClick(event) {
    if (this.chooseDate) {
      this.dateSelected = new Date(event.target.dataset.date);
      this.setSelectionClass(event.target);
      this.setSelectedDayDateDisplay();
      return;
    } else if (this.chooseMonth) {
      this.calendarStartDate = new Date(
        event.target.dataset.year,
        event.target.dataset.month,
        1
      );
      this.chooseMonth = false;
      this.chooseDate = true;
    } else if (this.chooseYear) {
      this.calendarStartDate = new Date(event.target.dataset.year, 0, 1);
      this.chooseYear = false;
      this.chooseMonth = true;
    }

    this.fillCalendarEntries();

  }

  chooseMonthYear(event) {
    if (this.chooseDate) {
      this.calendarStartDate = new Date(
        this.calendarStartDate.getFullYear(),
        0,
        1
      );
      this.chooseMonth = true;
      this.chooseDate = false;

    } else if (this.chooseMonth) {
      this.calendarStartDate = new Date(
        Math.floor(this.calendarStartDate.getFullYear() / 10) * 10,
        0,
        1
      );
      this.chooseMonth = false;
      this.chooseYear = true;

    } 
    this.setSelectionClass(event.target);
    this.fillCalendarEntries();
  }

  handleUp(event) {
    if (this.chooseDate) {
      this.calendarStartDate.setMonth(this.calendarStartDate.getMonth() - 1);
    } else if (this.chooseMonth) {
      this.calendarStartDate.setFullYear(
        this.calendarStartDate.getFullYear() - 1
      );
    } else if (this.chooseYear) {
      this.calendarStartDate.setFullYear(
        this.calendarStartDate.getFullYear() - 10
      );
    }

    this.fillCalendarEntries();
  }

  handleDown(event) {
    if (this.chooseDate) {
      this.calendarStartDate.setMonth(this.calendarStartDate.getMonth() + 1);
    } else if (this.chooseMonth) {
      this.calendarStartDate.setFullYear(
        this.calendarStartDate.getFullYear() + 1
      );
    } else if (this.chooseYear) {
      this.calendarStartDate.setFullYear(
        this.calendarStartDate.getFullYear() + 10
      );
    }

    this.fillCalendarEntries();
  }
}
