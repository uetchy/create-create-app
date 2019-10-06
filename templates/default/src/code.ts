figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-rectangles') {
    const nodes = [];

    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  figma.closePlugin();
};

function getSelection(): string | null {
  const sel: SceneNode = figma.currentPage.selection[0];
  if (sel && 'characters' in sel) {
    const text = sel.characters;
    return text;
  }
  return null;
}

function main() {
  const text = getSelection();
  if (!text) {
    return figma.notify('No text layer selected');
  }
}

main();

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();
