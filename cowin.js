const {fromBase64, fromBuffer} = require("pdf2pic");
const scanImageData = require("zbar.wasm").scanImageData;
const {createCanvas, loadImage} = require('canvas');
const fetch = require('fetch-base64');
const options = {
    quality: 1500,
    density: 330,
    format: 'jpeg',
    width: 595,
    height: 842
};
const JSZip = require("jszip");

const pageToConvertAsImage = 1;
const CERTIFICATE_FILE = "certificate.json";

class Cowin {
    getImageData = async (src) => {
        const img = await loadImage(Buffer.from(src, "base64"));
        const returnData = [];
        let canvas, ctx;

        canvas = createCanvas(img.width, img.height);
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, -0, 0, img.width, img.height);
        returnData.push(ctx.getImageData(0, 0, img.height, img.height))

        canvas = createCanvas(400, 400);
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, -200, -450, img.width, img.height);
        returnData.push(ctx.getImageData(0, 0, 400, 400))

        return returnData;
    };

    async index(param) {
        let storeAsImage;
        if (this.isBuffer(param)) {
            storeAsImage = fromBuffer(param, options);

        } else if (this.isBase64(param)) {
            storeAsImage = fromBase64(param, options);
        } else {
            const data = await fetch.auto(param);
            storeAsImage = fromBase64(data[0], options);
        }
        const base64Response = await storeAsImage(pageToConvertAsImage, true);
        return this.verify(base64Response.base64);
    }

    isBuffer(value) {
        return Buffer.isBuffer(value);
    }

    isValidUrl(value) {
        try {
            new URL(value)
            return true;
        } catch (err) {
            return false;
        }
    }

    isLocalPath(value) {
        return false;

    }

    isBase64(value) {
        return false;
    }


    async verify(base64) {
        const response = {
            IsValidCertificate: false,
            Error: null,
            Data: null
        }
        try {
            const imgArray = await this.getImageData(base64);
            for (const img of imgArray) {
                const res = await scanImageData(img);
                // console.log(res);
                if (res.length) {
                    const zip = new JSZip();
                    const data = await (await zip.loadAsync(res[0].decode())).files[CERTIFICATE_FILE].async('text');
                    const signedData = JSON.parse(data);
                    response.IsValidCertificate = true;
                    response.Data = signedData.credentialSubject;
                }
            }
        } catch (err) {
            console.log(err);
            response.IsValidCertificate = false;
            response.Error = err;
        }
        return response;
    }
}

module.exports = new Cowin();