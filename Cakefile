fs = require 'fs'
{spawn, exec} = require 'child_process'

appFiles = [
    'core/rene',
    'core/utils',
    'core/chart',
    'core/nchart',
    'layers/nlayer',
    'layers/nline',
    'layers/scatter',
    'layers/line',
    'layers/area',
    'layers/bar',
    'layers/pie'
]

build = (cb) ->
    appContents = new Array remaining = appFiles.length
    for file, index in appFiles then do (file, index) ->
        console.log "Adding #{file}."
        fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
            throw err if err
            appContents[index] = fileContents
            process() if --remaining is 0
    process = ->
        fs.writeFile 'lib/rene.coffee', appContents.join('\n\n'), 'utf8', (err) ->
            throw err if err
            exec 'coffee --compile lib/rene.coffee', (err, stdout, stderr) ->
                throw err if err
                console.log stdout + stderr
                fs.unlink 'lib/rene.coffee', (err) ->
                    throw err if err
                    console.log 'Done building.'
                    cb?()

uglify = (cb) ->
    uglify = spawn 'uglifyjs', ['-o', 'lib/rene.min.js', 'lib/rene.js']
    uglify.stderr.on 'data', (data) ->
        process.stderr.write data.toString()
    uglify.stdout.on 'data', (data) ->
        print data.toString()
    uglify.on 'exit', (code) ->
        cb?() if code is 0

watch = (cb) ->
    for file, index in appFiles then do (file, index) ->
        console.log "Watching #{file}"
        fs.watchFile "src/#{file}.coffee", {persistent: true, interval: 0}, ->
            console.log "Noted a change."
            # cb?()

task 'watch', 'Watch for changes and rebuild', ->
    watch(build)

task 'build', 'Build single application file from source files', ->
    build()

task 'uglify', 'Build and compress the application file from source', ->
    build(uglify)

task 'demo', 'Serve the current dir for working with demos', ->
    http     = require 'http'
    {Server} = require 'node-static'
    port = 8808

    fserver = new Server('./')
    http.createServer((req, res) ->
        req.addListener('end', ->
            console.log('Requesting url', req.url)
            fserver.serve(req, res)))
    .listen(port)
    console.log("Listening on #{port}")
