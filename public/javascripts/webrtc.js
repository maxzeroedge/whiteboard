var servers = [
	{url: "stun.l.google.com:19302"},
	{url: "stun1.l.google.com:19302"},
	{url: "stun2.l.google.com:19302"},
	{url: "stun3.l.google.com:19302"},
	{url: "stun4.l.google.com:19302}"
];

var rtcpc = createRTCPC(
	{
		iceServers: window.servers
	},
	{
		optional: [
			// FF/Chrome interop? https://hacks.mozilla.org/category/webrtc/as/complete/
			{ DtlsSrtpKeyAgreement: true }
		]
	}
);

rtcpc.onicecandidate = onIceCandidate;
rtcpc.onaddstream = onAddStream;


//Create RTC Peer Connection
function createRTCPC(config, optional){
	if(window.RTCPeerConnection) return new RTCPeerConnection(config, optional);
	else if(window.mozRTCPeerConnection) return new mozRTCPeerConnection(config, optional);
	else if(window.webkitRTCPeerConnection) return new webkitRTCPeerConnection(config, optional);
	throw new Error("RTC Peer Connection not available");
}

//Create RTC ICE Candidate
function createIceCan(candidate){
	if(window.RTCIceCandidate) return new RTCIceCandidate(candidate);
	else if(window.mozRTCIceCandidate) return new mozRTCIceCandidate(candidate);
	else if(window.webkitRTCIceCandidate) return new webkitRTCIceCandidate(candidate);
	throw new Error("RTC Ice Candidate not available");
}

//Create Session Description
function createSD(desc){
	if(window.RTCSessionDescription) return new RTCSessionDescription(desc);
	if(window.mozRTCSessionDescription) return new mozRTCSessionDescription(desc);
	if(window.webkitRTCSessionDescription) return new webkitRTCSessionDescription(desc);
	throw new Error("RTC Session Description not available");
}

//Signal to the server
function signal(dat){
	socket.emit("rtc_signal", dat);
}

//OnSignal
function onSignal(msg){
	if(msg.candidate){
		//If new candidate is received in message
		try{
			rtcpc.addIceCandidate(
				createIceCan({
					sdpMLineIndex: msg.candidate.sdpMLineIndex,
					candidate: msg.candidate.candidate
				})
			);
		}
		catch(err){console.log(err.stack||err);}
	}
	else if(msg.sdp){
		//If SDP received in message
		try{
			console.log('received sdp');
			rtcpc.setRemoteDescription(
				createSD(msg.sdp);
			);
			remoteSDPReceived();
		}
		catch(err){console.log(err.stack||err);}
	}
	else{console.log(msg);}
}

//On Ice Candidate added
function onIceCandidate(e){
	signal({candidate: e.candidate}); //Send ice candidate to server
}

//On Session Description Received
function onSessionDescription(desc){
	rtcpc.setLocalDescription(desc);
	signal({sdp: desc}); //Send session description to server
}

//On Add Stream
function onAddStream(e){
	/*stream = e.stream;
	if (window.webkitURL) {
		stream = webkitURL.createObjectURL(stream);
	}
	if (video.mozSrcObject !== undefined) {
		video.mozSrcObject = stream;
	}
	else {
		video.src = stream;
	}*/
	document.getElementById("OtherVid").src = window.URL.createObjectURL(e.stream);
}

//Send Offer to other Peer Client
//Line 135
function sendOffer() {
	return ASQ(function(done){
		rtcpc.createOffer(
			done,
			done.fail,
			{
				optional: [],
				mandatory: {}
			}
		);
	})
	.val(onSessionDescription);
}

//Send Answer to offering Peer Client
function sendAnswer() {
	return ASQ(function(done){
		rtcpc.createAnswer(
			done,
			done.fail,
			{
				optional: [],
				mandatory: {}
			}
		);
	})
	.val(onSessionDescription);
}

function getMediaStream(done) {
	ASQ(function(done){
		var media = h5.userMedia({
			video: true
		})
		.stream(function(stream){
			pc.addStream(media.raw_stream);
			done();
		});
	})
	.pipe(done);
}

function getRemoteSDP(done) {
	ASQ(function(done){
		remoteSDPReceived = done;
	})
	.pipe(done);
}

var remoteSDPReceived;

// *****************

var caller = false, steps;

/*socket = io.connect("/rtc",{
	"connect timeout": 3000,
	"reconnect": false
});*/

socket.on("disconnect",function(){
	steps.abort();
	$("#the_video").hide();
	setTimeout(function(){
		alert("Disconnected. Please refresh.");
	},100);
});


steps = ASQ()
.then(function(done){
	socket.on("signal",onSignal);
	socket.on("identify",done);
})
.then(function(done,identification){
	caller = identification;

	if (caller) {
		console.log("CALLER!!");

		ASQ(getMediaStream)
		.seq(sendOffer)
		.then(getRemoteSDP)
		.pipe(done);
	}
	else {
		console.log("RECEIVER!!");

		ASQ()
		.gate(
			getRemoteSDP,
			getMediaStream
		)
		.seq(sendAnswer)
		.pipe(done);
	}
})
.val(function(){
	$("#otherVid").show()[0].play();

	console.log("connection complete");
})
.or(function(err){
	console.log(err.stack || err);
});