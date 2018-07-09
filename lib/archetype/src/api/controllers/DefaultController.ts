import { FabrixController as Controller } from '@fabrix/fabrix/dist/common'

/**
 * @module DefaultController
 *
 * @description Default Controller included with a new fabrix app
 * @see {@link http://fabrix.app/doc/api/controllers}
 * @this fabrixApp
 */
export class DefaultController extends Controller {

  /**
   * Return some info about this application
   */
  info(req, res) {
    res.status(200).json(this.app.services.DefaultService.getApplicationInfo())
  }
}
