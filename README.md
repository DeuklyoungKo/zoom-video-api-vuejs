# Zoom video api in vuejs
* It is for test of [Zoom Video SDK](https://marketplace.zoom.us/docs/api-reference/introduction/)

* You have to get a [Zoom Video SDK account](https://marketplace.zoom.us/docs/sdk/video/web/build/sample-app)
    
***
## Project setup
```
npm install
set .env file in root folder
    VUE_APP_SDK_KEY="[your sdk key]"
    VUE_APP_SDK_SECRET="[your sdk secret]"
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

***
## Used Api
[Font Awesome](https://fontawesome.com/v6/docs/web/use-with/vue/)


___
## Issue



* 2022-02-18 firefox 97.0.1, Microsoft Edge 98.0.1108.55 is not support MultipleVideos()  
ref) https://devforum.zoom.us/t/video-rendered-in-incorrect-position/57158/5

* 2022-02-17 Zoom video api is not working in chrome 98.0.4758.102, Microsoft Edge 98.0.1108.55 but Firefox is ok  
ref) https://devforum.zoom.us/t/invalid-parameters-you-must-pass-a-video-element-to-start-video-capture-for-chromium-browser/62011
```
{
    "type": "INVALID_PARAMETERS",
    "reason": "You must pass a <video> element to start video capture for Chromium browser, Android browser, and Chrome without SharedArrayBuffer support."
}
```
