/*
Guy Fieri Meme Checker v2 Frontend
John Torrence 2018 (MIT License)

Drag and drop file uploads.

Some code stolen from:
developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop

Requires jQuery.
*/
const $result = $('#result')
const $result_overlay = $('.result_overlay')
const $loader = $('#loader_overlay')
/*
Handle the ajax request from the text form.
*/
$(document).ready(function(){
   const $form = $('#urlForm');

   /*TODO -- Make it fade out all nice and fancy.*/
   $result_overlay.click(function() {
     $result_overlay.hide();
   });

   $form.submit(function(){
     $loader.show();
      $.get(
        $form.attr('action'), $form.serialize(), function(response){
          console.log(response);
          $loader.hide();
          $result_overlay.show();
          if (response.toLowerCase().includes('spicy')) {
            setClass($result, 'spicy')
            $result.text('SPICY!')
          } else {
            setClass($result, 'lame')
            $result.text('lame...')
          }
      },'text')
      /*
      TODO Change the server response to be JSON instead of text.
      TODO Update UI to show when the user puts in a bad URL. Currently says 'lame' for errors.
      */
      return false;
   });
});

/*
Set the class of a jQuery object to the specified.
TODO -- Just extend jQuery so this makes more sense in use.
*/
function setClass(obj, className) {
  obj.removeClass();
  obj.addClass(className);
}

/*
Prevent default from dragging over, log activity.
TODO -- Change the UI to show that the upload box is receptive to files being dropped.
*/
function dragOverHandler(ev) {
  console.log('File(s) in drop zone');
  ev.preventDefault();
}


/*
Handle the file drop.
TODO -- Change the UI to show that the upload box is receptive to files being dropped.
*/
function dropHandler(ev) {
  console.log('File(s) dropped');
  $loader.show()
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    /*TODO Uncomment this line for multiple files. */
    // for (var i = 0; i < ev.dataTransfer.items.length; i++) {

      // If dropped items aren't files, reject them
      console.log(ev.dataTransfer.items[0]);
      if (ev.dataTransfer.items[0].kind === 'file') {
        var file = ev.dataTransfer.items[0].getAsFile();
        var oFReader = new FileReader();
        var preview = document.getElementById("preview");
        var dropzone = document.getElementById("drop_zone")

        //Set the background of the drop area to the pic that was dropped.
        oFReader.addEventListener("load", function assignImageSrc(evt) {
          $(dropzone).css('background-image', `url( ${evt.target.result} )`)
          this.removeEventListener("load", assignImageSrc);
        }, false);

        oFReader.readAsDataURL(file);

        //Create the formdata with the file attached.
        var $form = $('.form')
        var formData = new FormData();
        formData.append( 'file', file );

        //Send the file to the backend.
        $.ajax({
          url:'https://us-central1-trans-grid-168913.cloudfunctions.net/GFM',
          // url:'http://localhost:8000/upload',
          type: 'POST',
          data: formData,
          cache: false,
          contentType: false,
          processData: false,
          complete: function() {
            /*TODO -- Update the UI to show the upload is finished. */
            // $form.removeClass('is-uploading');
            console.log("Ajax completed.");
          },
          success: function(data) {
            /*TODO -- DRY */
            console.log(data);
            $loader.hide()

            $result_overlay.show();
            if (data.toLowerCase().includes('spicy')) {
              setClass($result, 'spicy')
              $result.text('SPICY!')
            } else {
              setClass($result, 'lame')
              $result.text('lame...')
            }

            // $form.addClass( data.success == true ? 'is-success' : 'is-error' );
            // if (!data.success) $errorMsg.text(data.error);
          },
          error: function() {
            // Log the error if desired
            /*TODO -- Update UI to show errors?*/
          }
        });
      }
    }


  // Pass event to removeDragData for cleanup
  removeDragData(ev)
}

/*
Clean up the temp files that were dropped
*/
function removeDragData(ev) {
  console.log('Removing drag data')

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to remove the drag data
    ev.dataTransfer.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    ev.dataTransfer.clearData();
  }
}

/*
Find if the browser supports advanced upload capabilities
Shamelessly stolen from css-tricks.com/drag-and-drop-file-uploading
*/
var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();
