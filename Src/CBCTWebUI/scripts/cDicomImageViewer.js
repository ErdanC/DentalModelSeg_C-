CDicomImageViewer = function (domElement) {
    this.container = document.getElementById(domElement);
    cornerstone.enable(this.container);
    //this.volumeData ;
    cornerstoneTools.mouseWheelInput.enable(this.container);


}
CDicomImageViewer.prototype.SetVolumeData=function(volumeData){
    this.volumeData = volumeData;
    if (this.volumeData != undefined && this.volumeData != null) {
        var imageIds = new Array();
        for (var i = 0; i < this.volumeData.dataFrames.length; i++) {
            imageIds.push(this.volumeData.dataFrames[i].image.imageId);
        }
        var cimgId = 0;
        var frameStack = { currentImageIdIndex: cimgId, imageIds: imageIds };
       


        cornerstone.displayImage(this.container, this.volumeData.dataFrames[cimgId].image);

        // set the stack as tool state
        cornerstoneTools.addStackStateManager(this.container, ['stack']);
        cornerstoneTools.addToolState(this.container, 'stack', frameStack);

        // Enable all tools we want to use with this element
        cornerstoneTools.stackScroll.activate(this.container, 1);
        cornerstoneTools.stackScrollWheel.activate(this.container);



        $(document).on('CornerstoneStackScroll', function (e, eventData) {
            // Manually display direction
            if (eventData.direction === 0) {
                return;
            }
          
            $('#dicomImage').each(function () {
                // Resolve the stack and get the current image index
                var targetStackToolDataSource = cornerstoneTools.getToolState($(this).get(0), 'stack');
                var targetStackData = targetStackToolDataSource.data[0];
                console.log(targetStackData.currentImageIdIndex);
               // $(this).siblings('.index').html(targetStackData.currentImageIdIndex);
            });
        });
    }
}


