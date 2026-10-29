// XML Checks functions

function checkAniNameExists(id, name)
{
  let ret = false;
  XML.animations.forEach(a=>{
    if(a.id != id && a.name == name ) ret = true;
  });
  return ret;
}