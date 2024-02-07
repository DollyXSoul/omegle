import { useState, useEffect, useRef } from "react";
import Room from "./Room";

const Landing = () => {
  const [name, setName] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<null | MediaStreamTrack>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<null | MediaStreamTrack>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);

    if (!videoRef.current) return;

    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play;
  };

  useEffect(() => {
    if (videoRef && videoRef.current) getCam();
  }, [videoRef]);

  if (!joined) {
    return (
      <div>
        <video width={400} height={400} ref={videoRef} autoPlay />
        <input
          type="text"
          placeholder="userName"
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={() => setJoined(true)}>Join Room</button>
      </div>
    );
  }

  return (
    <Room
      name={name}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};

export default Landing;
