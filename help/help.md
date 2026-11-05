# DesktopPet Editor

DesktopPet Editor is a browser-based tool for creating, editing, and managing XML-defined DesktopPet animations. It is designed to help users build small animated pets and characters that can be used in different desktop environments, apps, and custom projects.

The project focuses on a simple visual workflow: open project files, edit the animation structure, adjust image/sprite data, tweak spawn and behavior settings, and save the result in a format that can be reused by compatible DesktopPet systems.

## Project purpose

This editor was created to make DesktopPet animation files easier to work with for developers, hobbyists, and creators who want to:

- design and fine-tune animated pets
- edit XML configuration and animation nodes visually
- manage sprite/image assets and animation timing
- prepare content for reuse in other projects
- share open and editable pet definitions

Because the generated animation data is XML-based and open to inspection, it can be adapted and reused beyond the original project if the community chooses to do so.

## Main features

- Open and edit DesktopPet project files
- Save projects and individual files in the editor
- Edit animation nodes and sequence data
- Modify header metadata and project information
- Manage sprite-sheet or image-based nodes
- Configure spawn behavior and placement settings
- Use a built-in formula editor for expressions and logic
- Work directly in the browser without requiring a local installation

## Supported editor areas

The interface is organized around several editing sections, including:

- Animation editor
- Header editor
- Image/Spritesheet editor
- Spawn editor
- Formula editor
- XML viewer for inspecting raw project data
- File/project management tools

Some features are still under development or planned for later versions, such as child node editing, sound configuration, and more advanced export/test workflows.

## How it works

The editor reads and writes XML-based DesktopPet definitions. These definitions describe the structure of the animated character, including:

- metadata and headers
- animation frames and timing
- movements and sequences
- imagery and sprite references
- spawn conditions and placement logic

This lets users edit the animation logically while keeping the result compatible with systems that consume the same XML format.

## Browser requirements

DesktopPet Editor is designed for modern browsers that support current web standards, especially the file-system and browser APIs needed to open local files and save project data.

Recommended usage:

- use a recent version of Chrome, Edge, Firefox, or another up-to-date browser
- keep JavaScript enabled
- run the project from a local web server or the GitHub Pages deployment

## Typical workflow

1. Open an existing project or create a new one.
2. Review or edit the animation and header data.
3. Adjust image, spawn, and behavior-related nodes.
4. Use the formula editor where custom logic is needed.
5. Save the project or export the edited file content.
6. Reuse the XML in compatible DesktopPet implementations.

## Project status

This project is currently in preview/development and continues to evolve. The current build includes the primary editing tools needed to work with animation structures, while some advanced features are still being added or refined.

## License

This project is distributed under the MIT License. See the license file in the project for full legal details.

## Repository and links

- GitHub project: https://github.com/Adrianotiger/desktopPet-Editor
- Demo / live preview: https://adrianotiger.github.io/desktopPet-Editor/

## Attribution

If you use this project in your own work, a reference or attribution to the original project is appreciated.

## Summary

DesktopPet Editor is a lightweight, browser-based toolkit for editing XML animations used by DesktopPet projects. It provides a clean interface to manage pet definitions, animation data, and project files in a way that is accessible to creators and developers working with open animation formats.

