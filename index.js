var http = require('http')
var uuid = require('node-uuid')
var ncp = require('ncp').ncp
var fs = require('fs')
var crypto = require('crypto')
require('shelljs/global')

const PORT = 6000
const ARM9LOADER_SOURCE_PATH = './arm9loaderhax'

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

var getShasums = function(path, installer){
  var algo = 'sha256'
  var shasum = crypto.createHash(algo)
  var installerSha = shasum.update(installer)
  return {installerSha: installerSha.digest('hex')}
}

function handleRequest(req, res){
  switch(req.url){
    case '/':
      var exitWithErr = function(){
        res.writeHead(500)
        res.end("something went wrong, come back later")
        return;
      }
      
      if(req.method == 'POST'){
			  var newUuid = uuid.v4()
        var newPath = './'+newUuid
				try{
          ncp(ARM9LOADER_SOURCE_PATH, newPath , function (err) {
            var f=fs.createWriteStream(newPath + '/data_input/otp.bin')
            if (err) {
              return exitWithErr()
            }else{
              req.on('data', function(chunk) {
				  	    f.write(chunk)
              })

              req.on('end', function() {
				  	    //TODO mudar esse content type
                //
                f.end()
                var oldDir = process.cwd()
                process.chdir(newPath)
                if (exec('make', {silent:true}).code !== 0) {
                  return exitWithErr()
                }else{
                  process.chdir(oldDir)
                  var installer = fs.readFileSync(newPath + '/data_output/arm9loaderhax.3dsx')
                  var shasums = getShasums(newPath, installer)
                  res.writeHead(200, "OK", {'Content-Type': 'binary', 'Installer-Sha256': shasums.installerSha, 'Presented-by': 'felipejfc'})
                  res.end(installer)
                  deleteFolderRecursive(newPath)
                  return
                }
              }) 
            }
          })
        }catch(e){
          return exitWithErr()
        }
      } else {
        res.writeHead(405, "Method not supported", {'Content-Type': 'text/plain'})
        res.end('only post is supported.')
        return 
      }
      break;
  } 
}

var server = http.createServer(handleRequest)

server.listen(PORT, function(){
  console.log("Server listening on: http://localhost:%s", PORT);
});