/*global Web3*/

if (typeof global.web3 === 'undefined') {
  cleanContextForImports()
  require('web3/dist/web3.min.js')
  const log = require('loglevel')
  const LocalMessageDuplexStream = require('post-message-stream')
  // const PingStream = require('ping-pong-stream/ping')
  // const endOfStream = require('end-of-stream')
  const setupDappAutoReload = require('./lib/auto-reload.js')
  const MetamaskInpageProvider = require('./lib/inpage-provider.js')
  restoreContextAfterImports()

  const METAMASK_DEBUG = 'GULP_METAMASK_DEBUG'
  window.log = log
  log.setDefaultLevel(METAMASK_DEBUG ? 'debug' : 'warn')


  //
  // setup plugin communication
  //

  //
  // setup plugin communication
  //

  // setup background connection
  var metamaskStream = new LocalMessageDuplexStream({
    name: 'inpage',
    target: 'contentscript',
  })

  // compose the inpage provider
  var inpageProvider = new MetamaskInpageProvider(metamaskStream)

  var web3 = new Web3(inpageProvider)
  web3.setProvider = function () {
    log.debug('MetaMask - overrode web3.setProvider')
  }
  log.debug('MetaMask - injected web3')
  // export global web3, with usage-detection
  setupDappAutoReload(web3, inpageProvider.publicConfigStore)

  var web3 = new Web3(inpageProvider)
  web3.setProvider = function () {
    console.log('MetaMask - overrode web3.setProvider')
  }
  console.log('MetaMask - injected web3')
  // export global web3, with usage-detection
  setupDappAutoReload(web3, inpageProvider.publicConfigStore)

  // set web3 defaultAccount

  inpageProvider.publicConfigStore.subscribe(function (state) {
    web3.eth.defaultAccount = state.selectedAddress
  })

  //
  // util
  //

  // need to make sure we aren't affected by overlapping namespaces
  // and that we dont affect the app with our namespace
  // mostly a fix for web3's BigNumber if AMD's "define" is defined...
  var __define
}

function cleanContextForImports() {
  __define = global.define
  try {
    global.define = undefined
  } catch (_) {
    console.warn('MetaMask - global.define could not be deleted.')
  }
}

function restoreContextAfterImports() {
  try {
    global.define = __define
  } catch (_) {
    console.warn('MetaMask - global.define could not be overwritten.')
  }
}
