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

addEventListener("load", ()=>{
  setDayNightTheme();
});