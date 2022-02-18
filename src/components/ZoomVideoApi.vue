<template>
  <div class="hello">
    <!-- <canvas class="video-canvas" id="video-canvas" ref="videocanvas"></canvas> -->
    <!-- <video class="js-preview-video" id="js-preview-video"></video> -->
    <div class="UserInfo">
      <h3>참여자 리스트<br>(userId / displayName / isHost)</h3>
      <ul>
        <li v-for="(item, index) in participants" v-bind:key="index">
          {{item.userId}} / {{item.displayName}}
          <span v-if="item.isHost"> / <span class="host">호스트</span></span>
          <span v-if="!item.isHost && currentUser !== null && currentUser.isHost"><button @click="makeHost(item.userId)">호스트교체</button></span>
          <font-awesome-icon v-if="item.bVideoOn" icon="fa-solid fa-video" />
          <font-awesome-icon v-else icon="fa-solid fa-video-slash" />
          <font-awesome-icon v-if="item.muted" icon="fa-solid fa-microphone-lines-slash" />
          <font-awesome-icon v-else icon="fa-solid fa-microphone-lines" />
          <!-- <font-awesome-icon v-if="item.isHost" icon="fa-solid fa-chalkboard-user" /> -->
          <font-awesome-icon v-if="item.isManager" icon="fa-solid fa-user-gear" />
          
        </li>
      </ul>      
    </div>
    <div class="VideoCanvas">
      <canvas id="my-video" width="320" height="180"></canvas>
      <canvas class="video-canvas" width="640" height="360"></canvas>
      <canvas class="video-canvas2" width="640" height="360"></canvas>
      <div v-if="this.stream !== null" >
        <button @click="startVideo()">Start Video</button>
        <button @click="stopVideo()">Stop Video</button>
        <button @click="leaveSession()">Leave Session</button>

        <button v-if="currentUser !== null && currentUser.isHost" @click="endSession()">End Session</button>
      </div>
    </div>
    <div class="currentUserInfo">
      <div v-if="currentUser !== null">
        <h3>사용자 정보
          <span v-if="currentUser.isHost" class="host">(호스트)</span>
        </h3>
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
  name: 'ZoomVideoApi',
  props: {
    msg: String
  },
  data() {
      return {
        // SDK_KEY: "hsdkxZJ6xnVoUC0y9EYTG5dlyhopWGZIRNMB",
        // SDK_SECRET: "hWP5dgZ4X4ecD1czdXjKqm66Ngy7rTbLsNA6",
        SDK_KEY: null,
        SDK_SECRET: null,
        session_name : "세션네임",
        session_password : "1234",
        userName : "tester",

        client : null,
        canvas : null,
        stream : null,
        participants:[],
        currentUser : null,
        VIDEO_QUALITY_180P : 1,
        VIDEO_CANVAS_DIMS : {
          Width: 1280,
          Height: 640,
        } ,
        VIDEO_CANVAS : null,
        renderedList :[],
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
  unmounted(){
    if(this.client.isHost()){
      this.client.leave(true);
    }else{
      this.client.leave();
    }
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

      // const VIDEO_QUALITY_180P = 1;      
      // const VIDEO_CANVAS_DIMS = {
      //     Width: 1280,
      //     Height: 640,
      // };

      this.VIDEO_CANVAS = document.querySelector('.video-canvas'); // canvas to render the video

      const signature = this.generateVideoToken(
                        this.SDK_KEY,
                        this.SDK_SECRET,
                        this.session_name,
                        this.session_password
                      );
      console.log(signature);

      this.client = ZoomVideo.createClient();

      const videoSDKLibDir = '/node_modules/@zoom/videosdk/dist/lib';
      console.log("videoSDKLibDir");
      console.log(videoSDKLibDir);
      console.log(window.location.origin);
      console.log(`${window.location.origin}${videoSDKLibDir}`);


      this.client.init('en-US', 'Global');
      // this.client.init('en-US', videoSDKLibDir);
      // this.client.init("en-US",`${window.location.origin}${videoSDKLibDir}`,);

      await this.client.join(
         this.session_name,
        signature,
        this.newSessionName,
        this.session_password
      ).then((data) => {
        console.log("client join");
        console.log(data);
        this.participants = this.client.getAllUser()
      }).catch((error) => {
        console.log(error);
      });

      this.currentUser = this.client.getCurrentUserInfo();
      this.stream = this.client.getMediaStream();
      this.stream.startAudio().then(() => console.log('join audio'));

      console.log("this.stream.isSupportMultipleVideos()");
      console.log(this.stream.isSupportMultipleVideos());



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


      this.client.on('user-updated', () => {
        console.log("user-updated on");

        this.participants = this.client.getAllUser()
        // handleParticipantsChange(this.participants)
        console.log("participants");
        console.log(this.participants);        
        this.handleParticipantsChange()
      });
      this.client.on('user-removed', () => {
        console.log("user-removed on");

        this.participants = this.client.getAllUser();
        // handleParticipantsChange(this.participants);
        this.handleParticipantsChange()
      });

      this.client.on('user-added', (payload) => {
        console.log("user-added on");

        payload.forEach((item) => {
          console.log('participant %s joins the meeting', item.displayName);
        });
        // get the latest participants list
        this.participants = this.client.getAllUser();
        console.log("user-added participants");
      });

/*
      console.log("stream.isCaptureForbidden()");
      console.log(stream.isCaptureForbidden());

      if (stream.isCaptureForbidden()) {
        alert('We cannot start video without the permission to access camera.');
      }

      console.log("VIDEO_CANVAS1");
      console.log(VIDEO_CANVAS);
 */

      this.client.on('peer-video-state-change', async (payload) => {

        // console.log("peer-video-state-change");
        // console.log(this.VIDEO_CANVAS);

        const { action, userId } = payload;

        // console.log(payload);
        console.log(action +" / "+userId);

        if (action === 'Start') {
          // await this.stream.renderVideo(this.VIDEO_CANVAS, userId, this.VIDEO_CANVAS_DIMS.Width / 2, this.VIDEO_CANVAS_DIMS.Height, this.VIDEO_CANVAS_DIMS.Width / 2, 0, this.VIDEO_QUALITY_180P);
        } else if (action === 'Stop') {
          // await this.stream.stopRenderVideo(this.VIDEO_CANVAS);
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
        const microphones = this.stream.getMicList();
        const speakers = this.stream.getSpeakerList();
        console.log('device-change');
        console.log(microphones);
        console.log(speakers);
      });

    },

    handleParticipantsChange(){

      console.log("handleParticipantsChange");

      let participants = this.participants

      // let renderedList = [];
      let page = 0;
      let pageSize = 5;

      // 접속자 중 현재 페이지에 해당 되는 사람 리스트만
      const pageParticipants = participants.filter(
        (user, index) => Math.floor(index / pageSize) === page
      );

      console.log("pageParticipants");
      console.log(pageParticipants);
      // 현재 페이지 대상 사람 중 비디오가 켜져 있는 것만 따로 리스트 만듬
      const videoParticipants = pageParticipants.filter((user) => user.bVideoOn);
      // 기존 리스트에서 비디오가 안 켜져 있는 사람 리스트 만듬
      const removedVideoParticipants = this.renderedList.filter(
        (user) => videoParticipants.findIndex((user2) => user2.userId === user.userId) === -1);
      // 제거해야 하는 비디오가 있다면 해당 비디오는 랜더링 중지
      if (removedVideoParticipants.length > 0) {
        removedVideoParticipants.forEach(async (user) => {
          await this.stream.stopRenderVideo(this.VIDEO_CANVAS, user.userId);
        });
      }

      const this_renderedList = this.renderedList
      // 해당 페이지 비디오 켜져 있는 사람 중에 랜더링 안된 비디오 리스트 만듬
      const addedVideoParticipants = videoParticipants.filter(
        (user) =>
          this_renderedList.findIndex((user2) => user2.userId === user.userId) === -1
      );
      console.log("addedVideoParticipants");
      console.log(addedVideoParticipants);

      // 추가 랜더링 해야하는 사람이 있으면
      if (addedVideoParticipants.length > 0) {

        // const THIS_VIDEO_CANVAS = this.VIDEO_CANVAS
        // const THIS_VIDEO_CANVAS_DIMS = this.VIDEO_CANVAS_DIMS
        // const THIS_VIDEO_QUALITY_180P = this.VIDEO_QUALITY_180P
       
        let this_renderedList = this.renderedList
        addedVideoParticipants.forEach(async (user, index) => {
      // const canvasWidth = 640;
      // const canvasHeight = 360;
      // const xOffset = 0;
      // const yOffset = 0;
      // const videoQuality = 2;

          try {
            // render new video
            // await this.stream.renderVideo(
            //   THIS_VIDEO_CANVAS,
            //   user.userId,
            //   THIS_VIDEO_CANVAS_DIMS.Width / 2,
            //   THIS_VIDEO_CANVAS_DIMS.Height,
            //   THIS_VIDEO_CANVAS_DIMS.Width / 2,
            //   0,
            //   THIS_VIDEO_QUALITY_180P
            // );

            console.log("renderVideo : " + user.userId);
            console.log(index);
            let THIS_VIDEO_CANVAS = null
            if(this_renderedList.length === 0){
              THIS_VIDEO_CANVAS = document.querySelector('.video-canvas')            
            }else{
              THIS_VIDEO_CANVAS = document.querySelector('.video-canvas2')
            }

            console.log("THIS_VIDEO_CANVAS");
            console.log(THIS_VIDEO_CANVAS);

            await this.stream.renderVideo(
              THIS_VIDEO_CANVAS,
              user.userId,
              320,
              180,
              320*index,
              180,
              2
            );

          } catch (error) {
            console.log("addedVideoParticipants error");
            console.log(error);
          }
        });
      }
      this.renderedList = videoParticipants;
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

      console.log("startVideo start");
      const canvas = document.querySelector('#my-video')
      const canvasWidth = 320;
      const canvasHeight = 180;
      const xOffset = 0;
      const yOffset = 0;
      const videoQuality = 2;

      if (!this.stream.isCapturingVideo()) {
        try {
          console.log("this.stream.isCapturingVideo() false");
          await this.stream.startVideo();

          const session = this.client.getSessionInfo();

          this.stream.renderVideo(canvas, session.userId, canvasWidth, canvasHeight, xOffset, yOffset, videoQuality);
          console.log("session");
          console.log(session);
        } catch (error) {
          console.log(error);
        }
      }
    },

    async stopVideo() {
        console.log("stopVideo start");

      // const canvas = document.querySelector('#my-video')

      if (this.stream.isCapturingVideo()) {
        try {
          await this.stream.stopVideo();

          const session = this.client.getSessionInfo();
          this.stream.stopRenderVideo(this.VIDEO_CANVAS, session.userId);
        } catch (error) {
          console.log(error);
        }
      }
    },

    async makeHost(newHostUserId){
      try {
        await this.client.makeManager(newHostUserId);
      } catch (error) {
        console.log(error);
      }        
    },

    async leaveSession(){
      try {
        await this.client.leave();
      } catch (error) {
        console.log(error);
      }        
    },
    async endSession(){
      try {
        await this.client.leave(true);
      } catch (error) {
        console.log(error);
      }        
    }    
  }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.video-canvas {
  width:640px;
  height:360px;
  border:solid 1px red;
}

.video-canvas2 {
  width:640px;
  height:360px;
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
  width:500px;
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

.host{
  color:red;
}
</style>
