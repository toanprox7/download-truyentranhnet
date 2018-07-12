
console.log(chapterUrl);
getLink(chapterUrl,'.each-page img','imga', function (imagesUrl) {

    if (imagesUrl.length > 0){

        // function getLinkChapter() {
        //     getLink(chapterUrl,'.chapter-control .paddfixboth a', 'hrefPrev', function (PrevUrl) {
        //         if (PrevUrl.length > 0){
        //             getLink(PrevUrl,'.each-page img','imga', function (ImagesPrevUrl) {
        //                 console.log(ImagesPrevUrl);
        //             })
        //         }else{
        //             callback('Da het cac chuong');
        //         }
        //     })
        // }
        let nameOfComic = commicUrl.split('/').pop();
        let chapter = chapterUrl.split('-').pop();
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
            let chapterName = folder+nameOfComic+'/'+chapter;
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

                }
            });
        })
    } else{
        callback('khong tim thay anh nao ca');
    }
})