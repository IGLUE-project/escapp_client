import * as I18n from './I18n.js';
import * as Utils from './Utils.js';

let initialized = false;
let notifications = false;
let ESCAPP;

let CURRENT_TIME = undefined;
let TIME_RUNOUT = false;
let TIMER = undefined;
let CURRENT_TIMER_DELAY = undefined;
let TIMER_NOTIFICATION = undefined;

//Constants
let TIMER_DELAY_MAX = 10;
let TIMER_DELAY_MIN = 1;
let TIMER_DELAY_THRESHOLD = 4*60;
let ER_DURATION;
let NOTIFICATION_TIMES = [0,1,2,5,10,15,30,45,60,75,90,105];

export function init(options = {}){
  if(initialized === true) return;
  initialized = true;
  notifications = (options.notifications === true);
  ESCAPP = options.escapp;
};

export function getTimeRunout(){
  return TIME_RUNOUT;
}

export function getNotificationsEnabled(){
  return notifications;
}

export function startTimer(currentRemainingTime, duration){
  if(typeof CURRENT_TIME !== "undefined") return; //Already started
  if((typeof currentRemainingTime !== "number")||(typeof duration !== "number")) return;

  if((currentRemainingTime <= 0)||(duration <= 0)){
    TIME_RUNOUT = true;
    return;
  }

  CURRENT_TIME = currentRemainingTime;
  ER_DURATION = duration;

  //Adjust timer
  let timeInHours = CURRENT_TIME/3600;
  let hours = Math.floor(timeInHours);
  let minutes = Math.floor((timeInHours - hours)*60);
  let seconds = CURRENT_TIME - hours * 3600 - minutes * 60;
  CURRENT_TIMER_DELAY = (CURRENT_TIME > TIMER_DELAY_THRESHOLD) ? TIMER_DELAY_MAX : TIMER_DELAY_MIN;
  let adjustmentTime = seconds%CURRENT_TIMER_DELAY;

  setTimeout(function(){
    CURRENT_TIME = Math.max(0,CURRENT_TIME - adjustmentTime);
    _startTimer();
    if(notifications) startNotificationTimer();
  },adjustmentTime*1000);
};

function _startTimer(){
  if(typeof TIMER !== "undefined") clearInterval(TIMER);
  if((typeof CURRENT_TIME !== "number")||(CURRENT_TIME <= 0)) return;
  
  if(CURRENT_TIME > TIMER_DELAY_THRESHOLD){
    CURRENT_TIMER_DELAY = TIMER_DELAY_MAX;
  } else {
    CURRENT_TIMER_DELAY = TIMER_DELAY_MIN;
  }

  TIMER = setInterval(function(){
    CURRENT_TIME = Math.max(0,CURRENT_TIME - CURRENT_TIMER_DELAY);

    if(CURRENT_TIMER_DELAY === TIMER_DELAY_MAX){
      if(CURRENT_TIME <= TIMER_DELAY_THRESHOLD){
        _startTimer(); //This will init the timer with TIMER_DELAY_MIN;
      }
    } else {
      //CURRENT_TIMER_DELAY === TIMER_DELAY_MIN
      if(CURRENT_TIME === 0){
        TIME_RUNOUT = true;
        clearInterval(TIMER);
        if((notifications)&&(NOTIFICATION_TIMES.indexOf(0)!==-1)){
          showNotification();
        }
        ESCAPP._onTimeRunOut();
      }
    }
  },CURRENT_TIMER_DELAY * 1000);
};


//////////////////////
// Time notifications
//////////////////////

function startNotificationTimer(){
  if((typeof CURRENT_TIME !== "number")||(TIME_RUNOUT === true)) return;
  if(typeof TIMER_NOTIFICATION !== "undefined"){
     clearTimeout(TIMER_NOTIFICATION);
  }
  
  let delay = undefined;
  let timeInHours = CURRENT_TIME/3600;
  
  if(timeInHours >= 2){
    //Send notification on next hour
    let hoursToNextHour = (timeInHours - Math.floor(timeInHours));
    delay = hoursToNextHour*3600; //secondsToNextHour
  } else {
    //hoursToNextHour < 2
    let rTimeInMinutes = CURRENT_TIME/60;
    let timesInMinutes = NOTIFICATION_TIMES.sort(function(a,b){return b-a});
    for(let t=0; t<timesInMinutes.length; t++){
      if(rTimeInMinutes >= timesInMinutes[t]){
        delay = (rTimeInMinutes - timesInMinutes[t])*60; //secondsTotimesInMinutes[t]
        break;
      }
    }
  }

  if(typeof delay === "number"){
    TIMER_NOTIFICATION = setTimeout(function(){
      if(TIME_RUNOUT === true) return;
      showNotification();
      setTimeout(function(){
        startNotificationTimer();
      },(CURRENT_TIMER_DELAY+1)*1000);
    }, delay*1000);
  }
};

function showNotification(){
  if((notifications!==true)||(typeof CURRENT_TIME !== "number")||(ESCAPP.isERCompleted())||((Math.abs(CURRENT_TIME - ER_DURATION) < 30))) return;

  let text = undefined;
  let timeInHours = CURRENT_TIME/3600;
  let hours = Math.floor(timeInHours);
  let minutes = Math.round((timeInHours - hours)*60);
  let seconds = CURRENT_TIME - hours * 3600 - minutes * 60;

  if(Math.abs(seconds) <= (CURRENT_TIMER_DELAY+1)){
    if(hours > 0){
      if(minutes === 0){
        //Only hour
        if(hours === 1){
          text = I18n.getTrans("i.notification_time_one_hour");
        } else {
          text = I18n.getTrans("i.notification_time_hours",{hours: hours});
        } 
      } else {
        //Hours and minutes
        if(hours === 1){
          text = I18n.getTrans("i.notification_time_one_hour_and_minutes",{hours: hours, minutes: minutes});
        } else {
          text = I18n.getTrans("i.notification_time_hours_and_minutes",{hours: hours, minutes: minutes});
        }
      }
    } else {
      if(minutes > 0){
        //Only minutes
        if(minutes === 1){
          text = I18n.getTrans("i.notification_time_one_minute");
        } else {
          text = I18n.getTrans("i.notification_time_minutes",{minutes: minutes});
        }
      } else if(minutes === 0){
        //Time run out
        if(TIME_RUNOUT === true){
          text = I18n.getTrans("i.notification_time_runout");
        }
      }
    }
  }

  if(typeof text === "string"){
    ESCAPP.displayCustomNotification(text, {type: "time"});
  }
};