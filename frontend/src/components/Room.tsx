import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const socket = io(URL);

    socket.on("send-offer", ({ roomId }) => {
      setLobby(false);
      alert("Send offer please");
      socket.emit("offer", {
        sdp: "",
        roomId,
      });
    });

    socket.on("offer", ({ roomId, offer }) => {
      setLobby(false);
      alert("Send answer please");
      socket.emit("answer", {
        sdp: "",
        roomId,
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      setLobby(false);
      alert("connection done");
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    setSocket(socket);
  }, [name]);

  if (lobby) return <div>Waiting for someone to join with you</div>;

  return (
    <div>
      <video width={400} height={400} />
      <video width={400} height={400} />
    </div>
  );
};

export default Room;
