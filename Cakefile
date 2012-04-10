fs = require 'fs'
{spawn, exec} = require 'child_process'

appFiles = [
    'core/rene',
    'core/utils',
    'core/chart',
    'layers/scatter',
    'layers/line',
    'layers/bar',
    'layers/pie'
]

task 'build', 'Build single application file from source files', ->
    appContents = new Array remaining = appFiles.length
    for file, index in appFiles then do (file, index) ->
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
                    console.log 'Done.'














# build = (callback) ->
#     coffee = spawn 'coffee', ['-c', '-o', 'lib', 'src']
#     coffee.stderr.on 'data', (data) ->
#         process.stderr.write data.toString()
#     coffee.stdout.on 'data', (data) ->
#         print data.toString()
#     coffee.on 'exit', (code) ->
#         callback?() if code is 0
#
# stitchRene = (callback) ->
#     stitch = require 'stitch'
#     fs     = require 'fs'
#     stitch.createPackage({ paths: [__dirname + '/lib'] })
#         .compile((err, source) ->
#             fs.writeFile 'build/rene.js', source, (err) ->
#                 if err then throw err
#                 console.log('built rene.js')
#                 callback?())
#
# uglify = (callback) ->
#     uglify = spawn 'uglifyjs', ['-o', 'build/rene.min.js', 'build/rene.js']
#     uglify.stderr.on 'data', (data) ->
#         process.stderr.write data.toString()
#     uglify.stdout.on 'data', (data) ->
#         print data.toString()
#     uglify.on 'exit', (code) ->
#         callback?() if code is 0
#
# watch = (callback) ->
#     timer = null
#     coffee = spawn 'coffee', ['-w', '-c', '-o', 'lib', 'src']
#     coffee.stderr.on 'data', (data) ->
#         process.stderr.write data.toString()
#     coffee.stdout.on 'data', (data) ->
#         print data.toString()
#         if callback?
#             clearTimeout(timer) if timer?
#             timebomb = ->
#                 console.log('timebomb!')
#                 timer = null
#                 callback()
#             timer = setTimeout(timebomb, 100)
#
# serve = ->
#     http     = require 'http'
#     {Server} = require 'node-static'
#
#     fserver = new Server('./')
#     http.createServer((req, res) ->
#         req.addListener('end', ->
#             console.log('Requesting url', req.url)
#             fserver.serve(req, res)))
#     .listen(8080)
#     console.log('Listening on 8080')
#
#
# task 'build', 'Build lib/ from src/', ->
#     build()
#
# task 'stitch', 'Build rene files and stitch them together', ->
#     build stitchRene
#
# task 'uglify', 'Build rene and compress to rene.min.js', ->
#     build ->
#         stitchRene ->
#             uglify()
#
# task 'watch', 'Watch src/ for changes', ->
#     watch ->
#       stitchRene()
#
# task 'serve', 'Watch for changes and serve the current dir for examples', ->
#     serve()
