import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { PanelLayout } from '@lumino/widgets';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  NotebookActions,
  NotebookPanel,
  INotebookModel,
} from '@jupyterlab/notebook';

import '../style/index.css';

/**
 * Initialization data for the jupyterlab-hide-code extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-hide-code',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
    console.log('JupyterLab extension jupyterlab-hide-code is activated!');
  },
};

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const hideInputCode = () => {
      NotebookActions.runAll(panel.content, context.sessionContext);

      panel.content.widgets.forEach((cell) => {
        if (cell.model.type === 'code') {
          const layout = cell.layout as PanelLayout;
          layout.widgets[1].hide();
        }
      });
      buttonHideInput.hide();
      buttonShowInput.show();
    };
    const showInputCode = () => {
      panel.content.widgets.forEach((cell) => {
        if (cell.model.type === 'code') {
          const layout = cell.layout as PanelLayout;
          layout.widgets[1].show();
        }
      });

      buttonHideInput.show();
      buttonShowInput.hide();
    };

    const buttonHideInput = new ToolbarButton({
      className: 'myButton',
      iconClass: 'fa fa-sm fa-eye-slash fontawesome-colors',
      onClick: hideInputCode,
      tooltip: 'Hide Input',
    });

    const buttonShowInput = new ToolbarButton({
      className: 'myButton',
      iconClass: 'fa fa-sm fa-eye fontawesome-colors',
      onClick: showInputCode,
      tooltip: 'Show Input',
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

export default extension;
