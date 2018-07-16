import { isPlainObject, isArray, isEmpty } from 'lodash'
import { FabrixPolicy as Policy } from '@fabrix/fabrix/dist/common/Policy'

/**
 * Tapestry Policy
 *
 * Validate tapestry reqs; namely, that the path parameters represent
 * actual and correct models anda actions. Semantic ORM input validation is
 * performed by the TapestryService.
 *
 * @see http://expressjs.com/en/4x/api.html#req
 */
export class TapestryPolicy extends Policy {
  /**
   * Create Policy.
   * @see TapestryController.create
   */
  create(req, res, next) {
    if (!isPlainObject(req.body) && !isArray(req.body)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.body'))
    }

    next()
  }

  /**
   * Find Policy.
   * @see TapestryController.find
   */
  find(req, res, next) {
    const criteria = this.app.spools.express.getCriteriaFromQuery(req.query)

    if (req.params.id && !isEmpty(criteria)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.find.mutex'))
    }

    next()
  }

  /**
   * Update Policy.
   * @see TapestryController.update
   */
  update(req, res, next) {
    if (req.params.id && !isEmpty(req.query)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.update.mutex'))
    }

    next()
  }

  /**
   * Destroy Policy.
   * @see TapestryController.destroy
   */
  destroy(req, res, next) {
    if (req.params.id && !isEmpty(req.query)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.destroy.mutex'))
    }

    next()
  }

  /**
   * Create Association Policy.
   * @see TapestryController.createAssociation
   */
  createAssociation(req, res, next) {
    if (!isPlainObject(req.body)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.body'))
    }

    next()
  }

  /**
   * Find Association Policy.
   * @see TapestryController.findAssociation
   */
  findAssociation(req, res, next) {
    const criteria = this.app.spools.express.getCriteriaFromQuery(req.query)
    if (req.params.childId && !isEmpty(criteria)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.find.mutex'))
    }

    next()
  }

  /**
   * Update Association Policy.
   * @see TapestryController.updateAssociation
   */
  updateAssociation(req, res, next) {
    if (req.params.childId && !isEmpty(req.query)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.update.mutex'))
    }

    next()
  }

  /**
   * Destroy Association Policy.
   * @see TapestryController.destroyAssociation
   */
  destroyAssociation(req, res, next) {
    if (req.params.childId && !isEmpty(req.query)) {
      return res.boom.preconditionFailed(this.__('errors.tapestries.destroy.mutex'))
    }

    next()
  }
}
