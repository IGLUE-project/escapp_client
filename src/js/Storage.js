let lsSupported = false;
let enabled = false;
let storageKey;

export function init(_storageKey,preview){
  if ((typeof storageKey !== "undefined")||(typeof _storageKey !== "string")) return;
  storageKey = _storageKey;
  lsSupported = isSupported();
  enabled = ((lsSupported)&&(!preview));
}

export function isSupported(){
  return (!!window.localStorage
    && typeof localStorage.getItem === 'function'
    && typeof localStorage.setItem === 'function'
    && typeof localStorage.removeItem === 'function');
}

function getData(){
  if (!enabled) return {};
  let storedData = localStorage.getItem(storageKey);
  if((typeof storedData === "undefined")||(storedData === null)){
    return {};
  }
  try {
    return JSON.parse(storedData);
  } catch (e){
    return {};
  }
}

function saveData(data){
  if (!enabled) return undefined;
  try {
    data = JSON.stringify(data);
    localStorage.setItem(storageKey,data);
  } catch (e){
    return undefined;
  }
  return data;
}

export function getSetting(settingName){
  if (!enabled) return undefined;
  let data = getData();
  if(typeof data === "object"){
    return data[settingName];
  }
  return undefined;
}

export function saveSetting(settingName,value){
  if (!enabled) return undefined;
  let data = getData();
  if(typeof data === "object"){
    data[settingName] = value;
    return saveData(data);
  }
  return undefined;
}

export function removeSetting(settingName){
  if (!enabled) return undefined;
  let data = getData();
  if(typeof data === "object"){
    delete data[settingName];
    return saveData(data);
  }
  return undefined;
}

export function clear(){
  if (lsSupported) {
    localStorage.removeItem(storageKey);
  }
  return undefined;
}

export function getChildSetting(parentSetting,settingName){
  if (!enabled) return undefined;
  let data = getSetting(parentSetting);
  if(typeof data === "object"){
    return data[settingName];
  }
  return undefined;
}

export function saveChildSetting(parentSetting,settingName,value){
  if (!enabled) return undefined;
  let data = getSetting(parentSetting);
  if(typeof data === "undefined"){
    data = {};
  }
  if(typeof data === "object"){
    data[settingName] = value;
    return saveSetting(parentSetting,data);
  }
  return undefined;
}

export function removeChildSetting(parentSetting,settingName){
  if (!enabled) return undefined;
  let data = getSetting(parentSetting);
  if(typeof data === "object"){
    delete data[settingName];
    return saveSetting(parentSetting,data);
  }
  return undefined;
}