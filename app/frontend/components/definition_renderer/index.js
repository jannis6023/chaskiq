import './index.css'
import { Controller as BaseController } from '@hotwired/stimulus'
import { post } from '@rails/request.js'
import serialize from 'form-serialize'

export class Controller extends BaseController {
  static targets = ['form']

  connect() {
    console.log('definition renderer controller activated')
  }

  disconnect() {}

  onSubmit(e) {
    console.log('PReventinf default on definition form submit')
    e.preventDefault()
  }

  // from buttons
  async sendForm(e) {
    console.log('SEND FORM', e)
    e.preventDefault()

    let data = serialize(this.formTarget, { hash: true })
    const field = JSON.parse(e.currentTarget.dataset.fieldJson)
    data['ctx']['field'] = field
    data['ctx']['values'] = data.ctx.values || {}
    // console.log("DATA", data)

    console.log(field.action.type)
    console.log("GO TO:", this.formTarget.dataset )
    
    const kk = this.formTarget.dataset.kind || field.action.type
    // this.formTarget.dataset.kind
    const response = await post(this.resolvePath(kk), {
      body: JSON.stringify(data),
      //responseKind: 'turbo-stream'
    })

    if (response.ok) {
    
      if (response.isTurboStream ){
        const body = await response.turbo
        if(response.response.status !== 202){
          const closeEvent = new Event('modal-close')
          document.dispatchEvent(closeEvent)
        }
  
        return
      }

      const bodyHtml = await response.html
      // custom event que será leido por modal controller
      this.element.outerHTML = bodyHtml
      console.log('response!')
    }
  }

  resolvePath(kind){
     switch (kind) {
      case 'configure':
        return this.configurePath()  
      case 'submit':
        return this.submitPath()    
      default:
        break;
    }
  }

  visitLink(e) {
    e.preventDefault()
    const url = e.currentTarget.dataset.actionUrl
    window.location = url
  }

  configurePath() {
    return `${this.element.dataset.path}/configure`
  }

  submitPath() {
    return `${this.element.dataset.path}/submit`
  }

  async sendData(e) {
    console.log('SEND SUBMIT', e)
  }


  get modalController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector("#main-page"), "modal"
    )
  }
}