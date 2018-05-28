import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventProvider } from '../../providers/event/event';
import { Event } from '../../models/event';
import { ISubscription } from 'rxjs/Subscription';
import { UserProvider } from '../../providers/user/user';
import { SearchEventDetailPage } from '../search-event-detail/search-event-detail';
import { combineLatest } from 'rxjs/observable/combineLatest';

/**
 * Generated class for the SearchEventsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search-events',
  templateUrl: 'search-events.html',
})
export class SearchEventsPage implements OnInit {


  events: Event[] = [];
  filteredEvents: Event[];
  subscription: ISubscription;
  searchText: string = "";
  userEvents = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private eventProvider: EventProvider,
    private userProvider: UserProvider
  ) { }

  ngOnInit() {
    var allEvents$ = this.eventProvider.getAllEvents()
    var adminEvents$ = this.userProvider.getEventAdminList();
    var inviteeEvents$ = this.userProvider.getEventInviteeList();
    this.subscription = combineLatest( allEvents$, adminEvents$, inviteeEvents$)
    .subscribe(([allEvents, adminEvents, inviteeEvents]) => {
      this.events = allEvents;
      this.events = this.events.filter(event => !(event.id in adminEvents.events)); //filter out events that the user is admin
      this.events = this.events.filter(event => !(event.id in inviteeEvents.events)); //filter out events that the user is invited
      this.sortEvents();
      this.searchText = "";
      this.changeSearch();
    });
  }

  private sortEvents() {
    this.events.sort(function (a, b) {
      var nameA = a.name.toUpperCase(); // ignore upper and lowercase
      var nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
  }

  private filterEvents() {
    if(this.events.length >0)
    this.events = this.events.filter(event => this.userEvents.indexOf(event.id) == -1);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log('search-events unsubscribe');
  }

  getUserEvents(){
    var userEventsList = Object.keys(this.userProvider.userProfile.eventAdminList);
    Object.keys(this.userProvider.userProfile.eventInviteeList).map(event => userEventsList.push(event));
    return userEventsList;
  }

  ionViewDidEnter() {
   
   // this.filterEvents();

  }

  changeSearch() {
    if (!this.searchText)
      this.searchText = "";
    if (this.events != null) {
      this.filteredEvents = this.events.filter(event => event.name.toLowerCase().includes(this.searchText.toLowerCase()));
    }
  }

  onLoadEvent(event: Event){
    this.navCtrl.push(SearchEventDetailPage, {event: event});
  }



}
