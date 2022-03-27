import { Component, ViewChild } from '@angular/core';
import { AutoComplete, AutoCompleteComponent, CustomValueSpecifierEventArgs, SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ActionEventArgs, DragAndDropService, EJ2Instance, EventRenderedArgs, EventSettingsModel, GroupModel, PopupCloseEventArgs, PopupOpenEventArgs, RenderCellEventArgs, ResizeService, ScheduleComponent, TimelineViewsService, TimeScaleModel, View, WorkHoursModel } from '@syncfusion/ej2-angular-schedule';
import { Query, DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import * as moment from 'moment';
import { bookings, elements } from './data';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TimelineViewsService, ResizeService, DragAndDropService],
})
export class AppComponent {

  @ViewChild('scheduleObj') public scheduleObj!: ScheduleComponent;
  @ViewChild('customersAutocomplete') customersAutocomplete!: AutoCompleteComponent;

  // Scheduler configuration
  public selectedDate: Date = new Date();
  public timeScale: TimeScaleModel = { interval: 30, slotCount: 1 };
  public workWeekDays: number[] = [0, 1, 2, 3, 4, 5, 6];
  public workHours: WorkHoursModel = { start: '08:00', end: '20:00' };
  public currentView: View = 'TimelineWeek';
  public group: GroupModel = {
    enableCompactView: false,
    allowGroupEdit: true,
    resources: ['Tavolo']
  };
  public resourceDataSource: Record<string, any>[] = elements;
  public allowMultiple = true;
  public eventSettings: EventSettingsModel = {
    dataSource: bookings as Record<string, any>[],
    fields: {
      id: 'id',
      subject: { name: 'name' },
      startTime: { name: 'StartTime', title: 'Inizio', validation: {} },
      endTime: { name: 'EndTime', title: 'Fine', validation: {} },
    }
  };

  // Select options
  availableElements = [];
  customers: DataManager = new DataManager({
    url: `https://dev.mobee.it/users_backend/search`,
    adaptor: new UrlAdaptor(),
    crossDomain: true,
    headers: [
      {
        Authorization: `Bearer {{token}}`
      }
    ]
  });

  constructor(){
    console.log(this.resourceDataSource);
  }

  onActionComplete(args: ActionEventArgs): void {
    // return;
    const data = (args.data as any)?.[0];
    console.log(data);
  }

  public onPopupOpen(args: PopupOpenEventArgs): void {
    const data: Record<string, any> = args.data as Record<string, any>;
    if (args.type === 'QuickInfo' || args.type === 'Editor' || args.type === 'RecurrenceAlert' || args.type === 'DeleteAlert') {
      const target: HTMLElement = (args.type === 'RecurrenceAlert' ||
        args.type === 'DeleteAlert') ? (args as any).element[0] : args.target;

      if (args.type === "Editor" && !args.cancel) {
        // Customer Autocomplete
        // let atcObj1: AutoComplete = new AutoComplete({
        //   dataSource: new DataManager({
        //     url: `${environment.serverUrl}/users_backend/search`,
        //     adaptor: new UrlAdaptor(),
        //     crossDomain: true,
        //     headers: [
        //       {
        //         Authorization: `Bearer ${this.main.getToken()}`
        //       }
        //     ]
        //   }),
        //   suggestionCount: 5,
        //   fields: { value: 'value', text: 'text' },
        //   placeholder: 'Cliente',
        //   floatLabelType: 'Always',
        //   autofill: true,
        //   allowCustom: true,
        //   value: (args.data as any).name ? (args.data as any).name : '',
        //   customValueSpecifier: this.onCustomCustomer.bind(this),
        //   select: this.onSelectCustomer.bind(this, args.data),
        //   minLength: 3
        // });
        // atcObj1.appendTo('#user');
      }
    }
  }

  public onActionBegin(args: ActionEventArgs): void {
    if (args.requestType === 'eventCreate' || args.requestType === 'eventChange') {
      console.log(args, 'action')
      let data: Record<string, any> = {};
      if (args.requestType === 'eventCreate') {
        data = ((args as any).data[0] as Record<string, any>);
      } else if (args.requestType === 'eventChange') {
        data = (args.data as Record<string, any>);
      }

      data['time_end'] = moment(data['EndTime']).format('YYYY-MM-DD HH:mm:ss');
      data['time_start'] = moment(data['StartTime']).format('YYYY-MM-DD HH:mm:ss');

      console.log(data);

      if (!this.scheduleObj.isSlotAvailable(data)) {
        args.cancel = true;
      }
    }
  }

  public onRenderCell(args: RenderCellEventArgs): void {
    if (args.elementType === 'emptyCells' && args.element.classList.contains('e-resource-left-td')) {
      const target: HTMLElement = args.element.querySelector('.e-resource-text') as HTMLElement;
      target.innerHTML = '<div class="name">Tavoli</div><div class="capacity">Coperti</div>';
    }
  }
}
