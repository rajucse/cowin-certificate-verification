# cowin-certificate-verification

Verify covid vaccination certificate downloaded from cowin portal as backend service. 

## Installation
    npm install rajucse/cowin-certificate-verification

For installation of canvas please refer this <a href="https://www.npmjs.com/package/canvas" target="_blank">link</a>.

## Usage
You can pass public url, local file path, buffer or base64 of certificate pdf

    const cowin = require('cowin-verification');
    cowin.index(WEB_URL_OR_LOCAL_PATH_OF_CERTIFICATE_PDF)


    
