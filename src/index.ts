import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { PanelLayout } from '@lumino/widgets';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  NotebookActions,
  NotebookPanel,
  INotebookModel
} from '@jupyterlab/notebook';

import '../style/index.css';

/**
 * Initialization data for the jupyterlab_hide_code extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_hide_code:plugin',
  description:
    'A button in JupyterLab to run the code cells and then to hide the code cells.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
    console.log('JupyterLab extension jupyterlab_hide_code is activated!');
  }
};

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    let hidden = false;

    // Block keyboard shortcuts that change cell type in command mode
    const blockCellTypeShortcuts = (event: KeyboardEvent) => {
      if (!hidden) {
        return;
      }
      // Let keys through when the event originates inside a cell's output
      // area — ipywidgets and similar interactive outputs live there and
      // may need keys for their own handlers.
      const target = event.target as HTMLElement | null;
      if (target && target.closest('.jp-OutputArea')) {
        return;
      }
      // Cell type: m, y, r, 1-6
      // Add/remove/reorder: a, b, d (dd), x, v, z, Shift+M
      const blockedKeys = [
        'm',
        'y',
        'r',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        'a',
        'b',
        'd',
        'x',
        'v',
        'z'
      ];
      const isBlocked =
        (blockedKeys.includes(event.key) &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey) ||
        (event.key === 'M' &&
          event.shiftKey &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey);
      if (isBlocked) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    const hideInputCode = () => {
      NotebookActions.runAll(panel.content, context.sessionContext);

      panel.content.widgets.forEach(cell => {
        if (cell.model.type === 'code') {
          const layout = cell.layout as PanelLayout;
          layout.widgets[1].hide();
        }
        if (cell.editor) {
          cell.editor.setOption('readOnly', true);
        }
      });

      hidden = true;
      panel.content.node.addEventListener(
        'keydown',
        blockCellTypeShortcuts,
        true
      );

      buttonHideInput.hide();
      buttonShowInput.show();
    };
    const showInputCode = () => {
      panel.content.widgets.forEach(cell => {
        if (cell.model.type === 'code') {
          const layout = cell.layout as PanelLayout;
          layout.widgets[1].show();
        }
        if (cell.editor) {
          cell.editor.setOption('readOnly', false);
        }
      });

      hidden = false;
      panel.content.node.removeEventListener(
        'keydown',
        blockCellTypeShortcuts,
        true
      );

      buttonHideInput.show();
      buttonShowInput.hide();
    };

    const buttonHideInput = new ToolbarButton({
      className: 'myButton',
      iconClass: 'fa fa-sm fa-eye-slash fontawesome-colors',
      onClick: hideInputCode,
      tooltip: 'Hide Input'
    });

    const buttonShowInput = new ToolbarButton({
      className: 'myButton',
      iconClass: 'fa fa-sm fa-eye fontawesome-colors',
      onClick: showInputCode,
      tooltip: 'Show Input'
    });

    buttonShowInput.hide();

    panel.toolbar.insertItem(11, 'hideInput', buttonHideInput);
    panel.toolbar.insertItem(11, 'showInput', buttonShowInput);

    return new DisposableDelegate(() => {
      buttonHideInput.dispose();
      buttonShowInput.dispose();
    });
  }
}

export default plugin;
