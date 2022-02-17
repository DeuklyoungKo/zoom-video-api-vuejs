# Zoom video api in vuejs

#### It is for test

## Project setup
```
npm install
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



### issue

* 2022-02-17 Zoom video api is not working in chrome but Firefox is ok  
ref) https://devforum.zoom.us/t/invalid-parameters-you-must-pass-a-video-element-to-start-video-capture-for-chromium-browser/62011
```
{
    "type": "INVALID_PARAMETERS",
    "reason": "You must pass a <video> element to start video capture for Chromium browser, Android browser, and Chrome without SharedArrayBuffer support."
}
```
