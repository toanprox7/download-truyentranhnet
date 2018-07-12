var request = require('request');
var cheerio = require('cheerio');
var folder = __dirname +'/Comics';
var path = require('path');
var fs = require('fs');
var im = require('imagemagick');
function getLink(url,partern,isImages,callback) {
    request(url,function (err,res,body) {
        var links =[];
        if (res.statusCode == 200){
            var $ = cheerio.load(body);
            $(partern).map(function (val,key) {
                if (isImages == 'imga'){
                    return links.push($(this).attr('src'));
                } else if (isImages == 'href') {
                    return links.push($(this).attr('href'));
                }else if (isImages =='hrefChapter'){
                    return links.push($(this).attr('href'));
                }

            })
        }else{
            callback([]);
        }
        // console.log(links);
        if(isImages == 'imga')
            callback(links);
        else if (isImages == 'href'){
            callback(links[1]);
        }else if (isImages == 'hrefChapter'){
            callback(links);
        }
    })

}



function getCommic(url, callback) {
    getLink(url,'.hot-manga .thumbnails a','href',function (commicUrl){
        console.log(commicUrl);
        if (commicUrl.length >0){
            getLink(commicUrl,'.total-chapter #examples p a','hrefChapter', function (chapterUrl) {

                if (chapterUrl.length > 0){
                    chapterUrl.forEach(function (linksChap) {
                        getLink(linksChap,'.each-page img','imga', function (imagesUrl) {

                            if (imagesUrl.length > 0){
                                let nameOfComic = commicUrl.split('/').pop();
                                let chapter = linksChap.split('-').pop();
                                nameOfComic = nameOfComic.replace(/[\[\+\-\.\,\!\@\#\$\%\^\&\*\(\)\;\\\/\|\<\>\"\'\]]/ig,'_');
                                //check and create folder if not exists
                                if (!fs.existsSync(folder))fs.mkdirSync(folder);
                                if (!fs.existsSync(folder+nameOfComic))fs.mkdirSync(folder+nameOfComic);
                                if (!fs.existsSync(folder+nameOfComic+'/'+chapter))fs.mkdirSync(folder+nameOfComic+'/'+chapter);
                                // console.log(imagesUrl);
                                imagesUrl.map(function (url, val) {
                                    let ext;
                                    let filename = path.basename(url);
                                    if (filename.match(/.jpg/ig)) ext = 'jpg';
                                    if (filename.match(/.png/ig)) ext = 'png';
                                    filename = folder+nameOfComic+'/'+chapter+'/' + val+'.'+ext;
                                    // let chapterName = folder+nameOfComic+'/'+chapter;
                                    // check file
                                    fs.exists(filename, function (exists) {
                                        if (!exists){
                                            console.log('Downloading...');
                                            request({
                                                    url : url + '?fit=crop&fm='+ext+'&q=50&w=400' ,
                                                    encoding: 'binary'}
                                                , function (err,response,body) {
                                                    if(err) {
                                                        callback(err)
                                                    } else {
                                                        fs.writeFile(filename ,body,'binary', function (err) {
                                                            if(err) {
                                                                callback(err);
                                                            }
                                                        })
                                                    }
                                                })
                                        }else if (exists) {
                                            console.log('existed...');
                                            if (!fs.existsSync(folder+nameOfComic+'/'+chapter+'/'+'anhNho')) fs.mkdirSync(folder+nameOfComic+'/'+chapter+'/'+'anhNho');
                                            let fileImageSmall = folder+nameOfComic+'/'+chapter+'/'+'anhNho'+'/'+val+'-small'+'.'+ext;
                                            if (!fs.existsSync(fileImageSmall)){
                                                im.resize({
                                                    srcPath:filename,
                                                    dstPath:fileImageSmall,
                                                    width:600,
                                                    height:400
                                                }, function (err,stdout,stderr) {
                                                    if (err) throw err
                                                    console.log('thanh cong');
                                                })
                                            } else{
                                                console.log('khong co anh nho');
                                            }

                                        }
                                    });
                                })
                            } else{
                                callback('khong tim thay anh nao ca');
                            }
                        })
                    })
                } else{
                    callback('khong tim thay chuong nao ca');
                }
            })
        }else{
            callback('khong co truyen');
        }
    })
}

getCommic('http://truyentranh.net', function (err) {
    if (err) console.log(err);
});