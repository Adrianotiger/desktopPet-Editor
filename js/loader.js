window.addEventListener("load", ()=>{
  let divParent = document.getElementsByClassName("tabcollection")[0];

  let div = _CN("div", {class:"infobox tabdiv"}, [], divParent);

  let divLoader = _CN("div", {style:"background:black;color:yellow;margin:0 auto;text-align:center;font-size:150%;"}, ["LOADING..."]);

  _CN("div", {class:"messagebox"}, [
    _CN("h2", {}, ["Preview"]),
    _CN("p", {}, ["This is just a preview. It doesn't fully works.", _CN("br"), "It is just a preview of the development of this project"]),
    divLoader
  ], div);

  setTimeout(()=>{loaderScripts(divLoader, div, divParent);}, 100);
  
});

async function loaderScripts(div, tabDiv, divMain)
{
  const scripts = ["message", "menu", "tab", "console", "xml"];
  let loadedScripts = 0;
  div.textContent = `Loading scripts (0/${scripts.length})...`;
  scripts.forEach((s)=>{
    _CN("script", {src:`js/${s}.js`}, [], document.head).addEventListener("load",()=>{
      if(++loadedScripts == scripts.length)
      {
        loaderFinished(divMain, tabDiv);
      }
      div.textContent = `Loading scripts (${loadedScripts}/${scripts.length})...`;
    });
  });
}

function loaderFinished(divMain, tabDiv)
{
  setTimeout(()=>{
    setTimeout(()=>{divMain.removeChild(tabDiv);}, 500);
    Menu.execute("open");
  }, 2000);
}