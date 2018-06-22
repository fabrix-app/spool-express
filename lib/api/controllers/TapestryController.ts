import { Request, Response } from 'express'
import { FabrixController as Controller } from '@fabrix/fabrix/dist/common/Controller'

import { TapestryService as TTapestryService } from '@fabrix/spool-tapestries/dist/api/services'
import { ExpressSpool } from '../../ExpressSpool'

const manageErrors = (app, error) => {
  app.log.error(error)
  if (app.env.NODE_ENV !== 'production') {
    app.log.warn('this payload error is for development purpose only and will only log on production')
    return error
  }
  return new Error()
}

/**
 * Tapestry Controller
 *
 * Parse the path and query params and forward them to the TapestryService.
 * The TapestryService is provided by any ORM spool, e.g.
 * spool-waterline, spool-sequelize, etc.
 *
 * @see {@link http://expressjs.com/en/4x/api.html#req}
 */
export class TapestryController extends Controller {
  create(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)

    TapestryService.create(req.params.model, req.body, options)
      .then(elements => {
        res.status(200).json(elements || {})
      }).catch(error => {
        if (error.code === 'E_VALIDATION') {
          res.status(400).json(error)
        }
        else if (error.code === 'E_NOT_FOUND') {
          res.status(404).json(error)
        }
        else {
          res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
        }
      })
  }

  find(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService  as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)
    const criteria = spoolExpress.getCriteriaFromQuery(req.query)
    const id = req.params.id
    let response

    if (id) {
      response = TapestryService.find(req.params.model, id, options)
    }
    else {
      response = TapestryService.find(req.params.model, criteria, options)
    }

    response.then(elements => {
      res.status(elements ? 200 : 404).json(elements || {})
    }).catch(error => {
      if (error.code === 'E_VALIDATION') {
        res.status(400).json(error)
      }
      else if (error.code === 'E_NOT_FOUND') {
        res.status(404).json(error)
      }
      else {
        res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
      }
    })

  }

  update(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)
    const criteria = spoolExpress.getCriteriaFromQuery(req.query)

    const id = req.params.id
    this.log.debug('[TapestryController] (update) model =',
      req.params.model, ', criteria =', req.query, id,
      ', values = ', req.body)
    let response

    if (id) {
      response = TapestryService.update(req.params.model, id, req.body, options)
    }
    else {
      response = TapestryService.update(req.params.model, criteria, req.body, options)
    }

    response.then(elements => {
      res.status(200).json(elements || {})
    }).catch(error => {
      if (error.code === 'E_VALIDATION') {
        res.status(400).json(error)
      }
      else if (error.code === 'E_NOT_FOUND') {
        res.status(404).json(error)
      }
      else {
        res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
      }
    })

  }

  destroy(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)
    const criteria = spoolExpress.getCriteriaFromQuery(req.query)
    const id = req.params.id
    let response

    if (id) {
      response = TapestryService.destroy(req.params.model, id, options)
    }
    else {
      response = TapestryService.destroy(req.params.model, criteria, options)
    }

    response.then(elements => {
      res.status(200).json(elements || {})
    }).catch(error => {
      if (error.code === 'E_VALIDATION') {
        res.status(400).json(error)
      }
      else if (error.code === 'E_NOT_FOUND') {
        res.status(404).json(error)
      }
      else {
        res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
      }
    })
  }

  createAssociation(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)
    TapestryService.createAssociation(req.params.parentModel, req.params.parentId, req.params.childAttribute, req.body, options)
      .then(elements => {
        res.status(200).json(elements || {})
      }).catch(error => {
        if (error.code === 'E_VALIDATION') {
          res.status(400).json(error)
        }
        else if (error.code === 'E_NOT_FOUND') {
          res.status(404).json(error)
        }
        else {
          res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
        }
      })

  }

  findAssociation(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)
    const criteria = spoolExpress.getCriteriaFromQuery(req.query)
    const parentModel = req.params.parentModel
    const parentId = req.params.parentId
    const childAttribute = req.params.childAttribute
    const childId = req.params.childId
    let response

    if (childId) {
      response = TapestryService.findAssociation(parentModel,
        parentId, childAttribute, childId, options)
    }
    else {
      response = TapestryService.findAssociation(parentModel,
        parentId, childAttribute, criteria, options)
    }

    response.then(elements => {
      res.status(elements ? 200 : 404).json(elements || {})
    }).catch(error => {
      if (error.code === 'E_VALIDATION') {
        res.status(400).json(error)
      }
      else if (error.code === 'E_NOT_FOUND') {
        res.status(404).json(error)
      }
      else {
        res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
      }
    })
  }

  updateAssociation(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)
    const criteria = spoolExpress.getCriteriaFromQuery(req.query)
    const parentModel = req.params.parentModel
    const parentId = req.params.parentId
    const childAttribute = req.params.childAttribute
    const childId = req.params.childId
    let response
    if (childId) {
      response = TapestryService.updateAssociation(parentModel,
        parentId, childAttribute, childId, req.body, options)
    }
    else {
      response = TapestryService.updateAssociation(parentModel,
        parentId, childAttribute, criteria, req.body, options)
    }

    response.then(elements => {
      res.status(200).json(elements || {})
    }).catch(error => {
      if (error.code === 'E_VALIDATION') {
        res.status(400).json(error)
      }
      else if (error.code === 'E_NOT_FOUND') {
        res.status(404).json(error)
      }
      else {
        res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
      }
    })
  }

  destroyAssociation(req: Request, res: Response) {
    const TapestryService = this.app.services.TapestryService as TTapestryService
    const spoolExpress = this.app.spools.express as ExpressSpool
    const options = spoolExpress.getOptionsFromQuery(req.query)
    const criteria = spoolExpress.getCriteriaFromQuery(req.query)

    const parentModel = req.params.parentModel
    const parentId = req.params.parentId
    const childAttribute = req.params.childAttribute
    const childId = req.params.childId
    let response
    if (childId) {
      response = TapestryService.destroyAssociation(parentModel,
        parentId, childAttribute, childId, options)
    }
    else {
      response = TapestryService.destroyAssociation(parentModel,
        parentId, childAttribute, criteria, options)
    }

    response.then(elements => {
      res.status(200).json(elements || {})
    }).catch(error => {
      if (error.code === 'E_VALIDATION') {
        res.status(400).json(error)
      }
      else if (error.code === 'E_NOT_FOUND') {
        res.status(404).json(error)
      }
      else {
        res.status(500).send(res.boom.wrap(manageErrors(this.app, error), 500))
      }
    })
  }
}
