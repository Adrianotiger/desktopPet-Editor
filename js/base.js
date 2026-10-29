/*Create node: create element e, with attributes t as object, with array of html elements as r, appending this new element to parent n*/
function _CN(e,t,r,n=null){var o=document.createElement(e);if("object"==typeof t)for(var a in t)o.setAttribute(a,t[a]);return Array.isArray(r)&&r.forEach(e=>{o.appendChild("string"==typeof e||"number"==typeof e?document.createTextNode(e):e)}),null!==n&&n.appendChild(o),o};

function xmlNodeGet(node, name)
{
  const n = node.querySelector(name);
  if(!n) {console.error(`value '${name}' not found on node.`, node); return null;}
  if(!n.textContent) {console.error(`no value found on node.`, node); return null;}
  return n.textContent;
}

function xmlHasNode(node, name)
{
  const n = node.querySelector(name);
  if(!n) return false
  return true;
}

function xmlNodeGetNode(node, name)
{
  const n = node.querySelector(name);
  if(!n) {console.error(`node '${name}' not found on node.`, node); return null;}
  return n;
}

function xmlHasAttribute(node, name)
{
  const n = node.attributes[name];
  if(!n) return false
  return true;
}

function xmlAttrGet(node, name)
{
  const n = node.attributes[name];
  if(!n) {console.error(`Attribute '${name}' attribute not found on node.`, node); return null;}
  if(!n.textContent) {console.error(`no attribute value found on node.`, node); return null;}
  return n.textContent;
}

function setDayNightTheme(butt)
{
  const currentTheme = localStorage.getItem("pageTheme", "light");
  const newTheme = butt ? (currentTheme === 'dark' ? 'light' : 'dark') : currentTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  if(butt)
  {
    butt.textContent = (currentTheme === 'light' ? '🌙' : '☀️');
    localStorage.setItem("pageTheme", newTheme);
  }
}

let loadedScripts = [];
function loadScripts(scriptsArray, loadAsync)
{
  if(loadAsync)
  {
    scriptsArray.forEach(sn=>{
      if(loadedScripts.indexOf(sn) < 0)
      {
        loadedScripts.push(sn);
        _CN("script", {src:`js/${sn}.js`}, [], document.head);
      }
    });
  }
  else
  {
    const sn = scriptsArray.shift();
    if(loadedScripts.indexOf(sn) < 0)
    {
      loadedScripts.push(sn);
      _CN("script", {src:`js/${sn}.js`}, [], document.head).addEventListener("load", ()=>{
        if(scriptsArray.length > 0) loadScripts(scriptsArray, loadAsync);
      });
    }
    else
    {
      if(scriptsArray.length > 0) loadScripts(scriptsArray, loadAsync);
    }
  }
}

addEventListener("load", ()=>{
  setDayNightTheme();
});