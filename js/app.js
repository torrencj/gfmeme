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
  //Mobile upload button click handler
  $("#upload_btn").on("click", function() {
      $("#mobile_upload_input").trigger("click");
  });
  //Upload file after the user selects one
  $("#mobile_upload_input").change(function(event){
    console.log('File selected');

    if (event.target.files[0]) {
      const file = event.target.files[0]
        // If selected item is not an image, reject them
        console.log(file);
        if (file.type.includes('image')) {
          uploadFile(file)
        }
      }
    // cleanup files.
    removeSelectData(event)

   });
   //Reset the file picker
   $('#file').on('click touchstart' , function(){
      $(this).val('');
  });

  //URL paste form. (Broken on backend.)
  const $form = $('#urlForm');

  //URL paste form. (Broken on backend)
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
    TODO Update UI to show when the user puts in a bad request. Currently says 'lame' for errors.
    */
    return false;
  });

  //Lame/spicy overlay click to dismiss and reset the drop zone.
  /*TODO -- Make it fade out all nice and fancy.*/
  $result_overlay.click(function() {
   $result_overlay.hide();
   $('.drop_label').show();
   $('#upload_btn').show();
   $('#drop_zone').css('background-image', 'url()')
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
Send a file to the server and update the UI with results.
TODO Split this into separate file handling and UI updates functions.
*/
function uploadFile(file) {
  $loader.show()
  $('.drop_label').hide();
  $('#upload_btn').hide();
  
  var oFReader = new FileReader();
  /*TODO Be consistent, either use jQuery for every variable or none.*/
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
  $.ajax({
    url:'https://us-central1-trans-grid-168913.cloudfunctions.net/GFM/upload',
    // url:'http://localhost:8000/upload',
    type: 'POST',
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    complete: function() {
      /*DONE -- Update the UI to show the upload is finished. */
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

/*
Handle the file drop.
TODO -- Change the UI to show that the upload box is receptive to files being dropped.
*/
function dropHandler(event) {
  event.preventDefault();
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)


  if (event.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    /*TODO Uncomment this line for multiple files. */
    // for (var i = 0; i < ev.dataTransfer.items.length; i++) {

      // If dropped items aren't files, reject them
      console.log(event.dataTransfer.items[0]);
      if (event.dataTransfer.items[0].kind === 'file') {

        var file = event.dataTransfer.items[0].getAsFile();
        uploadFile(file)
      }
    }
  // cleanup files.
  removeDragData(event)
}

/*
Clean up the temp files that were dropped
*/
function removeDragData(event) {
  console.log('Removing drag data')

  if (event.dataTransfer.items) {
    // Use DataTransferItemList interface to remove the drag data
    event.dataTransfer.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    event.dataTransfer.clearData();
  }
}

/*
Clean up temp files that were selected
*/
function removeSelectData(event) {
  console.log('Leaving file data alone for now.')
  // console.log(event);

  // if (event.target.files) {
  //   /*TODO -- How does one remove this data? Is it required?*/
  //   event.target.files.clear();
  // } else {
  //   event.target.files.clearData();
  // }
}


/*
(Unused)
Find if the browser supports advanced upload capabilities
Shamelessly stolen from css-tricks.com/drag-and-drop-file-uploading
*/
var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();
