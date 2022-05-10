function CHistogram() {
    this.histogram = [];

    this.init = function (volumeImage) {
        this.histogram = [];

        for (var i = 0; i < 256; i++) {
            this.histogram.push(i);
        }

       
    }

    this.smoothHistogram = function () {
        var sHistogram = [];

        for (var i = 0; i < histogram.length; i++) {
            sHistogram.push(0);
        }

        for (var idx = 0; idx < histogram.length - 1; idx++) {
            sHistogram[idx] = (idx == 0) ? (this.histogram[idx] + this.histogram[idx + 1]) / 2 : (this.histogram[idx - 1] + this.histogram[idx] + this.histogram[idx + 1]) / 3;
        }

        return (sHistogram);
    }
}