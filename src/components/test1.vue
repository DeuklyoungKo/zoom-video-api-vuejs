<template>
  <div class="hello">
    <!-- <canvas class="video-canvas" id="video-canvas" ref="videocanvas"></canvas> -->
    <!-- <video class="js-preview-video" id="js-preview-video"></video> -->
    <div class="UserInfo">
      <h3>참여자 리스트</h3>
      <ul>
        <li>userId / displayName / isHost</li>
        <li v-for="(item, index) in participants" v-bind:key="index">
          {{item.userId}} / {{item.displayName}}
          <span v-if="item.isHost"> / 호스트</span>
        </li>
      </ul>      
    </div>
    <div class="VideoCanvas">
      <canvas id="my-video" width="640" height="360"></canvas>      
      <div v-if="this.stream !== null" >
        <button @click="startVideo()">Start Video</button>
        <button @click="stopVideo()">Stop Video</button>
      </div>
    </div>
    <div class="currentUserInfo">
      <div v-if="currentUser !== null">
        <h3>사용자 정보</h3>
        <span v-for="(item, index ) in currentUser" :key="index">
          {{index}}:{{item}}<br>
        </span>
      </div>        
    </div>

  </div>
</template>

<script>
import ZoomVideo, { ConnectionState } from '@zoom/videosdk';
import { KJUR } from 'jsrsasign';
import dotenv from 'dotenv';

export default {
  name: 'test1',
  props: {
    msg: String
  },
  data() {
      return {
        // SDK_KEY: "hsdkxZJ6xnVoUC0y9EYTG5dlyhopWGZIRNMB",
        // SDK_SECRET: "hWP5dgZ4X4ecD1czdXjKqm66Ngy7rTbLsNA6",
        SDK_KEY: null,
        SDK_SECRET: null,
        session_name : "test",
        session_password : "1234",
        userName : "tester",

        client : null,
        canvas : null,
        stream : null,
        participants:[],
        currentUser : null,
      }
  },
  created(){
    dotenv.config()
    console.log("created");
    console.log(process.env);

    this.SDK_KEY = process.env.VUE_APP_SDK_KEY
    this.SDK_SECRET = process.env.VUE_APP_SDK_SECRET
    console.log("key");
    console.log(this.SDK_KEY);
    console.log(this.SDK_SECRET);
  },
  mounted(){
    this.init()    
  },
  computed:{
    newSessionName(){
      return this.session_name + new Date().getTime();
    },
    currentUserInfoList(){
      return Object.entries(this.currentUser)
    }
  },
  methods: {
    async init(){


/** 회의실 입장전0 **/
/*
      // const zmClient = ZoomVideo.createClient();
      // const audioTrack = ZoomVideo.createLocalAudioTrack();
      const videoTrack = ZoomVideo.createLocalVideoTrack();

      const PREVIEW_VIDEO_ELEMENT = document.getElementById('js-preview-video');
        const togglePreviewVideo = async () => videoTrack.start(PREVIEW_VIDEO_ELEMENT)


       try {
            await togglePreviewVideo();
        } catch (e) {
            console.error('Error toggling video preview');
            console.log(e);
        }
*/
      // const VIDEO_QUALITY_90P = 0;
      // const VIDEO_QUALITY_360P = 2;
      // const VIDEO_QUALITY_720P = 3;    // not supported * yet *
      // const VIDEO_CANVAS = document.getElementById('video-canvas');

      const VIDEO_QUALITY_180P = 1;      
      const VIDEO_CANVAS_DIMS = {
          Width: 1280,
          Height: 640,
      };



      const signature = this.generateVideoToken(
                        this.SDK_KEY,
                        this.SDK_SECRET,
                        this.session_name,
                        this.session_password
                      );
      console.log(signature);

      this.client = ZoomVideo.createClient();
      this.client.init('en-US', 'Global');

      this.client.on('connection-change', (payload) => {
        console.log("connection-change");
        console.log(payload);
        console.log(ConnectionState.Connected);

        if (payload.state === ConnectionState.Connected) {
          console.log("ZoomVideo.Connected");
          // handle connected
          this.stream = this.client.getMediaStream();
          console.log(this.stream);
        } else if(payload.state === ConnectionState.Reconnecting){
          console.log("ZoomVideo.Reconnecting");
          // handle failover
        }
      });




      await this.client.join(
        this.session_name,
        signature,
        this.newSessionName,
        this.session_password
      ).then((data) => {
        console.log(data);
        this.participants = this.client.getAllUser()
      }).catch((error) => {
        console.log(error);
      });



      this.client.on('user-updated', () => {
        // const participants = this.client.getParticipantsList()
        this.participants = this.client.getAllUser()
        // handleParticipantsChange(participants)
        console.log("participants");
        console.log(this.participants);
      });
      this.client.on('user-removed', () => {
        this.participants = this.client.getAllUser();
        // handleParticipantsChange(participants);
      });


      this.currentUser = this.client.getCurrentUserInfo();

      console.log(VIDEO_QUALITY_180P);
      console.log(VIDEO_CANVAS_DIMS);

/*

      const stream = this.client.getMediaStream();

      console.log("stream.isCaptureForbidden()");
      console.log(stream.isCaptureForbidden());

      if (stream.isCaptureForbidden()) {
        alert('We cannot start video without the permission to access camera.');
      }

      stream.startAudio().then(() => console.log('join audio'));





      const currentUser = this.client.getCurrentUserInfo();
      console.log("currentUser");
      console.log(currentUser);

      let participants = this.client.getAllUser();
      console.log("participants");
      console.log(participants);


      console.log('this.client');
      console.log(this.client);


      let renderedList = [];
      let page = 0;
      let pageSize = 5;
      const VIDEO_CANVAS = document.querySelector('.video-canvas'); // canvas to render the video
//      const VIDEO_CANVAS = this.$refs.videocanvas // canvas to render the video


      console.log("VIDEO_CANVAS1");
      console.log(VIDEO_CANVAS);



      const handleParticipantsChange = (participants) => {
        const pageParticipants = participants.filter(
          (user, index) => Math.floor(index / pageSize) === page
        );
        const videoParticipants = pageParticipants.filter((user) => user.bVideoOn);
        const removedVideoParticipants = renderedList.filter(
          (user) =>
            videoParticipants.findIndex((user2) => user2.userId === user.userId) ===
            -1
        );
        if (removedVideoParticipants.length > 0) {
          removedVideoParticipants.forEach(async (user) => {
            await stream.stopRenderVideo(VIDEO_CANVAS, user.userId);
          });
        }
        const addedVideoParticipants = videoParticipants.filter(
          (user) =>
            renderedList.findIndex((user2) => user2.userId === user.userId) === -1
        );
        if (addedVideoParticipants.length > 0) {
          addedVideoParticipants.forEach(async (user) => {

            console.log("VIDEO_CANVAS3");
            console.log(VIDEO_CANVAS);
            // render new video
            await stream.renderVideo(
              VIDEO_CANVAS,
              user.userId,
              VIDEO_CANVAS_DIMS.Width / 2,
              VIDEO_CANVAS_DIMS.Height,
              VIDEO_CANVAS_DIMS.Width / 2,
              0,
              VIDEO_QUALITY_180P
            );
          });
        }
        renderedList = videoParticipants;
      };



      this.client.on('peer-video-state-change', async (payload) => {

        console.log("peer-video-state-change");
        console.log(VIDEO_CANVAS);

        const { action, userId } = payload;
        console.log(payload);

        if (action === 'Start') {
          await stream.renderVideo(VIDEO_CANVAS, userId, VIDEO_CANVAS_DIMS.Width / 2, VIDEO_CANVAS_DIMS.Height, VIDEO_CANVAS_DIMS.Width / 2, 0, VIDEO_QUALITY_180P);
        } else if (action === 'Stop') {
          await stream.stopRenderVideo(VIDEO_CANVAS);
        }
      });











      this.client.on('auto-play-audio-failed', () => {
        console.log('auto play failed, waiting user interaction');
      });

      this.client.on('unmute-audio-consent',(payload)=>{
        console.log('Host ask me to unmute');
        console.log(payload);
      });

      this.client.on('device-change', () => {
        // get the latest devices
        const microphones = stream.getMicList();
        const speakers = stream.getSpeakerList();
        console.log('device-change');
        console.log(microphones);
        console.log(speakers);
      });


      // new participant joins the meeting
      this.client.on('user-added', (payload) => {
        payload.forEach((item) => {
          console.log('participant %s joins the meeting', item.displayName);
        });
        // get the latest participants list
        participants = this.client.getAllUser();
        console.log("user-added participants");
        console.log(participants);        
      });
      this.client.on('user-updated', (payload) => {
        // participant has been updated, for example rename, raise hand etc.
        console.log("user-updated");
        console.log(payload);
      });
      this.client.on('user-removed', (payload) => {
        // participant left the meeting, for example, from the waiting room or due to failover. Check the reason property for details.
        payload.forEach((item) => {
          console.log(`participant %s left the meeting.`, item.userId);
        });
      });
 */


    },


    generateVideoToken(sdkKey, sdkSecret, topic, password = '') {
      let signature = '';
      // try {
      const iat = Math.round(new Date().getTime() / 1000);
      const exp = iat + 60 * 60 * 2;

      // Header
      const oHeader = { alg: 'HS256', typ: 'JWT' };
      // Payload
      const oPayload = {
        app_key: sdkKey,
        iat,
        exp,
        tpc: topic,
        pwd: password,
      };
      // Sign JWT
      const sHeader = JSON.stringify(oHeader);
      const sPayload = JSON.stringify(oPayload);
      signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);
      return signature;
    },

    async startVideo() {


      const canvas = document.querySelector('#my-video')
      const canvasWidth = 640;
      const canvasHeight = 360;
      const xOffset = 0;
      const yOffset = 0;
      const videoQuality = 2;

      if (!this.stream.isCapturingVideo()) {
        try {
          console.log("this.stream.isCapturingVideo() false");
          await this.stream.startVideo();

          const session = this.client.getSessionInfo();
          this.stream.renderVideo(canvas, session.userId, canvasWidth, canvasHeight, xOffset, yOffset, videoQuality);
        } catch (error) {
          console.log(error);
        }
      }
    },

    async stopVideo() {

      const canvas = document.querySelector('#my-video')

      if (this.stream.isCapturingVideo()) {
        try {
          await this.stream.stopVideo();

          const session = this.client.getSessionInfo();
          this.stream.stopRenderVideo(canvas, session.userId);
        } catch (error) {
          console.log(error);
        }
      }
    }

 
  }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.video-canvas {
  width:1600px;
  height:900px;
  border:solid 1px red;
}

#my-video {
  border:solid 1px red;
  /* width:640px;
  height:360px; */
}

.hello{
  display: flex;
  height:360px;
}

.UserInfo{
  border:solid 1px red;
  width:400px;
  height:100%;
}

.UserInfo ul li{
  text-align: left;
}

.currentUserInfo{
  border:solid 1px red;
  padding:0 0 0 10px;
  width:300px;
  height:100%;
  text-align: left;
}
</style>
