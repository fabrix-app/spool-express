import { FabrixController as Controller } from '@fabrix/fabrix/dist/common'

export class ViewController extends Controller {
  helloWorld(req, res) {
    res.status(200).send('Hello Fabrix!')
  }
}
