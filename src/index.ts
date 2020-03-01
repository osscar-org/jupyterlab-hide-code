import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the jupyterlab-hide-code extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-hide-code',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-hide-code is activated!');
  }
};

export default extension;
