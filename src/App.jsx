import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([
    {
      role: "system",
      content:
        "You are an agent for an application that where people can upload their documents and ask questions about them. These documents are stored in a database you have access to. Read the queries from the user clearly try it understand it the best you can and formulate then return an appropriate answer based on the received data. Remove all hashtags and any symbols. Make sure the text is properly structured. Only answer question about the document that is being uploaded. If you haven't found any information related to the question, say 'i don't know'",
    },
  ]);
  const [query, setQuery] = useState("");

  const handleFileUpload = async (e) => {
    setLoading(true);
    setMessage("File is being uploaded and vectorized...");
    let file = e.target.files[0];
    let formData = new FormData();
    formData.append("file", file);

    await axios
      .post("http://127.0.0.1:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.valid == true) {
          setMessage("Upload was Successful");
          console.log(res.data.chunks);
        } else {
          setMessage("An error occured");
        }
        setLoading(false);
      });
  };

  const send = async () => {
    setLoading(true);
    setMessage('')
    const container = document.getElementById("scrollableDiv");
    const textarea = document.getElementById("textarea");
    textarea.innerText = ""
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    let tempConversation = conversations;
    tempConversation.push({ role: "user", content: query });
    console.log(tempConversation)
    setConversations(tempConversation);
    await axios
      .post("http://127.0.0.1:8000/send", {
        content: query,
        conversation: tempConversation,
      })
      .then((res) => {
        // alert(JSON.stringify(res.data))
        console.log(res.data.message);
        let tempMessages = conversations;
        tempMessages.push(res.data.message);
        setConversations(tempConversation)
        setLoading(false);
        const container = document.getElementById("scrollableDiv");
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      });
  };

  return (
    <>
      <h1 className="text-black text-3xl font-bold my-5">RAG Test</h1>
      <div id="scrollableDiv" className="message-container w-full overflow-y-auto  p-10 text-black border-2 border-black rounded-md">
        {conversations.map(item => <div key={item.content} className="my-5 items-center min-w-full space-x-2">
          {item.role == 'user' && <div className="relative text-left   bg-blue-500 text-white p-4 rounded-lg">
            <p className="font-bold">{item.role}</p>
            <p>{item.content}</p>
          </div>}

          {item.role == 'assistant' && <div className="relative text-left   bg-green-600 text-white p-4 rounded-lg">
            <p className="font-bold ">{item.role}</p>
            <p>{item.content}</p>
          </div>}
        </div>)}
        
      </div>
      <textarea
        onInput={(e) => setQuery(e.target.value)}
        id="textarea"
        className=" w-full mt-5 text-black p-2 border-2 bg-white border-gray-500 "
      ></textarea>
      <button
        onClick={() => send()}
        className="px-4 mt-5  py-2 w-full bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        Send
      </button>
      <input
        onInput={(e) => handleFileUpload(e)}
        type="file"
        className="px-4 mt-10  py-2 text-black font-semibold rounded-lg shadow-md "
      />
      <p className="text-black mt-3">{message}</p>{" "}
      {loading == true && <div className="loader"></div>}
    </>
  );
}

export default App;
