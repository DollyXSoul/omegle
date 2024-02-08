import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const URL = "http://localhost:3000";

interface RoomProps {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}

const Room = ({ name, localAudioTrack, localVideoTrack }: RoomProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>();
  const [recievingPc, setRecievingPc] = useState<null | RTCPeerConnection>();
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<null | MediaStreamTrack>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<null | MediaStreamTrack>(null);

  const localVideoRef = useRef<null | HTMLVideoElement>(null);
  const remoteVideoRef = useRef<null | HTMLVideoElement>(null);

  useEffect(() => {
    const socket = io(URL);

    socket.on("send-offer", ({ roomId }) => {
      console.log("Sending offer 1");
      setLobby(false);
      const pc = new RTCPeerConnection();

      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }
      setSendingPc(pc);

      pc.onicecandidate = async (e) => {
        console.log("generating ice candidates locally");

        socket.emit("add-ice-candidate", {
          candidate: e.candidate,
          type: "sender",
          roomId,
        });
      };

      pc.onnegotiationneeded = async () => {
        console.log("negotiating ice candidates and creating offer");

        const sdp = await pc.createOffer();

        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("received offer");
      setLobby(false);

      const pc = new RTCPeerConnection();

      pc.setRemoteDescription(remoteSdp);

      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp);

      const stream = new MediaStream();

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteMediaStream(stream);

      setRecievingPc(pc);

      pc.onicecandidate = async (e) => {
        console.log("generating ice candidates on the reciever side");

        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      pc.ontrack = (e: RTCTrackEvent) => {
        console.log("Inside ontrack");

        const { track } = e;

        setRemoteMediaStream(e.streams[0]);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteMediaStream;
        }

        // @ts-ignore
        // remoteVideoRef.current.srcObject.addTrack(track);
        //@ts-ignore
        remoteVideoRef.current.play();
      };
      socket.emit("answer", {
        sdp,
        roomId,
      });
    });

    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
      console.log("loop closed");
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type, roomId }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, type, roomId });
      if (type == "sender") {
        setRecievingPc((pc) => {
          if (!pc) console.log("receiving pc not found");
          else console.log("Inside this 1");
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          if (!pc) {
            console.error("sending pc nout found");
          } else {
            console.error("Inside this 2");
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });

    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  if (lobby) return <div>Waiting for someone to join with you</div>;

  return (
    <div>
      <video width={400} height={400} ref={localVideoRef} autoPlay muted />
      <video width={400} height={400} ref={remoteVideoRef} autoPlay />
    </div>
  );
};

export default Room;
