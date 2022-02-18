import Vue from 'vue'
import App from './App.vue'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import specific icons */
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faUserSecret, faVideo, faVideoSlash, faMicrophoneLines, faMicrophoneLinesSlash, faChalkboardUser, faUserGear } from '@fortawesome/free-solid-svg-icons'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* add icons to the library */
library.add(faTwitter,faUserSecret,faVideo, faVideoSlash, faMicrophoneLines, faMicrophoneLinesSlash, faChalkboardUser, faUserGear)

/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
