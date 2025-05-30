let localStorage;
let enabled = false;
let appKey = "appData";

export function init(_localStorage,preview){
  localStorage = _localStorage;
  enabled = ((typeof localStorage !== "undefined")&&(!preview));
}

export function getSetting(settingName){
  return enabled ? localStorage.getChildSetting(appKey,settingName) : undefined;
}

export function saveSetting(settingName,value){
	return enabled ? localStorage.saveChildSetting(appKey,settingName,value) : undefined;
}

export function removeSetting(settingName){
  return enabled ? localStorage.removeChildSetting(appKey,settingName) : undefined;
}

export function clear(){
  return enabled ? localStorage.removeSetting(appKey) : undefined;
}