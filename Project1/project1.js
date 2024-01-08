// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    //calculate starting pixel
    var pixelLoc = (bgImg['width']*4*fgPos['y']) + (fgPos['x']*4); 
    var outOfBounds= false;
    var negativeX = false; 
    if(fgPos['x'] < 0 || (fgPos['x'] + fgImg['width'] )> bgImg['width']){
        outOfBounds = true; 
        if(fgPos['x']<0){
            negativeX = true; 
        }
    }
    
    //loop through rows
    for(var i = 0; i< fgImg['height']; i++){
        //loop through columns
        for(var j = 0; j< fgImg['width']*4; j+=4){
            //Checks for if pixel is outside image boundaries
            if (outOfBounds){
                if(negativeX){
                    if(j< (fgPos['x']* -4) ){
                        continue;
                    } 
                }
                else{
                    if(( fgPos['x']*4 + j) > (bgImg['width']*4)){
                        continue;
                    } 
                }
                
            }
            //calculate pixel locations
            var bgPixel = pixelLoc + ((bgImg['width'] * 4 * i) + (j));
            if (bgPixel < 0) continue;
            var fgPixel = (fgImg['width'] * 4 * i) + (j);

            //if alpha channel calculation
            var fAlpha =  fgOpac * (fgImg.data[fgPixel + 3])/255;
            var bAlpha = bgImg.data[bgPixel+3] /255;
            if(fAlpha == 0){
                continue;
            }
            var alpha = fAlpha + ( (1-fAlpha) * bAlpha );
            bgImg.data[bgPixel + 3 ] = alpha * 255;

            //loop through channels and add up colors with alpha levels
            for(var k = 0 ; k< 3; k++){
                var color = 0
                if (alpha != 0){
                    color = ((fAlpha * fgImg.data[fgPixel + k])+((1-fAlpha)*(bAlpha * bgImg.data[bgPixel + k])))/(alpha);
                }
                if(color > 255 ) color = 255; 
                bgImg.data[bgPixel + k ] = color;
            }
        }
    }
}
