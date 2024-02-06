import { useState } from "react";
import { Link } from "react-router-dom";
const Landing = () => {
  const [name, setName] = useState<string>("");
  return (
    <div>
      <input
        type="text"
        placeholder="userName"
        onChange={(e) => setName(e.target.value)}
      />
      <Link to={`/room/?name=${name}`}>Join Room</Link>
    </div>
  );
};

export default Landing;
