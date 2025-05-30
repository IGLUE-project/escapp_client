import 'es6-promise';
import "isomorphic-fetch";
import Bowser from "bowser";
import 'jQuery';
import * as Utils from './Utils.js';
import * as I18n from './I18n.js';
import * as LocalStorage from './Storage.js';
import * as LocalStorageApp from './StorageApp.js';
import * as Encrypt from './Encrypt.js';
import * as Dialogs from './Dialogs.js';
import * as Notifications from './Notifications.js';
import * as Animations from './Animations.js';
import * as Events from './Events.js';
import * as Countdown from './Countdown.js';

export default function ESCAPP(_settings){

  //Settings
  let settings = {};
  let appSettings = {};

  let defaultSettings = {
    endpoint: undefined,
    imagesPath: "/assets/images/",
    linkedPuzzleIds: undefined,
    relatedPuzzleIds: undefined,
    requiredPuzzlesIds: undefined,
    user: {
      email: undefined,
      token: undefined,
    },
    preview: false,
    silent: false,
    forceValidation: true,
    autovalidate: false,
    notifications: false,
    rtc: true,
    restoreState: "REQUEST_USER", //AUTO, AUTO_NOTIFICATION, REQUEST_USER, NEVER
    I18n: undefined,
    browserRestrictions: {
      "internet explorer": ">10",
      "chrome": ">41",
      "firefox": ">38"
    },
    browserRestrictionsDefault: true,
    countdown: true,
    jQuery: false,
    initCallback: undefined,
    onNewErStateCallback: undefined,
    onErRestartCallback: undefined,
  };

  let defaultReadOnlySettings = {
    erId: undefined,
    localStorageKey: undefined,
    encryptKey: undefined,
    user: {
      authenticated: false,
      participation: undefined
    },
    localErState: undefined,
    remoteErState: undefined,
    nextPuzzleId: undefined,
    allPuzzlesSolved: false,
    teamName: undefined,
    duration: undefined,
    remainingTime: undefined,
    puzzlesRequirements: true,
  };

  let defaultERState = {
    puzzleData: {},
    puzzlesSolved: [], 
    progress: 0,
    score: 0,
    nPuzzles: undefined,
    hintsAllowed: undefined,
    startTime: undefined,
    remainingTime: undefined,
    strictTime: false,
    teamId: undefined,
    teamMembers: undefined,
    ranking: undefined
  };


  //////////////////
  // Init
  //////////////////
  let initialized = false;
  let succesfullyInitialized = false;
  let initializationErrors = [];
  let isInitializationErrorShown = false;
  let initializedAfterValidation = false;

  this.init = function(_settings){
    if (initialized===true) return;

    //Obtain and process settings
    if(typeof _settings != "object"){
      _settings = {};
    }

    // Find _settings provided by the Escapp server through a global JavaScript variable named "ESCAPP_APP_SETTINGS"
    let _appSettings = this._getAppSettingsFromEnvironment();
    if(typeof _appSettings !== "object"){
      _appSettings = {};
    }

    if(typeof _appSettings.escappClientSettings === "object"){
      _settings = Utils.deepMerge(_settings, Object.assign({}, _appSettings.escappClientSettings));
    }

    _appSettings = Object.assign({},_appSettings);
    delete _appSettings.escappClientSettings;
    appSettings = _appSettings;

    // Merge _settings with defaultSettings and defaultReadOnlySettings to obtain final settings
    settings = Utils.deepMerge(Utils.deepMerge(defaultSettings, _settings), defaultReadOnlySettings);

    if(settings.preview === true){
      settings.silent = true;
      settings.rtc = false;
      settings.restoreState = "NEVER";
    } else {
      settings.preview = false;
    }

    if(settings.silent === true){
      settings.forceValidation = false;
      settings.notifications = false;

      if(settings.restoreState !== "AUTO"){
        if(["AUTO_NOTIFICATION","REQUEST_USER"].indexOf(settings.restoreState) !== -1){
          settings.restoreState = "AUTO";
        } else {
          settings.restoreState = "NEVER";
        }
      }
    } else {
      settings.silent = false;
    }

    if((typeof settings.relatedPuzzleIds !== "object")&&(typeof settings.linkedPuzzleIds === "object")){
      settings.relatedPuzzleIds = settings.linkedPuzzleIds;
    }

    //Check URL params
    let URL_params = Utils.getParamsFromCurrentUrl();
    if((typeof settings.endpoint !== "string")&&(typeof URL_params.escapp_endpoint !== "undefined")){
      settings.endpoint = Utils.checkUrlProtocol(URL_params.escapp_endpoint);
    }
    if(typeof settings.endpoint === "string"){
      settings.erId = this._getERIdFromEscappEndpoint(settings.endpoint);
      if((this._isValidEscappEndpoint(settings.endpoint)==="false")||(typeof settings.erId !== "string")){
        initializationErrors.push("i.initialization_error_endpoint_format");
      }
    } else {
      initializationErrors.push("i.initialization_error_endpoint");
    }

    if(typeof settings.resourceId === "undefined"){
      if((settings.linkedPuzzleIds instanceof Array)&&(settings.linkedPuzzleIds.length > 0)){
        settings.resourceId = settings.linkedPuzzleIds.join("-");
      } else {
        if(settings.preview){
          initializationErrors.push("i.initialization_error_linkedPuzzleIds");
        } else {
          settings.resourceId = "preview";
        }
      }
    }

    if(typeof settings.localStorageKey === "undefined"){
      settings.localStorageKey = "ESCAPP_" + settings.erId + "_" + settings.resourceId; 
    }
    if(typeof settings.encryptKey === "undefined"){
      settings.encryptKey = settings.localStorageKey;
    }
    
    //Init modules
    I18n.init(settings.I18n);
    LocalStorage.init(settings.localStorageKey,settings.preview);
    LocalStorageApp.init(LocalStorage,settings.preview);
    Encrypt.init(settings.encryptKey);
    Dialogs.init({imagesPath: settings.imagesPath});
    Notifications.init({enabled: settings.notifications});
    Animations.init({imagesPath: settings.imagesPath});
    Events.init({endpoint: settings.endpoint, escapp: this});
    Countdown.init({notifications: ((Notifications.isEnabled())&&(settings.countdown)), escapp: this});

    if(settings.preview){
      this._resetForPreview();
    }

    //User credentials. Priority: settings, URL params, LocalStorage.
    if(typeof this._getUserCredentials(settings.user) === "undefined"){
      //Get user from URL params
      let userURL = this._getUserCredentials({email: (URL_params.escapp_email || URL_params.email), token: (URL_params.escapp_token || URL_params.token)});
      if(typeof userURL !== "undefined"){
        settings.user = userURL;
      } else {
        //Get user from LocalStorage
        let userLS = LocalStorage.getSetting("user");
        if(typeof this._getUserCredentials(userLS) !== "undefined"){
          settings.user = userLS;
        }
      }
    }

    //Force authentication when reload
    if(typeof settings.user === "object"){
      settings.user.authenticated = false;
    }
    
    //Init escape room state
    let localErState = LocalStorage.getSetting("localErState");
    if(this._validateERState(localErState)===false){
      localErState = Utils.deepMerge({}, defaultERState);
    }
    settings.localErState = localErState;
    LocalStorage.saveSetting("localErState",settings.localErState);
    this._updateAppPuzzlesState();
 
    //Include JQuery
    if((settings.jQuery === true)&&(typeof window.jQuery === "undefined")){
      window.$ = window.jQuery = this.getJQuery();
    }

    initialized = true;
    succesfullyInitialized = (initializationErrors.length === 0 );
    this._enableBeforeEachCheckInitialization();
    this._checkInitialization();
  };

  this._getAppSettingsFromEnvironment = function(){
    let win = window;
    let attempts = 0;
    let limit = 1;
    
    try {
      while ((typeof win.ESCAPP_APP_SETTINGS !== "object") && (win.parent) && (win.parent !== win) && (attempts <= limit)){
          attempts += 1;
          win = win.parent;
      }
      if(typeof win.ESCAPP_APP_SETTINGS === "object"){
        return win.ESCAPP_APP_SETTINGS;
      }
    } catch (e) {
      //Catch cross domain issues
    }
    return undefined;
  };

  this._isValidEscappEndpoint = function(url) {
    const regex = /^(https?:\/\/[a-zA-Z][^\/]*\/api\/escapeRooms\/[0-9]+)$/;
    return regex.test(url);
  };

  this._getERIdFromEscappEndpoint = function(url) {
    const regex = /^(https?:\/\/[a-zA-Z][^\/]*\/api\/escapeRooms\/([0-9]+))$/;
    const match = url.match(regex);
    return match ? (parseInt(match[2], 10) + "") : undefined;
  };

  this._enableBeforeEachCheckInitialization = function() {
    const functionNames = Object.keys(this);
    const excludedFunctionNames = ['init','getSettings','getAppSettings','isSupported'];

    for (const name of functionNames) {
      const isFunction = typeof this[name] === 'function';
      const isPrivate = name.startsWith('_');
      const isExcluded = excludedFunctionNames.includes(name);
      if (!isFunction || name === 'constructor' || isPrivate || isExcluded) continue;

      const original = this[name].bind(this);
      this[name] = (...args) => {
        if (this._checkInitialization() === false) return;
        return original(...args);
      };
    }
  };

  this._checkInitialization = function(){
    if(!succesfullyInitialized){
      this._displayInitializationErrorDialog();
      return false;
    }
    return true;
  };


  //////////////////
  // Validation and Authentication
  //////////////////

  this._getUserCredentials = function(user){
    if((typeof user !== "object")||(typeof user.email !== "string")||((typeof user.token !== "string")&&(typeof user.password !== "string"))){
      return undefined;
    }
    let userCredentials = {email: user.email};
    if(typeof user.token === "string"){
      userCredentials.token = user.token;
    } else {
      userCredentials.password = user.password;
    }
    return userCredentials;
  };

  this.isSupported = function(){
    let isValidBrowser;

    //Use bowser (https://github.com/lancedikson/bowser) to detect browser
    try {
      let browser = Bowser.getParser(window.navigator.userAgent);
      // For info: browser.getBrowser();
      isValidBrowser = browser.satisfies(settings.browserRestrictions);
      if(typeof isValidBrowser === "undefined"){
        //No rule for the browser has been specified
        isValidBrowser = settings.browserRestrictionsDefault;
      }
    } catch(e){
      //Browser has not been recognized
      isValidBrowser = settings.browserRestrictionsDefault;
    }

    //Check specific features
    let featuresSupported = LocalStorage.isSupported();
    
    return ((isValidBrowser)&&(featuresSupported));
  };

  this.validate = function(callback){
    if (this.isSupported()) return this.validateUser(callback);
    if (settings.silent) return this._safeCall(callback, false);
    return this.displayCustomEscappDialog(I18n.getTrans("i.not_supported_title"),I18n.getTrans("i.not_supported_text"),{},function(response){
      this._safeCall(callback, false);
    }.bind(this));
  };

  this.validateUser = function(callback){
    if((typeof settings.user !== "object")||(typeof settings.user.token !== "string")){
      //User does not have auth credentials.
      if (settings.silent) return this._safeCall(callback, false);
      this._displayUserAuthDialog(true,function(dialogResponse){
        this._onUserAuthDialogResponse(dialogResponse, function(success){
          if(success){
            return this._validateUserAfterAuth(callback);
          } else {
            return this._onValidateUserFail(callback);
          }
        }.bind(this));
      }.bind(this));
    } else {
      //User has auth credentials.
      this.retrieveState(function(success,erState){
        if((success)||(settings.silent)||(!settings.forceValidation)){
          return this._safeCall(callback, success, erState);
        } else {
          return this._onValidateUserFail(callback);
        }
      }.bind(this));
    }
  };

  this._onUserAuthDialogResponse = function(dialogResponse, callback){
    if((dialogResponse.choice==="ok")||(settings.forceValidation!==false)){
      let user = {email: dialogResponse.inputs[0], password:dialogResponse.inputs[1]};
      this._auth(user,function(success){
        if(settings.user.authenticated === true){
          // User authentication succesfull
          switch(settings.user.participation){
            case "PARTICIPANT":
              //User is authenticated, user is a participant, and the escape room has been started.
              this._safeCall(callback, true);
            case "NOT_STARTED":
              //User is authenticated and a participant, but the escape room needs to be started.
              //Ask the participant if he/she wants to start the escape room.
              this._startEscapeRoom(function(started){
                this._safeCall(callback, started);
              }.bind(this));
              break;
            case "NOT_A_PARTICIPANT":
            case "AUTHOR":
            case "NOT_ACTIVE":
            case "TOO_LATE":
              //User is authenticated but cannot play
              this._displayUserParticipationErrorDialog(function(){
                this._safeCall(callback, false);
              }.bind(this));
            break;
          }
        } else {
          // User failed to authenthicate. Retry.
          return this._displayUserAuthDialog(false,callback);
        }
      }.bind(this));
    } else {
      this._safeCall(callback, !settings.forceValidation);
    }
  };

  this._onValidateUserFail = function(callback){
    if(settings.user.authenticated !== true){
      //User is not authenticated. Retry.
      return this._retryAfterAuthFail(callback);
    } else {
      //User is authenticated but cannot play
      return this._safeCall(callback, false);
    }
  };

  this._retryAfterAuthFail = function(callback){
    this._resetUser();
    return this.validateUser(callback);
  };

  this._resetUser = function(){
    settings.user = Object.assign({}, defaultReadOnlySettings.user);
    LocalStorage.removeSetting("user");
    this._resetErState();
  };

  this._resetErState = function(){
    settings.localErState = defaultERState;
    settings.remoteErState = undefined;
    LocalStorage.removeSetting("localErState");
  };

  this._resetForPreview = function(){
    this._resetErState();
    LocalStorage.clear();
  };

  this._validateUserAfterAuth = function(callback){
    this._validatePreviousPuzzles(function(success){
        if((success)||(settings.forceValidation===false)){
          this._validateStateToRestore(function(erState){
            this._afterValidateUser();
            this._safeCall(callback,success,erState);
          }.bind(this));
        } else {
          this._safeCall(callback,false);
        }
    }.bind(this));
  };

  this._validatePreviousPuzzles = function(callback){
    if((!(settings.requiredPuzzlesIds instanceof Array))||(settings.requiredPuzzlesIds.length === 0)){
      this._safeCall(callback,true);
    } else {
      //Check requirement
      let stateToVerifyPuzzleRequirements = this._getNewestState();
      if(this._validateERState(stateToVerifyPuzzleRequirements)===false){
        settings.puzzlesRequirements = false;
      } else {
        for(let i=0; i<settings.requiredPuzzlesIds.length; i++){
          if(stateToVerifyPuzzleRequirements.puzzlesSolved.indexOf(settings.requiredPuzzlesIds[i])===-1){
            settings.puzzlesRequirements = false;
            break;
          }
        }
      }
      if(settings.puzzlesRequirements===false){
        if (settings.silent) return this._safeCall(callback,false);
        this._displayPuzzleRequirementDialog(function(response){
          this._safeCall(callback,false);
        }.bind(this));
      } else {
        this._safeCall(callback,true);
      }
    }
  };

  this._afterValidateUser = function(){
    if(initializedAfterValidation === true) return;
    initializedAfterValidation = true;
    this._connect();
    Countdown.startTimer(settings.remainingTime,settings.duration);
  };

  this._startEscapeRoom = function(callback){
    this._displayStartDialog(function(start){
      if(start===true){
        //User wants to init escape room
         this.start(function(success){
          //ER started (unless error on server side)
          if(success===true){
            this._displayStartNotification();
          }
          this._safeCall(callback,(success===true));
        }.bind(this));
      } else {
        //User do not want to init escape room
        this._safeCall(callback,false);
      }
    }.bind(this));
  };


  //////////////////
  // Dialogs
  //////////////////

  this._displayDialog = function(options = {}){
    options = Utils.deepMerge({escapp:true},options);
    if ((settings.silent)&&(options.ignoreSilent === false)) return;
    return Dialogs.displayDialog(options);
  };

  this.displayCustomDialog = function(title,text,extraOptions,callback){
    let dialogOptions = {title: title, text: text, escapp: false, icon: undefined};
    if(typeof callback === "function"){
      dialogOptions.closeCallback = callback;
    }
    if(typeof extraOptions === "object"){
      dialogOptions = Object.assign(dialogOptions,extraOptions);
    }
    this._displayDialog(dialogOptions);
  };

  this.displayCustomEscappDialog = function(title,text,extraOptions,callback){
    let dialogOptions = Utils.deepMerge((extraOptions || {}),{escapp: true});
    this.displayCustomDialog(title,text,dialogOptions,callback);
  };

  this.displayPuzzleDialog = function(title,text,extraOptions,callback){
    let dialogOptions = {escapp: false, icon: "lock"};
    dialogOptions.inputs = [
      {
        "type":"text",
        "autocomplete":"off",
        "validate":function(solution){return Utils.validateString(solution)},
      }
    ];
    dialogOptions.buttons = [
      {
        "response":"ok",
        "label":I18n.getTrans("i.button_ok"),
      },
      {
        "response":"cancel",
        "label":I18n.getTrans("i.button_nok"),
        "ignoreInputs":true,
      },
    ];
    if(typeof callback === "function"){
      dialogOptions.closeCallback = function(dialogResponse){
        if((dialogResponse.inputs instanceof Array)&&(dialogResponse.inputs.length === 1)){
          dialogResponse.value = dialogResponse.inputs[0];
        }
        callback(dialogResponse);
      }
    }
    if(typeof extraOptions === "object"){
      dialogOptions = Object.assign(dialogOptions,extraOptions);
    }
    this.displayCustomDialog(title,text,dialogOptions,callback);
  };

  this.displayCompletionDialog = function(extraOptions,callback){
    let dialogOptions = {escapp: true, img: (settings.imagesPath + "/trophy.png")};
    if(typeof extraOptions === "object"){
      dialogOptions = Object.assign(dialogOptions,extraOptions);
    }
    dialogOptions.closeCallback = function(){
      setTimeout(function(){
        this.stopAnimation("confetti");
      }.bind(this),1500);
      this._safeCall(callback);
    }.bind(this);
    this.startAnimation("confetti");
    this.displayCustomDialog(I18n.getTrans("i.completion_title"),I18n.getTrans("i.completion_text",{escappURL: this._getEscappPlatformFinishURL()}),dialogOptions,callback);
  };

  this._getEscappPlatformFinishURL = function(){
    return this._getEscappPlatformURL() + "/finish";
  };

  this._getEscappPlatformURL = function(){
    return (this._isValidEscappEndpoint(settings.endpoint) ? settings.endpoint.replace("/api","") : "");
  };

  this._displayUserAuthDialog = function(firstTime,callback){
    let dialogOptions = {requireInput:true};
    if(firstTime){
      dialogOptions.title = I18n.getTrans("i.auth_title");
      dialogOptions.text = I18n.getTrans("i.auth_text");
    } else {
      dialogOptions.title = I18n.getTrans("i.auth_title_wrong_credentials");
      dialogOptions.text = I18n.getTrans("i.auth_text_wrong_credentials");
    }
    dialogOptions.inputs = [
      {
        "type":"text",
        "label":I18n.getTrans("i.auth_email_label"),
        "validate":function(email){return Utils.validateEmail(email);},
      }, {
        "type":"password",
        "label":I18n.getTrans("i.auth_password_label"),
      },
    ];
    dialogOptions.buttons = [{"response":"ok","label":I18n.getTrans("i.button_ok")}];
    if(settings.forceValidation===false){
      dialogOptions.buttons.push({"response":"cancel","label":I18n.getTrans("i.button_nok"),"ignoreInputs":true});
    }
    dialogOptions.closeCallback = function(dialogResponse){
      this._safeCall(callback,dialogResponse);
    }.bind(this);
    this._displayDialog(dialogOptions);
  };

  this._displayUserParticipationErrorDialog = function(callback){
    let dialogOptions = {};
    dialogOptions.title = I18n.getTrans("i.generic_error_title");

    if(this.isUserLoggedIn()){
      switch(settings.user.participation){
        case "TOO_LATE":
          dialogOptions.text = I18n.getTrans("i.participation_error_TOO_LATE");
          break;
        case "NOT_ACTIVE":
          dialogOptions.text = I18n.getTrans("i.participation_error_NOT_ACTIVE");
          break;
        case "NOT_STARTED":
          dialogOptions.text = I18n.getTrans("i.participation_error_NOT_STARTED");
          break;
        case "AUTHOR":
        case "NOT_A_PARTICIPANT":
        default:
          dialogOptions.text = I18n.getTrans("i.participation_error_NOT_PARTICIPANT");
          break;
      }
    } else {
      dialogOptions.text = I18n.getTrans("i.participation_error_NOT_AUTHENTICATED");
    }
    if(typeof callback === "function"){
      dialogOptions.closeCallback = callback;
    }

    dialogOptions.buttons = [];
    if((settings.forceValidation===false)||(this.isUserLoggedIn()===false)){
      dialogOptions.buttons.push({"response":"ok","label":I18n.getTrans("i.button_ok")});
    }

    this._displayDialog(dialogOptions);
  };

  this._displayPuzzleRequirementDialog = function(callback){
    let dialogOptions = {};
    dialogOptions.title = I18n.getTrans("i.generic_error_title");
    dialogOptions.text = I18n.getTrans("i.puzzles_required");
    dialogOptions.buttons = [];
    if(settings.forceValidation===false){
      dialogOptions.buttons.push({"response":"ok","label":I18n.getTrans("i.button_ok")});
    }
    if(typeof callback === "function"){
      dialogOptions.closeCallback = callback;
    }
    this._displayDialog(dialogOptions);
  };

  this._displayRestoreStateDialog = function(callback){
    let dialogOptions = {requireInput:true};
    
    dialogOptions.title = I18n.getTrans("i.restore_title");

    if(settings.restoreState==="AUTO_NOTIFICATION"){
      dialogOptions.text = I18n.getTrans("i.restore_auto_text");
    } else {
      //REQUEST_USER
      dialogOptions.text = I18n.getTrans("i.restore_request_text");

      dialogOptions.buttons = [
        {
          "response":"ok",
          "label":I18n.getTrans("i.button_ok"),
        }, {
          "response":"nok",
          "label":I18n.getTrans("i.button_nok"),
        },
      ];
    }
    
    if(typeof callback === "function"){
      dialogOptions.closeCallback = function(dialogResponse){
        callback(((settings.restoreState==="AUTO_NOTIFICATION")||(dialogResponse.choice==="ok")));
      }.bind(this);
    }

    this._displayDialog(dialogOptions);
  };

  this._displayStartDialog = function(callback){
    let dialogOptions = {};
    dialogOptions.title = I18n.getTrans("i.start_title");
    dialogOptions.text = I18n.getTrans("i.start_text");
    dialogOptions.buttons = [
      {
        "response":"ok",
        "label":I18n.getTrans("i.button_ok"),
      }, {
        "response":"nok",
        "label":I18n.getTrans("i.button_nok"),
      },
    ];
    
    if(typeof callback === "function"){
      dialogOptions.closeCallback = function(dialogResponse){
        callback(dialogResponse.choice==="ok");
      }.bind(this);
    }
    this._displayDialog(dialogOptions);
  };

  this._displayInitializationErrorDialog = function(callback){
    if (isInitializationErrorShown===true) return;
    isInitializationErrorShown = true;

    let errorMessage;
    if ((initializationErrors instanceof Array)&&(initializationErrors.length > 0)&&(typeof initializationErrors[0]==="string")&&(initializationErrors[0].trim() !== '')){
      errorMessage = initializationErrors[0];
    } else {
      errorMessage = "Escapp Client could not be started correctly due to an unknown error.";
    }
    try {
      let dialogOptions = {};
      dialogOptions.icon = undefined;
      dialogOptions.escapp = false;
      dialogOptions.ignoreSilent = true;
      try {
        dialogOptions.title = I18n.getTrans("i.initialization_error_title");
        dialogOptions.text = (errorMessage.startsWith("i.") ? I18n.getTrans(errorMessage) : errorMessage);
      } catch(e){}

      if((typeof dialogOptions.title !== "string")||(dialogOptions.title.trim() === '')){
        dialogOptions.title = "Escapp client initialization error";
      }
      if((typeof dialogOptions.text !== "string")||(dialogOptions.text.trim() === '')){
        dialogOptions.text = errorMessage;
      }
      dialogOptions.closeCallback = function(dialogResponse){
        isInitializationErrorShown = false;
        this._safeCall(callback);
      }.bind(this);
      this._displayDialog(dialogOptions);
    } catch (e){
      alert(errorMessage);
      isInitializationErrorShown = false;
      this._safeCall(callback);
    }
  };

  this._displayConnectionErrorDialog = function(cancelable,callback){
    let dialogOptions = {};
    dialogOptions.title = I18n.getTrans("i.connecton_error_title");
    dialogOptions.text = I18n.getTrans("i.connecton_error_text"); 
    dialogOptions.buttons = [
      {
        "response":"retry",
        "label":I18n.getTrans("i.button_retry"),
      }
    ];
    if(cancelable===true){
      dialogOptions.buttons.push({
        "response":"nok",
        "label": I18n.getTrans("i.button_nok"),
      });
    }
    dialogOptions.closeCallback = function(dialogResponse){
      this._safeCall(callback,dialogResponse.choice);
    }.bind(this);
    this._displayDialog(dialogOptions);
  };


  //////////////////
  // Notifications
  //////////////////

  this._displayNotification = function(options = {}){
    options = Utils.deepMerge({escapp:true},options);
    return Notifications.displayNotification(options);
  };

  this.displayCustomNotification = function(text,extraOptions){
    let notificationOptions = {text: text, escapp: false, icon: undefined};
    if(typeof extraOptions === "object"){
      notificationOptions = Object.assign(notificationOptions,extraOptions);
    }
    this._displayNotification(notificationOptions);
  };

  this.displayCustomEscappNotification = function(text,extraOptions){
    let notificationOptions = Utils.deepMerge((extraOptions || {}),{escapp: true});
    this.displayCustomNotification(text,notificationOptions);
  };

  this._displayStartNotification = function(){
    if(typeof settings.teamName === "undefined"){
      return false;
    }
    if(this._getNewestState().puzzlesSolved.length !== 0){
      return false;
    }

    let notificationOptions = {};
    notificationOptions.text = I18n.getTrans("i.notification_start", {team: settings.teamName});
    this._displayNotification(notificationOptions);
  };


  //////////////////
  // Animations
  //////////////////

  this.startAnimation = function(animation,time){
    Animations.startAnimation(animation,time);
  };

  this.stopAnimation = function(animation){
    Animations.stopAnimation(animation);
  };


  //////////////////
  // Escape room state management
  //////////////////

  this._validateStateToRestore = function(callback){
    if(settings.restoreState==="NEVER"){
      return this._safeCall(callback);
    }

    let remoteStateIsNewest = this._isRemoteStateNewest();
    let erStateToRestore = this._getNewestState();

    if((settings.restoreState==="AUTO")||(remoteStateIsNewest===false)){
      return this._updateErStates(erStateToRestore,callback);
    }

    if((settings.relatedPuzzleIds instanceof Array)&&(settings.relatedPuzzleIds.length > 0)){
      if(this._isRemoteStateNewestForApp()===false){
        //State is new but not for this app. Prevent dialog, but update.
        return this._updateErStates(erStateToRestore,callback);
      }
    }

    //Ask or notify before returning remoteErState
    this._displayRestoreStateDialog(function(success){
      if(success===false){
        erStateToRestore = settings.localErState;
      }
      return this._updateErStates(erStateToRestore,callback);
    }.bind(this));
  };

  this._updateErStates = function(erStateToRestore,callback){
    if(this._validateERState(erStateToRestore)){
      settings.localErState = erStateToRestore;
      LocalStorage.saveSetting("localErState",settings.localErState);
      settings.remoteErState = undefined;

      //Update states
      this._updateAppPuzzlesState();
      this._updateTrackingLocalErState();
    }
    this._safeCall(callback,erStateToRestore);
  };

  this._updateRemoteErState = function(remoteErState){
    if((this._validateERState(remoteErState) === false)||(settings.preview)) return;
    settings.remoteErState = remoteErState;

    //Check restart
    let er_restarted = false;
    if(this._validateERState(settings.localErState)&&(typeof settings.localErState.startTime !== "undefined")){
      if(settings.localErState.startTime !== remoteErState.startTime){
        //The user has restarted the escape room
        settings.localErState = settings.remoteErState;
        er_restarted = true;
      }
    }

    //Add data from remoteErState to the localErState
    //These data must be integrated into the localErState even the user rejects to restore the state
    let erStateKeys = ["nPuzzles","hintsAllowed","startTime","remainingTime","duration","teamId","teamMembers","ranking"];
    for(let i=0; i<erStateKeys.length; i++){
      if((typeof settings.localErState[erStateKeys[i]] === "undefined")&&(typeof remoteErState[erStateKeys[i]] !== "undefined")){
        settings.localErState[erStateKeys[i]] = remoteErState[erStateKeys[i]];
      }
    }

    //Puzzle data
    if((typeof settings.remoteErState.puzzleData === "object")&&(Object.keys(settings.remoteErState.puzzleData).length > 0)){
      for(let x=0; x<settings.localErState.puzzlesSolved.length; x++){
        let puzzleData = settings.remoteErState.puzzleData[settings.localErState.puzzlesSolved[x]]
        if(typeof puzzleData === "object"){
          settings.localErState.puzzleData[settings.localErState.puzzlesSolved[x]] = puzzleData;
        }
      }
    }

    //Update nextPuzzleId and allPuzzlesSolved
    this._updateAppPuzzlesState();

    //Progress and score
    this._updateTrackingLocalErState();

    if(this._validateERState(settings.localErState)){
      LocalStorage.saveSetting("localErState",settings.localErState);
    }

    if(er_restarted){
      if(typeof settings.onErRestartCallback === "function"){
        settings.onErRestartCallback(settings.remoteErState);
      }
    }
  };

  this._updateTrackingLocalErState = function(){
    //Progress
    settings.localErState.progress = 100.0 * settings.localErState.puzzlesSolved.length/settings.localErState.nPuzzles;

    //Score
    let newScore = 0;
    let pDataKeys = Object.keys(settings.localErState.puzzleData);
    for(let y=0; y<pDataKeys.length; y++){
      newScore = newScore + settings.localErState.puzzleData[pDataKeys[y]].score;
    }
    settings.localErState.score = newScore;
  };

  this._updateSettingsFromInitialErState = function(erState){
    if(this._validateERState(erState) === false){
      return;
    }
    let teamName = this._getTeamNameFromERState(erState);
    if(typeof teamName === "string"){
      settings.teamName = teamName;
    }
    if(typeof erState.duration === "number"){
      settings.duration = erState.duration;
    }
    if(typeof erState.remainingTime === "number"){
      settings.remainingTime = erState.remainingTime;
    }
    if((settings.preview)&&(typeof settings.remainingTime !== "number")&&(typeof settings.duration === "number")){
      settings.remainingTime = settings.duration;
    }
  };

  this._updateAppPuzzlesState = function(){
     let _nextPuzzleId;
     let _allPuzzlesSolved = false;

     if((settings.linkedPuzzleIds instanceof Array)&&(settings.linkedPuzzleIds.length > 0)){
      if((typeof settings.localErState === "object")&&(settings.localErState.puzzlesSolved instanceof Array)){
        let puzzlesUnsolved = settings.linkedPuzzleIds.filter(puzzleId => !settings.localErState.puzzlesSolved.includes(puzzleId));
        if(puzzlesUnsolved.length > 0){
          _nextPuzzleId = Math.min(...puzzlesUnsolved);
        } else {
          _allPuzzlesSolved = true;
          _nextPuzzleId = Math.max(...settings.linkedPuzzleIds);
        }
      }
    }
    settings.nextPuzzleId = _nextPuzzleId;
    settings.allPuzzlesSolved = _allPuzzlesSolved;
  };

  this._getNewestState = function(){
    return (this._isRemoteStateNewest() ? settings.remoteErState : settings.localErState);
  };

  this._isRemoteStateNewest = function(appScope){
    let localErStateValid = this._validateERState(settings.localErState);
    let remoteErStateValid = this._validateERState(settings.remoteErState);

    if(remoteErStateValid===false){
      return false;
    }
    if(localErStateValid===false){
      return true;
    }

    if(appScope===true){
      if((settings.relatedPuzzleIds instanceof Array)&&(settings.relatedPuzzleIds.length > 0)){
        //Filter
        let _localErState = Utils.deepMerge({},settings.localErState);
        _localErState.puzzlesSolved = _localErState.puzzlesSolved.filter(puzzle_id => settings.relatedPuzzleIds.indexOf(puzzle_id)!==-1);
        let _remoteErState = Utils.deepMerge({},settings.remoteErState);
        _remoteErState.puzzlesSolved = _remoteErState.puzzlesSolved.filter(puzzle_id => settings.relatedPuzzleIds.indexOf(puzzle_id)!==-1);
        return this._isStateNewestThan(_remoteErState,_localErState);
      }
    }

    return this._isStateNewestThan(settings.remoteErState,settings.localErState);
  };

  this._isStateNewestThan = function(erStateA,erStateB){
    if(erStateA.puzzlesSolved.length === 0){
      return false;
    }
    if(erStateB.puzzlesSolved.length === 0){
      return true;
    }
    //Current version assumes that the ER has a linear structure of puzzles.
    return (erStateA.puzzlesSolved.length > erStateB.puzzlesSolved.length);
  };

  this._isRemoteStateNewestForApp = function(){
    return this._isRemoteStateNewest(true);
  };

  this._validateERState = function(erState){
    return ((typeof erState === "object")&&(erState.puzzlesSolved instanceof Array));
  };


  //////////////////
  // Interaction with Escapp API
  //////////////////

  this._auth = function(user,callback){
    let userCredentials = this._getUserCredentials(user);
    if(typeof userCredentials === "undefined"){
      //Invalid params
      return this._safeCall(callback,false);
    }

    let that = this;
    let authUserURL = settings.endpoint + "/auth";
    let body = Object.assign({}, userCredentials);
    body.preview = settings.preview;

    fetch(authUserURL, {
        "method": "POST",
        "body": JSON.stringify(body),
        headers: {
            "Content-type": "application/json",
            "Accept-Language": "es-ES"
        }
    })
    .then(res => res.json()).then(function(res){
      delete userCredentials.password;
      settings.user = userCredentials;
      if(typeof res.token === "string"){
        settings.user.token = res.token;
      }
      settings.user.authenticated = (res.authentication === true);
      settings.user.participation = res.participation;
      LocalStorage.saveSetting("user", settings.user);

      that._updateSettingsFromInitialErState(res.erState);
      that._updateRemoteErState(res.erState);

      that._safeCall(callback,settings.user.authenticated);
    }).catch(function(error){
       that._displayConnectionErrorDialog(false,function(){
          that._auth(user,callback);
       });
    });
  };

  this.retrieveState = function(callback){
    this._auth(settings.user,function(success){
      if((success)&&(settings.user.authenticated)){
        //User is authenticated.

        //Preview mode
        if (settings.preview){
          if(["AUTHOR","PARTICIPANT"].indexOf(settings.user.participation) !== -1){
            //User can show preview
            return this._validateUserAfterAuth(callback);
          } else {
            //Preview mode is always silent
            return this._safeCall(callback,false);
          }
        }

        //Play mode
        if(["PARTICIPANT","NOT_STARTED"].indexOf(settings.user.participation) !== -1){
          //User is a valid participant.
          if (settings.user.participation === "NOT_STARTED"){
            //User is authenticated and a participant, but the escape room needs to be started.
            if (settings.silent) return this._safeCall(callback,false);
            //Ask the participant if he/she wants to start the escape room.
            return this._startEscapeRoom(function(started){
              if(started === true){
                return this._validateUserAfterAuth(callback);
              } else {
                return this.validateUser(callback);
              }
            }.bind(this));
          } else {
            return this._validateUserAfterAuth(callback);
          }
        } else {
          if (settings.silent) return this._safeCall(callback,false);
          return this._displayUserParticipationErrorDialog(function(){
            this._safeCall(callback,false);
          }.bind(this));
        }
      } else {
        this._safeCall(callback,false);
      }
    }.bind(this));
  };

  this.submitPuzzle = function(puzzleId,solution,options={},callback){
    if((this.isUserValidParticipant()===false)&&(!settings.silent)) return this._displayUserParticipationErrorDialog(callback);

    let userCredentials = this._getUserCredentials(settings.user);
    if(typeof userCredentials === "undefined"){
      return this._safeCall(callback,false,{msg: "Invalid params"});
    }
    if(typeof puzzleId === "undefined"){
      return this._safeCall(callback,false,{msg: "Puzzle id not provided"});
    }
    if(settings.puzzlesRequirements !== true){
      return this._safeCall(callback,false,{msg: "Invalid puzzle requirements"});
    }
    if(settings.preview){
      options.readonly = true;
    }

    let that = this;
    let submitPuzzleURL = settings.endpoint + "/puzzles/" + puzzleId + ((options.readonly === true) ? "/check_solution" : "/submit");
    let body = userCredentials;
    body.solution = solution;
    body.preview = settings.preview;
    
    fetch(submitPuzzleURL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json",
        "Accept-Language": "es-ES"
      }
    }).then(res => res.json()).then(function(res){
        let validUser = ((res.participation === "PARTICIPANT")||((settings.preview)&&(["AUTHOR"].indexOf(settings.user.participation) !== -1)));
        if(!validUser){
          if(!settings.silent) {
            return that._displayUserParticipationErrorDialog(function(){
              this._safeCall(callback,false,res);
            }.bind(that));
          } else {
            return that._safeCall(callback,false,res);
          }
        }

        let success = ((res.code === "OK")&&(res.correctAnswer === true));
        if(options.readonly !== true){
          if(success){
            //Puzzle solved
            if(that._validateERState(settings.localErState)){
              if(settings.localErState.puzzlesSolved.indexOf(puzzleId)===-1){
                settings.localErState.puzzlesSolved.push(puzzleId);
                LocalStorage.saveSetting("localErState",settings.localErState);
              }
            }
          }
          that._updateRemoteErState(res.erState);
        }
        that._safeCall(callback,success,res);
      }
    ).catch(function(error){
      if(settings.silent) return that._safeCall(callback,false);
      that._displayConnectionErrorDialog(true,function(dialogResponse){
        if(dialogResponse === "retry"){
          that.submitPuzzle(puzzleId,solution,options,callback);
        }
      });
    });
  };

  this.checkPuzzle = function(puzzleId,solution,options={},callback){
    options.readonly = true;
    this.submitPuzzle(puzzleId,solution,options,callback);
  };

  this.submitNextPuzzle = function(solution,options={},callback){
    this.submitPuzzle(this.getNextPuzzle(),solution,options,callback);
  };

  this.checkNextPuzzle = function(solution,options={},callback){
    options.readonly = true;
    this.checkPuzzle(this.getNextPuzzle(),solution,options,callback);
  };

  this.start = function(callback){
    let userCredentials = this._getUserCredentials(settings.user);
    if((typeof userCredentials === "undefined")||(this.isUserLoggedIn()===false)){
      return this._safeCall(callback,false);
    }

    let that = this;
    let startURL = settings.endpoint + "/start";
    let body = userCredentials;

    fetch(startURL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json",
        "Accept-Language": "es-ES"
      }
    }).then(res => res.json()).then(function(res){
        that._updateRemoteErState(res.erState);
        let startSuccess = (res.code === "OK");
        if(startSuccess){
          that._updateSettingsFromInitialErState(res.erState);
          settings.user.participation = res.participation;
          LocalStorage.saveSetting("user", settings.user);
        }
        that._safeCall(callback,startSuccess,res);
      }
    ).catch(function(error){
      if(settings.silent) return that._safeCall(callback,false);
      that._displayConnectionErrorDialog(true,function(dialogResponse){
        if(dialogResponse === "retry"){
          that.start(callback);
        } else {
          //dialogResponse === "nok")
          that._safeCall(callback,false);
        }
      }.bind(that));
    }); 
  };


  ///////////////////////
  // RTC (Real Time Communication)
  ///////////////////////

  this._connect = function(){
    if(settings.rtc !== true) return;
    let userCredentials = this._getUserCredentials(settings.user);
    if(typeof userCredentials !== "undefined"){
      Events.connect(userCredentials,settings);
    }
  };

  this._getTeamNameFromERState = function(erState){
    let team = this._getTeamFromERState(erState);
    return (typeof team === "object") ? team.name : undefined;
  };

  this._getMemberNameFromERState = function(erState,memberEmail){
    let team = this._getTeamFromERState(erState);
    if((typeof team === "undefined")||(!(team.teamMembers instanceof Array))){
      return undefined;
    }
    for(let i=0; i<team.teamMembers.length; i++){
      if(team.teamMembers[i].username === memberEmail){
        return team.teamMembers[i].name; //+team.teamMembers[i].surname
      }
    }
    return undefined;
  };

  this._getTeamFromERState = function(erState){
    return this._getTeamFromRanking(erState.teamId,erState.ranking);
  };

  this._getTeamFromRanking = function(teamId,ranking){
    if((typeof teamId === "number")&&(ranking instanceof Array)){
      for(let i=0; i<ranking.length; i++){
        if(ranking[i].id === teamId){
          return ranking[i];
        }
      }
    }
    return undefined;
  };


  //////////////////
  // Utils
  //////////////////

  this._hasBeenSuccesfullyInitialized = function(){
    return succesfullyInitialized;
  };

  this.getSettings = function(){
    return settings;
  };

  this.getAppSettings = function(){
    return appSettings;
  };

  this.registerCallback = function(callbackName, callbackFunction){
    const callbackNames = ["initCallback", "onNewErStateCallback", "onErRestartCallback"];
    if((typeof callbackName === "string")&&(callbackNames.indexOf(callbackName) != -1)&&(typeof callbackFunction === "function")){
      settings[callbackName] = callbackFunction;
    }
  };

  this.getStorage = function(){
    return LocalStorageApp;
  };

  this.getJQuery = function(){
    return jQuery;
  };

  this.isUserLoggedIn = function(){
    return (settings.user.authenticated === true);
  };

  this.isUserValidParticipant = function(){
    if ((typeof this._getUserCredentials(settings.user) === "undefined")||(settings.user.authenticated !== true)) return false;
    if (settings.user.participation==="PARTICIPANT") return true;
    if ((settings.preview)&&(["AUTHOR"].indexOf(settings.user.participation) !== -1)) return true;
    return false;
  };

  this.isPreviewMode = function(){
    return settings.preview;
  };

  this.getNextPuzzle = function(){
    return settings.nextPuzzleId;
  };

  this.getAllPuzzlesSolved = function(){
    return settings.allPuzzlesSolved;
  };

  this._onTimeRunOut = function(){
    if((this._validateERState(settings.localErState)) && (settings.localErState.strictTime === true)){
      settings.user.participation = "TOO_LATE";

      if((!settings.silent)&&(Countdown.getNotificationsEnabled() === false)){
        //Notify when time runs out through dialogs when time notifications are not enabled
        this.displayCustomEscappDialog(I18n.getTrans("i.notification_time_runout_title"),I18n.getTrans("i.notification_time_runout"),{});
      }
    }
  };

  this.isERCompleted = function(){
    let erState = this._getNewestState();
    if((this._validateERState(erState))&&(erState.puzzlesSolved instanceof Array)&&(typeof erState.nPuzzles === "number")){
      return (erState.puzzlesSolved.length === erState.nPuzzles);
    }
    return false;
  };

  this.isEREnded = function(){
    return ((this.isERCompleted())||(Countdown.getTimeRunout()));
  };

  this.reset = function(callback){
    this._resetUser();
    LocalStorage.clear();
    this._safeCall(callback);
  };

  this.encrypt = function(value,algorithm,options={}){
    return Encrypt.encrypt(value,algorithm,options);
  };

  this.addEscappSettingsToUrl = function(url){
    return this._addEndpointParamToUrl(this._addLocaleParamToUrl(this._addUserCredentialsToUrl(url)));
  };

  this._addUserCredentialsToUrl = function(url){
    let userCredentials = this._getUserCredentials(settings.user);
    if(typeof userCredentials === "undefined"){
      return url;
    }
    url = Utils.addParamToUrl(url,"escapp_email",userCredentials.email);
    url = Utils.addParamToUrl(url,"escapp_token",userCredentials.token);
    //Password is never shown on URLs.
    return url;
  };

  this._addLocaleParamToUrl = function(url){
    let urlParams = Utils.getParamsFromCurrentUrl();
    if(typeof urlParams.locale === "string"){
      url = Utils.addParamToUrl(url,"locale",urlParams.locale);
    }
    return url;
  };

  this._addEndpointParamToUrl = function(url){
    let urlParams = Utils.getParamsFromCurrentUrl();
    if(typeof urlParams.escapp_endpoint === "string"){
      url = Utils.addParamToUrl(url,"escapp_endpoint",urlParams.escapp_endpoint);
    }
    return url;
  };

  this._safeCall = function(callback, ...args) {
    if (typeof callback === "function") {
      callback(...args);
    }
  };


  //////////////////
  // Init Escapp client
  //////////////////

  this.init(_settings);

  //Validate after init if autovalidation is enabled
  if(settings.autovalidate === true){
    this.validate(settings.initCallback);
  } else {
    if(typeof settings.initCallback === "function"){
      settings.initCallback();
    }
  }

};

window.ESCAPP = ESCAPP;