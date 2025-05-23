/* Based on Micromodal.js - https://github.com/micromodal/Micromodal Copyright (c) 2017 Indrashish Ghosh, MIT */

export default (function() { 
  'use strict';

  const MicroModal = (() => {

    const FOCUSABLE_ELEMENTS = ['a[href]', 'area[href]', 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', 'select:not([disabled]):not([aria-hidden])', 'textarea:not([disabled]):not([aria-hidden])', 'button:not([disabled]):not([aria-hidden])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

    class Modal {
      constructor({
        targetModal,
        triggers = [],
        onShow = () => {},
        onClose = () => {},
        openTrigger = 'data-micromodal-trigger',
        closeTrigger = 'data-micromodal-close',
        disableScroll = false,
        disableFocus = false,
        awaitCloseAnimation = false,
        awaitOpenAnimation = false,
        debugMode = false,
        inputs = undefined,
        buttons = undefined,
      }) {

        // Save a reference of the modal
        this.modal = document.getElementById(targetModal); // Save a reference to the passed config

        this.config = {
          debugMode,
          disableScroll,
          openTrigger,
          closeTrigger,
          onShow,
          onClose,
          awaitCloseAnimation,
          awaitOpenAnimation,
          disableFocus, // Register click events only if pre binding eventListeners
          inputs,
          buttons,
        };
        if (triggers.length > 0) this.registerTriggers(...triggers); // pre bind functions for event listeners

        this.onClick = this.onClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.onInputKeyup = this.onInputKeyup.bind(this);

        if((typeof inputs !== "undefined")&&(inputs.length > 0)){
          this.modal.classList.add("require-input");
          this.modal.classList.add("invalid-input");
        } else {
          this.modal.classList.remove("require-input");
          this.modal.classList.remove("invalid-input");
        }
      }
      /**
       * Loops through all openTriggers and binds click event
       * @param  {array} triggers [Array of node elements]
       * @return {void}
       */

      registerTriggers(...triggers) {
        triggers.filter(Boolean).forEach(trigger => {
          trigger.addEventListener('click', event => this.showModal(event));
        });
      }

      showModal() {
        this.activeElement = document.activeElement;
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('is-open');
        this.scrollBehaviour('disable');
        this.addEventListeners();

        if (this.config.awaitOpenAnimation) {
          const handler = () => {
            this.modal.removeEventListener('animationend', handler, false);
            this.setFocusToFirstNode();
          };

          this.modal.addEventListener('animationend', handler, false);
        } else {
          this.setFocusToFirstNode();
        }

        this.config.onShow(this.modal,this.activeElement);
      }

      closeModal(event) {
        const modal = this.modal;
        this.modal.setAttribute('aria-hidden', 'true');
        this.removeEventListeners();
        this.scrollBehaviour('enable');

        if (this.activeElement) {
          this.activeElement.focus();
        }

        var dialogResponse = {choice: undefined, inputs: []};
        if(typeof this.config.inputs !== "undefined"){
          var inputResults = [];
          for(var i=0; i<this.config.inputs.length; i++){
            var inputDOM = document.getElementById("escapp-modal-input"+(i+1));
            inputResults.push(inputDOM.value);
          }
          dialogResponse.inputs = inputResults;
        }

        if((typeof this.config.buttons !== "undefined")&&(this.config.buttons instanceof Array)&&(this.config.buttons.length > 0)){
          //Response attribute of the target element
          dialogResponse.choice = false;
          if(typeof event !== "undefined"){
            if((event.keyCode === 13)&&(typeof this.config.buttons[0].response === "string")){
              //Enter key
              dialogResponse.choice = this.config.buttons[0].response;
            } else {
              if ((typeof event.target !== "undefined")&&(typeof event.target.getAttribute("response") === "string")){
                dialogResponse.choice = event.target.getAttribute("response");
              }
            }
          }
        } else {
          dialogResponse.choice = true;
        }

        this.config.onClose(this.modal,dialogResponse);

        if (this.config.awaitCloseAnimation) {
          this.modal.addEventListener('animationend', function handler() {
            modal.classList.remove('is-open');
            modal.removeEventListener('animationend', handler, false);
          }, false);
        } else {
          modal.classList.remove('is-open');
        }
      }

      scrollBehaviour(toggle) {
        if (!this.config.disableScroll) return;
        const body = document.querySelector('body');

        switch (toggle) {
          case 'enable':
            Object.assign(body.style, {
              overflow: '',
              height: ''
            });
            break;

          case 'disable':
            Object.assign(body.style, {
              overflow: 'hidden',
              height: '100vh'
            });
            break;

          default:
        }
      }

      addEventListeners() {
        this.modal.addEventListener('touchstart', this.onClick);
        this.modal.addEventListener('click', this.onClick);
        document.addEventListener('keydown', this.onKeydown);
        if(typeof this.config.inputs !== "undefined"){
          for(var i=0; i<this.config.inputs.length; i++){
            var inputDOM = document.getElementById("escapp-modal-input"+(i+1))
            if(inputDOM) inputDOM.addEventListener('keydown', this.onInputKeyup);
          }
        }
      }

      removeEventListeners() {
        this.modal.removeEventListener('touchstart', this.onClick);
        this.modal.removeEventListener('click', this.onClick);
        document.removeEventListener('keydown', this.onKeydown);
        if(typeof this.config.inputs !== "undefined"){
          for(var i=0; i<this.config.inputs.length; i++){
            var inputDOM = document.getElementById("escapp-modal-input"+(i+1))
            if(inputDOM) inputDOM.removeEventListener('keydown', this.onInputKeyup);
          }
        }
      }

      onClick(event) {
        if (event.target.hasAttribute(this.config.closeTrigger)){
          if((event.target.classList.contains("ignore_input_validation"))||(this.validateInputs())){
            this.closeModal(event);
          }
          event.preventDefault();
        }
      }

      onKeydown(event) {
        if (event.keyCode === 27){
          //Escapp key
          if((typeof this.config.inputs === "undefined")&&((typeof this.config.buttons === "undefined")||(this.config.buttons.length===1))){
            this.closeModal(event);
            event.preventDefault();
          }
        }
        if (event.keyCode === 13){
          //Enter key
          if((this.validateInputs())&&((typeof this.config.buttons === "undefined")||(this.config.buttons.length===1))){
            this.closeModal(event);
            event.preventDefault();
          }
        }
        if (event.keyCode === 9) {
          //Tab key
          this.maintainFocus(event);
        }
      }

      onInputKeyup(event) {
        setTimeout(() => {
          if(this.validateInputs()){
            this.modal.classList.remove("invalid-input");
          } else {
            this.modal.classList.add("invalid-input");
          }
        }, 20)
      }

      getFocusableNodes() {
        const nodes = this.modal.querySelectorAll(FOCUSABLE_ELEMENTS);
        return Array(...nodes);
      }

      setFocusToFirstNode() {
        if (this.config.disableFocus) return;
        const focusableNodes = this.getFocusableNodes();
        if (focusableNodes.length) focusableNodes[0].focus();
      }

      maintainFocus(event) {
        const focusableNodes = this.getFocusableNodes(); // if disableFocus is true

        if (!this.modal.contains(document.activeElement)) {
          focusableNodes[0].focus();
        } else {
          const focusedItemIndex = focusableNodes.indexOf(document.activeElement);

          if (event.shiftKey && focusedItemIndex === 0) {
            focusableNodes[focusableNodes.length - 1].focus();
            event.preventDefault();
          }

          if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
            focusableNodes[0].focus();
            event.preventDefault();
          }
        }
      }

      validateInputs(){
        if((typeof this.config.inputs === "undefined")||(this.config.inputs.length === 0)){
          return true;
        }
        for(var i=0; i<this.config.inputs.length; i++){
          var inputDOM = document.getElementById("escapp-modal-input"+(i+1));
          if(this.validateInput(inputDOM,this.config.inputs[i])===false){
            return false;
          }
        }
        return true;
      }

      validateInput(inputDOM,inputData){
        var inputValue = inputDOM.value;
        if(inputValue === ""){
          return false;
        } else {
          if(typeof inputData.validate === "function"){
            return inputData.validate(inputValue);
          } else {
            return true;
          }
        }
      }
    }

    /**
     * Modal prototype ends.
     * Here on code is responsible for detecting and
     * auto binding event handlers on modal triggers
     */
    // Keep a reference to the opened modal


    let activeModal = null;
    /**
     * Generates an associative array of modals and it's
     * respective triggers
     * @param  {array} triggers     An array of all triggers
     * @param  {string} triggerAttr The data-attribute which triggers the module
     * @return {array}
     */

    const generateTriggerMap = (triggers, triggerAttr) => {
      const triggerMap = [];
      triggers.forEach(trigger => {
        const targetModal = trigger.attributes[triggerAttr].value;
        if (triggerMap[targetModal] === undefined) triggerMap[targetModal] = [];
        triggerMap[targetModal].push(trigger);
      });
      return triggerMap;
    };
    /**
     * Validates whether a modal of the given id exists
     * in the DOM
     * @param  {number} id  The id of the modal
     * @return {boolean}
     */


    const validateModalPresence = id => {
      if (!document.getElementById(id)) {
        console.warn(`MicroModal: \u2757Seems like you have missed %c'${id}'`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'ID somewhere in your code. Refer example below to resolve it.');
        console.warn(`%cExample:`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', `<div class="escapp-modal" id="${id}"></div>`);
        return false;
      }
    };
    /**
     * Validates if there are modal triggers present
     * in the DOM
     * @param  {array} triggers An array of data-triggers
     * @return {boolean}
     */


    const validateTriggerPresence = triggers => {
      if (triggers.length <= 0) {
        console.warn(`MicroModal: \u2757Please specify at least one %c'micromodal-trigger'`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'data attribute.');
        console.warn(`%cExample:`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', `<a href="#" data-micromodal-trigger="my-modal"></a>`);
        return false;
      }
    };
    /**
     * Checks if triggers and their corresponding modals
     * are present in the DOM
     * @param  {array} triggers   Array of DOM nodes which have data-triggers
     * @param  {array} triggerMap Associative array of modals and their triggers
     * @return {boolean}
     */


    const validateArgs = (triggers, triggerMap) => {
      validateTriggerPresence(triggers);
      if (!triggerMap) return true;

      for (var id in triggerMap) validateModalPresence(id);

      return true;
    };
    /**
     * Binds click handlers to all modal triggers
     * @param  {object} config [description]
     * @return void
     */


    const init = config => {
     
      // Create an config object with default openTrigger
      const options = Object.assign({}, {
        openTrigger: 'data-micromodal-trigger'
      }, config); // Collects all the nodes with the trigger

      const triggers = [...document.querySelectorAll(`[${options.openTrigger}]`)]; // Makes a mappings of modals with their trigger nodes

      const triggerMap = generateTriggerMap(triggers, options.openTrigger); // Checks if modals and triggers exist in dom

      if (options.debugMode === true && validateArgs(triggers, triggerMap) === false) return; // For every target modal creates a new instance

      for (var key in triggerMap) {
        let value = triggerMap[key];
        options.targetModal = key;
        options.triggers = [...value];
        activeModal = new Modal(options); // eslint-disable-line no-new
      }
    };

    /**
     * Shows a particular modal
     * @param  {string} targetModal [The id of the modal to display]
     * @param  {object} config [The configuration object to pass]
     * @return {void}
     */
    const show = (targetModal, config) => {
      const options = config || {};
      options.targetModal = targetModal; // Checks if modals and triggers exist in dom

      if (options.debugMode === true && validateModalPresence(targetModal) === false) return; // stores reference to active modal

      activeModal = new Modal(options); // eslint-disable-line no-new

      activeModal.showModal();
    };
    /**
     * Closes the active modal
     * @param  {string} targetModal [The id of the modal to close]
     * @return {void}
     */


    const close = (targetModal, config) => {
      const options = config || {};
      options.targetModal = targetModal; // Checks if modals and triggers exist in dom
      if(targetModal){
        activeModal.modal = document.getElementById(targetModal);
      }
      if (typeof config.onClose === "function") activeModal.config.onClose = config.onClose;
      activeModal.closeModal();
    };

    return {
      init,
      show,
      close
    };
  })();

  return MicroModal;
})();