function CTransferFunctionObject() {
    this.MAXVALUES = 256;
    this.MAXGRADS = 128;

    this.transferFunctionJoints = [];
    this.plotData = [];
    this.texture;

    this.length = 256;

    TF_1D = 0;
    TF_Alpha2D = 2;
    TF_Levoy = 1;

    this.createTransferFunctionTexture_FromAlpha = function (alpha) {
        this.plotData = { line: [], dots: [] };

        for (var i = 0; i < alpha.length; i++) {
            this.plotData.line.push({ x: i, y: alpha[i] / 255 });
        }

        transferFunctionArr = new Uint8Array(256 * 4);

        for (var idx = 0; idx < 256; idx++) {
            var colorIdx = idx * 4;
            transferFunctionArr[colorIdx] = Math.floor(alpha[idx]);
            transferFunctionArr[colorIdx + 1] = Math.floor(alpha[idx]);
            transferFunctionArr[colorIdx + 2] = Math.floor(alpha[idx]);
            transferFunctionArr[colorIdx + 3] = Math.floor(alpha[idx]);
        }

       
    }

    this.createTransferFunctionTexture = function (numberOfItems) {
        this.length = numberOfItems;

        this.plotData = { line: [], dots: [] };

        for (var i = 0; i < numberOfItems; i++) {
            this.plotData.line.push({ x: i, y: 0 });
        }

        transferFunctionArr = new Uint8Array(256 * 4);

        for (var idx = 0; idx < this.transferFunctionJoints.length - 1; idx++) {
            var xx1 = Math.floor(this.transferFunctionJoints[idx].x);
            var yy1 = this.transferFunctionJoints[idx].y;
            var r1 = this.transferFunctionJoints[idx].r;
            var g1 = this.transferFunctionJoints[idx].g;
            var b1 = this.transferFunctionJoints[idx].b;

            var xx2 = Math.floor(this.transferFunctionJoints[idx + 1].x);
            var yy2 = this.transferFunctionJoints[idx + 1].y;
            var r2 = this.transferFunctionJoints[idx + 1].r;
            var g2 = this.transferFunctionJoints[idx + 1].g;
            var b2 = this.transferFunctionJoints[idx + 1].b;

            var posX = this.plotData.dots.map(function (e) {
                return e.x;
            }).indexOf(xx1);

            var posY = this.plotData.dots.map(function (e) {
                return e.y;
            }).indexOf(yy1);

            if ((posX == -1) || (posY == -1)) {
                this.plotData.dots.push({ id: idx, x: xx1, y: yy1, r: r1, g: g1, b: b1 });
            }

            if (idx == this.transferFunctionJoints.length - 2) {
                this.plotData.dots.push({ id: idx, x: xx2, y: yy2, r: r2, g: g2, b: b2 });
            }

            var index = xx1;
            var len = xx2 - xx1;

            while (index < xx2) {
                var ratio = 1 - ((index - xx1) / len);
                var trIndex = index * 4;
                transferFunctionArr[trIndex++] = r1 * ratio + r2 * (1 - ratio);
                transferFunctionArr[trIndex++] = g1 * ratio + g2 * (1 - ratio);
                transferFunctionArr[trIndex++] = b1 * ratio + b2 * (1 - ratio);
                this.plotData.line[index].y = (yy1 * ratio + yy2 * (1 - ratio));
                transferFunctionArr[trIndex] = this.plotData.line[index].y * 255;
                index++;
            }

        }

       

       

    }

   
    this.initData = function () {
        this.transferFunctionJoints = [];
        this.transferFunctionJoints.push({ id: transferFunction.transferFunctionJoints.length, x: 0, y: 0, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
        this.transferFunctionJoints.push({ id: transferFunction.transferFunctionJoints.length, x: 57, y: 0.009095662434895834, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
        this.transferFunctionJoints.push({ id: transferFunction.transferFunctionJoints.length, x: 112, y: 0.0054498291015625, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
        this.transferFunctionJoints.push({ id: transferFunction.transferFunctionJoints.length, x: 127, y: 0.49362686157226565, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
        this.transferFunctionJoints.push({ id: transferFunction.transferFunctionJoints.length, x: 151, y: 0.7136268615722656, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
        this.transferFunctionJoints.push({ id: transferFunction.transferFunctionJoints.length, x: 220, y: 0.55, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
        this.transferFunctionJoints.push({ id: transferFunction.transferFunctionJoints.length, x: 255, y: 0, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
    }

    this.computeTFJoints_fromHistogram = function () {
        this.transferFunctionJoints = [];
        var sHistogram = histogramObj.smoothHistogram();
        var gradientArr = [];

        for (var idx = 0; idx < (sHistogram.length - 1) ; idx++) {
            if (sHistogram[idx].y < sHistogram[idx + 1].y) // increasing
            {
                if (idx < sHistogram.length - 2) {
                    if (sHistogram[idx + 1].y > sHistogram[idx + 2].y) //  positive equal/negative thus peak point
                    {
                        gradientArr.push(0);
                    }
                    else {
                        gradientArr.push(1); // still increasing
                    }
                }
                else {
                    gradientArr.push(0); // final point is peak point
                }
            }
            else if (sHistogram[idx].y > sHistogram[idx + 1].y) {
                gradientArr.push(-1);  // decreasing
            }
        }

        for (var idx = 0; idx < gradientArr.length; idx++) {
            if (idx < gradientArr.length - 2) {
                if ((gradientArr[idx] == gradientArr[idx + 2]) &&
                    (gradientArr[idx + 1] != gradientArr[idx])) {
                    gradientArr[idx + 1] = gradientArr[idx];
                }
                else if ((idx >= 1) &&
                    (gradientArr[idx] != 0) &&
                    (gradientArr[idx] != gradientArr[idx - 1]) &&
                    (gradientArr[idx] != gradientArr[idx + 1])) {
                    gradientArr[idx] *= -1;
                }
            }
        }

        for (var idx = 0; idx < gradientArr.length; idx++) {
            if (idx < gradientArr.length - 2) {
                if ((gradientArr[idx] == gradientArr[idx + 2]) &&
                    (gradientArr[idx + 1] != gradientArr[idx])) {
                    gradientArr[idx + 1] = gradientArr[idx];
                }
                else if ((idx >= 1) &&
                    (gradientArr[idx] != 0) &&
                    (gradientArr[idx] != gradientArr[idx - 1]) &&
                    (gradientArr[idx] != gradientArr[idx + 1])) {
                    gradientArr[idx] *= -1;
                }
            }
        }

        var start = -1, end = -1, idx = 0, peakIndex = -1;
        while (idx < gradientArr.length) {
            if ((idx == 0) && (start == -1) && (gradientArr[idx] != 1)) {
                start = idx;

                var state = gradientArr[idx];

                while (gradientArr[idx] == state) {
                    idx++;
                }

                if (state == 0) {
                    state = -1;
                }

                if (gradientArr[idx] == 0) {
                    peakIndex = idx++;
                }
                else if (state == -1) {
                    peakIndex = start;

                    while (gradientArr[idx] == state) {
                        idx++;
                    }

                    end = idx;
                }
            }
            else if ((gradientArr[idx] == 1) && (start == -1)) {
                start = idx;
                while (gradientArr[idx] == 1) {
                    idx++;
                }

                if (gradientArr[idx] == 0) {
                    peakIndex = idx++;
                }

                while (gradientArr[idx] == -1) {
                    idx++;
                }

                end = idx;
            }
            else {
                start = -1;
                end = -1;
                peakIndex = -1;
                idx++;
            }

            if ((start >= 0) && (end >= 0) && (peakIndex >= 0) && (sHistogram[peakIndex].y > 1.0)) {
                if (this.transferFunctionJoints.map(function (e) {
                    return e.x;
                }).indexOf(start) == -1) {
                    this.transferFunctionJoints.push({ id: this.transferFunctionJoints.length, x: Math.floor(start), y: 0, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
                }
                else {
                    var ix = this.transferFunctionJoints.map(function (e) {
                        return e.x;
                    }).indexOf(start);
                    //console.log("start transferFunctionJoints[ix] : "+transferFunctionJoints[ix].x);
                }

                var med = start + (end - start) / 2;
                if (this.transferFunctionJoints.map(function (e) {
                    return e.x;
                }).indexOf(med) == -1) {
                    this.transferFunctionJoints.push({ id: this.transferFunctionJoints.length, x: Math.floor(med), y: 1, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
                }
                else {
                    var ix = this.transferFunctionJoints.map(function (e) {
                        return e.x;
                    }).indexOf(med);
                    //console.log("med transferFunctionJoints[ix] : "+transferFunctionJoints[ix].x);
                }

                if (this.transferFunctionJoints.map(function (e) {
                    return e.x;
                }).indexOf(end) == -1) {
                    this.transferFunctionJoints.push({ id: this.transferFunctionJoints.length, x: Math.floor(end), y: 0, r: _defaultColor[0], g: _defaultColor[1], b: _defaultColor[2] });
                }
                else {
                    var ix = this.transferFunctionJoints.map(function (e) {
                        return e.x;
                    }).indexOf(end);
                    //console.log("end transferFunctionJoints[ix] : "+transferFunctionJoints[ix].x);
                }

                start = -1;
                end = -1;
                peakIndex = -1;
            }
        }
    }

    /*  This function computes the opacities, based upon the formulation provided in Levoy's paper 1988
     *   input of this function is the target opacities for target grayScale values
     *
     *   divisor = fV(n+1) - fV(n), fV(n+1) > fV(n)
     *   alpha(i) = gradMag * { alphaV(n+1) * (f(xi)-f(v(n))/ divisor) + alphaV(n) * (fV(n+1)-f(xi))/divisor)} if fV(n) <= fi <= fV(n+1)
     *            = 0 otherwise
     *
     *  where fV and alphaV are input, it requires ar least 2 inputs
     * */
    this.computeLevoyTransferFunction = function (list) {
        if (list.length < 2) {
            console.log("This function requires at least 2 input points ....");
            return;
        }

        // sort the list in x order
        list.sort(function (a, b) {
            if (a.x < b.x)
                return -1;
            if (a.x > b.x)
                return 1;
            return 0;
        });

        var alpha = new Array(this.length);

        for (var idx = 0; idx < this.length; idx++) {
            alpha[idx] = Array.apply(null, new Array(this.MAXGRADS)).map(Number.prototype.valueOf, 0);
        }

        var fvIndexes = new Array(this.length);
        var curIdx = 0;
        var curFv = list[curIdx].x;
        for (var idx = 0; idx < this.length; idx++) {
            if (idx <= curFv) {
                fvIndexes[idx] = curIdx;
            }
            else {
                curIdx += 1;
                fvIndexes[idx] = curIdx;
                if (curIdx < list.length) {
                    curFv = list[curIdx].x;
                }
                else {
                    curFv = this.length;
                }
            }
        }

        for (var fi = 0; fi < this.MAXVALUES; fi++) {
            var fvIdx = fvIndexes[fi];
            if ((fvIdx < list.length) && (fvIdx > 0)) {
                var fvIdxPlus1 = fvIdx;
                var fvPlus1 = list[fvIdx].x;
                var fv = list[--fvIdx].x;

                for (var grad = 0; grad < this.MAXGRADS; grad++) {
                    var coef = (fvPlus1 != fv) ? 1 / (fvPlus1 - fv) : 1;
                    var alphaV = list[fvIdx].y;
                    var alphaVPlus1 = list[fvIdxPlus1].y;

                    alpha[fi][grad] = 2 * grad * ((alphaVPlus1 * coef * (fi - fv)) + (alphaV * coef * (fvPlus1 - fi)));
                }
            }
        }

        return (alpha);
    }



    /* // 2D find maximum
     */



    this.computeAlphas = function (transferFunctionJoints) {
        var i, j;

        // for 2D histogram
        var alpha2D = new Array(this.MAXVALUES);
        var alpha2 = new Array(this.MAXVALUES);
        for (var i = 0; i < this.MAXVALUES; i++) {
            alpha2D[i] = new Array(this.MAXGRADS);
            alpha2[i] = new Array(this.MAXGRADS);
        }

        var alpha1D;
        var max1 = gradientObj.maxHistValGrad;

        if ((!transferFunctionJoints) || (transferFunctionJoints.length == 0)) {
            alpha1D = this.computeAlpha1D();
        }
        else {
            alpha1D = new Array(this.MAXVALUES);
            for (var idx = 0; idx < this.MAXVALUES; idx++) {
                alpha1D[idx] = this.plotData.line[idx].y;
            }
        }

        var sum = 0;
        for (i = 0; i < this.MAXVALUES; i++) {
            for (j = 0; j < this.MAXGRADS; j++) {
                var value = 1 - 3 * Math.pow(gradientObj.histValGrad[i][j] / max1, 0.22);
                sum += value;
                alpha2[i][j] = value;
            }
        }
        sum /= (this.MAXVALUES * this.MAXGRADS);	// mean hist height

        // Filter
        for (j = 0; j < this.MAXGRADS; j++) {
            var jMinus2 = (j > 1) ? (j - 2) : 0;
            var jMinus1 = (j > 0) ? (j - 1) : 0;
            var jPlus1 = (j < (this.MAXGRADS - 1)) ? (j + 1) : (this.MAXGRADS - 1);
            var jPlus2 = (j < (this.MAXGRADS - 2)) ? (j + 2) : (this.MAXGRADS - 1);
            for (i = 0; i < this.MAXVALUES; i++) {
                var value = (alpha2[i][jMinus2] + alpha2[i][jMinus1] + alpha2[i][j] + alpha2[i][jPlus1] + alpha2[i][jPlus2]) * 0.2;
                alpha2D[i][j] = value;
            }
        }
        for (i = 0; i < this.MAXVALUES; i++) {
            for (j = 0; j < this.MAXGRADS; j++) {
                value = alpha2D[i][j] * alpha1D[i];
                value = (this.MAXVALUES - 1) * (value + 0.8 - sum);
                alpha2D[i][j] = Math.min(Math.max(0, value), (this.MAXVALUES - 1));
            }
            alpha1D[i] *= (this.MAXVALUES - 1);
        }
        return { alpha1D: alpha1D, alpha2D: alpha2D };
    }

    this.computeHistGrad = function (volumeImage, transferFunctionJoints) {
        var alphas = this.computeAlphas(transferFunctionJoints);
        return { alpha1D: alphas.alpha1D, alpha2D: alphas.alpha2D };
    }
}
