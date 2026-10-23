// XML Checks functions

function checkAniNameExists(id, name)
{
  let ret = false;
  XML.getAnimations().forEach(a=>{
    if(a.id != id && a.name == name ) ret = true;
  });
  return ret;
}