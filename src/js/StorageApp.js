let localStorage;
let appKey = "appData";

export function init(_localStorage){
  localStorage = _localStorage;
}

export function getSetting(settingName){
  return (typeof localStorage === "undefined") ? undefined : localStorage.getChildSetting(appKey,settingName);
}

export function saveSetting(settingName,value){
  return (typeof localStorage === "undefined") ? undefined : localStorage.saveChildSetting(appKey,settingName,value);
}

export function removeSetting(settingName){
  return (typeof localStorage === "undefined") ? undefined : localStorage.removeChildSetting(appKey,settingName);
}

export function clear(){
  return (typeof localStorage === "undefined") ? undefined : localStorage.removeSetting(appKey);
}