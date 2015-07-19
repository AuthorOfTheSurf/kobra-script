#!/usr/bin/env node
var parseArgs     = require('minimist')
var path          = require('path')
var argv          = parseArgs(process.argv.slice(2), opts={
  boolean: ['t', 'a', 'o', 'i'],
})

var scan          = require('./scanner')
var parse         = require('./parser')
var error         = require('./error')

var fileExtension = path.extname(argv._[0])
var currentDir    = path.dirname(argv._[0])

if ([".ks",".ksb"].indexOf(fileExtension) < 0) {
  error('Invalid extension for ' + path.basename(argv._[0]) + ', expected .ks or .ksb', { path: fileExtension })
}

//  Begin execution.
if (argv._.length === 0) {
  console.log(
    "This is KobraScript compiler!\n",
    "$ kobra [-t] [-a] [-o] [-i] filename\n",
    "-t scans, prints the tokens, then exits\n",
    "-a scans, parses, prints the abstract syntax tree, then exits\n",
    "-o does optimizations\n",
    "-i goes up to semantic analysis, prints the semantic graph, then exits\n");
} else {
  scan(argv._[0], function (tokens) {
    if (error.count > 0) { return }
    if (argv.t) {
      logTokens(tokens)
      return
    }
    var program = parse(tokens, currentDir)
    if (error.count > 0) { return }
    if (argv.a) {
      console.log(program.toString())
      return
    }
    if (argv.o) {
      program.optimize()
    }
    program.analyze()
    if (error.count > 0) { return }
    if (argv.i) {
      program.showSemanticGraph()
      return
    }
    var out = program.generateJavaScript()
    console.log(out)
  })
}

function logTokens(tokens) {
  var tokenIndex = 0
  tokens.forEach(function (t) {
      console.log(++tokenIndex + " - " + JSON.stringify(t))
  })
}
