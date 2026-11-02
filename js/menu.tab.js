class TabMenuClass
{  
  #editIcons = [];

  constructor()
  {

  }

  removeIcons()
  {
    Menu.clearTabMenu();
    this.#editIcons = [];
  }
  
  addIcon(icon, title, event)
  {
    const subMenuIcon = new SubmenuIcon(icon, title, event);
    this.#editIcons.push(subMenuIcon);
    Menu.addTabMenu(subMenuIcon);
  }
  
};

const TabMenu = new TabMenuClass();